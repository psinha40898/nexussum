import { readFileSync, writeFileSync } from "fs"
import { generateObject, generateText, LanguageModelV1 } from "ai"
import { openai } from "@ai-sdk/openai"
import { google } from '@ai-sdk/google';
import { z } from "zod"
import dotenv from "dotenv"
import { P_COT_SYSTEM_PROMPT, P_COT_generatePrompt, P_SYSTEM_PROMPT, P_generatePrompt, S_SYSTEM_PROMPT, S_generatePrompt, C_SYSTEM_PROMPT, C_generatePrompt } from "./prompts/nexus-sum"
import { join } from 'path';
import { ProcessedChunkSchema, SceneSchema, Scene, SummarySchema, MetaSummarySchema } from "./types/nexus-sum"
import { chunkBySentences, chunkPreprocessedScenes, chunkScenes, sentenceChunker, countWords } from "./deterministic/nexus-sum.ts";
dotenv.config()

async function nexusPreProcessor(inputPath: string, outputPath: string, model: LanguageModelV1): Promise<Scene[]> {
    try {
        const data = readFileSync(inputPath, "utf8")
        const chunks: string[][] = JSON.parse(data)
        const allProcessedScenes: Scene[] = []

        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i]
            console.log(`\n=== Processing chunk ${i + 1}/${chunks.length} with ${chunk.length} scenes ===`)

            // Create a dynamic schema with exact scene count validation
            // const DynamicChunkSchema = z.object({
            //     scenes: z.array(SceneSchema).length(chunk.length).describe("Array of processed scenes"),
            // })

            const DynamicChunkSchema = z.object({
                scenes: z.array(SceneSchema)
                    .min(1)  // At least 1 scene
                    .describe("Array of processed scenes"),
            })

            const cot = await generateText({
                model: model,
                system: P_COT_SYSTEM_PROMPT,
                prompt: P_COT_generatePrompt(chunk),
                maxTokens: 10000,
            })

            console.log("STRAT", P_generatePrompt(chunk, cot.text));

            // Process the chunk using generateObject with Zod schema
            const result = await generateObject({
                model: model,
                schema: DynamicChunkSchema,
                system: P_SYSTEM_PROMPT,
                prompt: P_generatePrompt(chunk, cot.text),
                maxTokens: 10000,
            })

            console.log(`Processed ${result.object.scenes.length} scenes in chunk ${i + 1}`)

            // Add the processed scenes to our collection
            allProcessedScenes.push(...result.object.scenes)
        }

        console.log(`\n🎯 Final Results:`)
        console.log(`Total input scenes: ${chunks.flat().length}`)
        console.log(`Total output scenes: ${allProcessedScenes.length}`)

        // Save as array of individual scenes
        writeFileSync(outputPath, JSON.stringify(allProcessedScenes, null, 2))
        return allProcessedScenes
    } catch (error) {
        console.error("Error processing:", error)
        throw error
    }
}

async function nexusSummarizer(inputPath: string, outputPath: string, model: LanguageModelV1): Promise<string> {
    try {
        const data = readFileSync(inputPath, "utf8")
        const chunks: Scene[][] = JSON.parse(data)
        const allSummaries: string[] = []

        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i]
            console.log(`\n=== Summarizing chunk ${i + 1}/${chunks.length} with ${chunk.length} scenes ===`)
            console.log(S_generatePrompt(chunk));

            // Process the chunk using generateObject with Zod schema
            const result = await generateObject({
                model: model,
                schema: SummarySchema,
                system: S_SYSTEM_PROMPT,
                prompt: S_generatePrompt(chunk),
            })

            console.log(`Generated summary for chunk ${i + 1}`)

            // Add the summary to our collection
            allSummaries.push(result.object.summary)
        }

        // Concatenate all summaries
        const initialSummary = allSummaries.join("\n\n")

        console.log(`\n🎯 Final Results:`)
        console.log(`Processed ${chunks.length} chunks`)
        console.log(`Generated initial summary with ${initialSummary.split(/\s+/).length} words`)

        // Save the initial summary
        writeFileSync(outputPath, initialSummary)
        return initialSummary
    } catch (error) {
        console.error("Error summarizing:", error)
        throw error
    }
}

async function nexusCompressor(
    inputPath: string,
    outputPath: string,
    delta: number,
    theta: number,
    maxIterations: number = 10,
    model: LanguageModelV1
): Promise<string> {
    try {
        const initialSummary = readFileSync(inputPath, "utf8")
        const initialChunks = chunkBySentences(initialSummary, delta)

        let currentSummary = initialSummary
        let currentWordCount = countWords(currentSummary)

        console.log(`\n=== Starting Iterative Compression ===`)
        console.log(`Initial summary: ${currentWordCount} words`)
        console.log(`Target length: ${theta} words`)

        let iteration = 1
        while (currentWordCount > theta && iteration <= maxIterations) {
            console.log(`\n--- Iteration ${iteration} ---`)

            const chunks = chunkBySentences(currentSummary, delta)
            console.log(`Split into ${chunks.length} chunks for compression`)

            const compressedChunks: string[] = []

            for (let i = 0; i < chunks.length; i++) {
                const chunk = chunks[i]
                console.log(`Compressing chunk ${i + 1}/${chunks.length}...`)

                const result = await generateObject({
                    model: model,
                    schema: MetaSummarySchema,
                    system: C_SYSTEM_PROMPT,
                    prompt: C_generatePrompt(chunk, theta),
                })

                compressedChunks.push(result.object.metaSummary)
            }

            const newSummary = compressedChunks.join("\n\n")
            const newWordCount = countWords(newSummary)

            console.log(`Iteration ${iteration} complete:`)
            console.log(`- Previous: ${currentWordCount} words`)
            console.log(`- Current: ${newWordCount} words`)
            console.log(`- Reduction: ${Math.round((1 - newWordCount / currentWordCount) * 100)}%`)

            // Save this iteration's result
            const iterationPath = `${outputPath}_iteration_${iteration}`
            writeFileSync(iterationPath, newSummary)
            console.log(`Iteration ${iteration} saved to: ${iterationPath}`)

            // KEY FIX: If new summary falls below theta, use previous iteration's output
            if (newWordCount <= theta) {
                console.log(`\n🎯 Target length reached (${newWordCount} ≤ ${theta})`)
                console.log(`Using previous iteration's output (${currentWordCount} words) instead of current (${newWordCount} words)`)
                // DON'T update currentSummary - keep the previous iteration's result
                break
            }

            // Only update if we haven't reached the target
            currentSummary = newSummary
            currentWordCount = newWordCount
            iteration++
        }

        if (iteration > maxIterations) {
            console.log(`\nReached maximum iterations (${maxIterations})`)
            console.log(`Final summary: ${currentWordCount} words (target was ${theta})`)
        }

        // Save the final chosen summary to the original output path
        writeFileSync(outputPath, currentSummary)

        console.log(`\n🎯 Final Results:`)
        console.log(`Initial word count: ${countWords(initialSummary)}`)
        console.log(`Final word count: ${currentWordCount}`)
        console.log(`Compression ratio: ${Math.round((1 - currentWordCount / countWords(initialSummary)) * 100)}%`)
        console.log(`Output written to: ${outputPath}`)

        return currentSummary
    } catch (error) {
        console.error("Error in iterative compression:", error)
        throw error
    }
}


async function main() {
    // lets create a new s_final and compare
    const baseString = `black_panther`
    let inputPath = join(process.cwd(), `${baseString}_scenes.json`);
    let outputPath = join(process.cwd(), `${baseString}_n_chunks.json`);

    chunkScenes(inputPath, outputPath, 6); //create chunks

    inputPath = join(process.cwd(), `${baseString}_n_chunks.json`);
    outputPath = join(process.cwd(), `${baseString}_n_prime.json`);

    const preprocess = await nexusPreProcessor(inputPath, outputPath, google('gemini-2.0-flash-lite')); //preprocess chunks
    inputPath = join(process.cwd(), `${baseString}_n_prime.json`);
    outputPath = join(process.cwd(), `${baseString}_n_prime_chunks.json`);
    chunkPreprocessedScenes(inputPath, outputPath, 8)          //create n prime chunks


    inputPath = join(process.cwd(), `${baseString}_n_prime_chunks.json`);
    outputPath = join(process.cwd(), `${baseString}_s_naught.json`);
    const summarize = await nexusSummarizer(inputPath, outputPath, google('gemini-2.0-flash-lite'));//create s naught


    inputPath = join(process.cwd(), `${baseString}_s_naught.json`);
    outputPath = join(process.cwd(), `${baseString}_s_final_gem_full.json`);
    const compression = await nexusCompressor(inputPath, outputPath, 300, 700, 10, google('gemini-2.5-flash-preview-04-17')) //create s final






}

main();
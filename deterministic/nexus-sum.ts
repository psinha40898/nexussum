import { readFileSync, writeFileSync } from "fs"
import { Scene } from "../types/nexus-sum";
/** Scene based chunking equation (1) */
export function chunkScenes(inputPath: string, outputPath: string, k: number): void {
    try {
        // Read the input JSON file
        const data = readFileSync(inputPath, "utf8")
        const scenes: string[] = JSON.parse(data)

        // Split scenes into chunks of k scenes each
        const chunks: string[][] = []
        for (let i = 0; i < scenes.length; i += k) {
            chunks.push(scenes.slice(i, i + k))
        }

        // Write the chunked data to output file
        writeFileSync(outputPath, JSON.stringify(chunks, null, 2))

        console.log(`Successfully created ${chunks.length} chunks of ${k} scenes each`)
        console.log(`Output written to: ${outputPath}`)
    } catch (error) {
        console.error("Error processing files:", error)
        throw error
    }
}
export function chunkPreprocessedScenes(inputPath: string, outputPath: string, k: number): void {
    try {
        // Read the preprocessed JSON file
        const data = readFileSync(inputPath, "utf8")
        const scenes: Scene[] = JSON.parse(data)

        // Split scenes into chunks of k scenes each
        const chunks: Scene[][] = []
        for (let i = 0; i < scenes.length; i += k) {
            chunks.push(scenes.slice(i, i + k))
        }

        // Write the chunked data to output file
        writeFileSync(outputPath, JSON.stringify(chunks, null, 2))

        console.log(`Successfully created ${chunks.length} chunks of up to ${k} scenes each`)
        console.log(`Output written to: ${outputPath}`)
    } catch (error) {
        console.error("Error processing files:", error)
        throw error
    }
}


export function chunkBySentences(text: string, delta: number): string[] {
    // Split the text into sentences
    const sentences = text
        .split(/(?<=[.!?])\s+/)
        .filter(sentence => sentence.trim().length > 0)

    // Group sentences into chunks
    const chunks: string[] = []
    let currentChunk: string[] = []
    let currentTokenCount = 0

    for (const sentence of sentences) {
        // Approximate token count (words + punctuation)
        const sentenceTokens = sentence.split(/\s+/).length

        if (currentTokenCount + sentenceTokens > delta && currentChunk.length > 0) {
            chunks.push(currentChunk.join(" "))
            currentChunk = [sentence]
            currentTokenCount = sentenceTokens
        } else {
            currentChunk.push(sentence)
            currentTokenCount += sentenceTokens
        }
    }

    // Add the last chunk if it's not empty
    if (currentChunk.length > 0) {
        chunks.push(currentChunk.join(" "))
    }

    return chunks
}
export function sentenceChunker(inputPath: string, outputPath: string, delta: number): string[] {
    try {
        // Read the initial summary
        const initialSummary = readFileSync(inputPath, "utf8")

        // Split the summary into sentences
        // This regex splits on periods, question marks, and exclamation marks followed by a space or newline
        const sentences = initialSummary
            .split(/(?<=[.!?])\s+/)
            .filter(sentence => sentence.trim().length > 0)

        console.log(`Split summary into ${sentences.length} sentences`)

        // Group sentences into chunks of approximately delta tokens
        const chunks: string[] = []
        let currentChunk: string[] = []
        let currentTokenCount = 0

        for (const sentence of sentences) {
            // Approximate token count (words + punctuation)
            const sentenceTokens = sentence.split(/\s+/).length

            if (currentTokenCount + sentenceTokens > delta && currentChunk.length > 0) {
                // If adding this sentence would exceed delta and we already have sentences,
                // finalize the current chunk and start a new one
                chunks.push(currentChunk.join(" "))
                currentChunk = [sentence]
                currentTokenCount = sentenceTokens
            } else {
                // Add the sentence to the current chunk
                currentChunk.push(sentence)
                currentTokenCount += sentenceTokens
            }
        }

        // Add the last chunk if it's not empty
        if (currentChunk.length > 0) {
            chunks.push(currentChunk.join(" "))
        }

        console.log(`Created ${chunks.length} chunks with target size of ${delta} tokens each`)

        // Write the chunks to the output file
        writeFileSync(outputPath, JSON.stringify(chunks, null, 2))

        return chunks
    } catch (error) {
        console.error("Error in sentence chunking:", error)
        throw error
    }
}


export function countWords(text: string): number {
    return text.split(/\s+/).filter(word => word.trim().length > 0).length
}
// Define the schema for our scene objects using Zod
import { z } from "zod"
export const SceneSchema = z.object({
    sceneId: z.string().describe("The scene heading (e.g., INT. HALL OF KINGS)"),
    sceneBody: z.string().describe("The narrative prose version of the scene"),
})

// Define the schema for the LLM response using Zod
export const ProcessedChunkSchema = z.object({
    scenes: z.array(SceneSchema).describe("Array of processed scenes"),
})


export const SummarySchema = z.object({
    summary: z.string().describe("A coherent summary of the provided scenes"),
})
// TypeScript types derived from Zod schemas
export type Scene = z.infer<typeof SceneSchema>

export const MetaSummarySchema = z.object({
    metaSummary: z.string().describe("A concise meta summary of the provided text"),
})

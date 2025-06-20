import dotenv from 'dotenv';
dotenv.config();

import { readFileSync } from 'fs';
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';
import { xai } from '@ai-sdk/xai';
import { anthropic } from '@ai-sdk/anthropic';
import { join } from 'path';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

const openrouter = createOpenRouter({
    apiKey:
        ''
})
const fouro = openrouter.chat(`openai/gpt-4o-2024-11-20`)
const fourone = openrouter.chat(`openai/gpt-4.1`)

export async function naiveSummary() {
    try {
        console.log('Reading Black Panther scenes...');
        const filePath = join(process.cwd(), 'black_panther_scenes.json');
        const scenes: string[] = JSON.parse(readFileSync(filePath, 'utf8'));

        console.log(`Found  scenes in Black Panther`);

        const fullScript = scenes.join('\n\n');
        console.log(`Full script: ${fullScript}`);
        console.log(`Total script length:  characters`);
        console.log('Sending to Gemini for summarization...');

        const result = await generateText({
            model: google("gemini-2.0-flash-lite"),
            prompt: `  You are an expert summarizer. You will be provided a full script of a movie. Please summarize it. 
            
            #Length instruction
            Aim for about 600-700 words.


      #Here is the script:
      ${fullScript}`
            ,
            // maxTokens: 8000,
        });

        console.log('\n===  ZERO-SHOT SUMMARY ===\n');
        console.log(result.text);

        console.log('\n=== END OF SUMMARY ===\n');
        console.log(result.usage);
        console.log(result.providerMetadata?.google);

        const googleMetadata = result.providerMetadata?.google;
        if (googleMetadata) {
            console.log('Thinking tokens:', googleMetadata.thoughtsTokenCount);
            console.log('All metadata keys:', Object.keys(googleMetadata));
        }
        return result;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

naiveSummary();
'use server';

import { GoogleGenAI } from "@google/genai";
import { BASE_PROMPT } from '@/lib/prompt';
import { basePrompt as nodeBasePrompt } from "@/lib/defaults/node";
import { basePrompt as reactBasePrompt } from "@/lib/defaults/react";

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || "";

if (!GOOGLE_API_KEY) {
  console.warn('GOOGLE_API_KEY is not set in environment variables');
}

const ai = new GoogleGenAI({ apiKey: GOOGLE_API_KEY });

export async function templateAction(prompt: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: "Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra"
      },
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });

    const answer = response?.text?.trim() || '';
    console.log(answer);

    // react or node
    if (answer === "react") {
      return {
        prompts: [
          BASE_PROMPT,
          `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`
        ],
        uiPrompts: [reactBasePrompt]
      };
    }

    if (answer === "node") {
      return {
        prompts: [
          `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${nodeBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`
        ],
        uiPrompts: [nodeBasePrompt]
      };
    }

    return {
      prompts: [BASE_PROMPT, reactBasePrompt],
      uiPrompts: [reactBasePrompt]
    };
  } catch (error) {
    console.error('Error in templateAction:', error);
    return {
      prompts: [BASE_PROMPT, reactBasePrompt],
      uiPrompts: [reactBasePrompt]
    };
  }
}

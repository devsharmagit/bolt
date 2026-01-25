'use server';

import { GoogleGenAI } from "@google/genai";
import { getSystemPrompt } from '@/lib/prompt';

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || "";

if (!GOOGLE_API_KEY) {
  console.warn('GOOGLE_API_KEY is not set in environment variables');
}

const ai = new GoogleGenAI({ apiKey: GOOGLE_API_KEY });

interface Message {
  role: "user" | "assistant";
  content: string;
}

export async function chatAction(messages: Message[]) {
  try {
    console.log("inside the chat action");
    console.log(messages);
    
    const aiMessages = messages.map((message) => {
      return {
        role: message.role === "assistant" ? "model" : "user", // gemini only accepts model not "assistant"
        parts: [{ text: message.content }]
      };
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: getSystemPrompt()
      },
      contents: aiMessages
    });

    console.log(response);

    return {
      response: response.text
    };
  } catch (error) {
    console.error('Error in chatAction:', error);
    throw new Error('Failed to generate chat response');
  }
}

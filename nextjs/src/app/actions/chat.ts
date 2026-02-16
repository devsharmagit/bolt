'use server';

import { GoogleGenAI } from "@google/genai";
import { getSystemPrompt } from '@/lib/prompt';
import { CHAT_PROMPT_LIMIT, checkAndConsumeChatRateLimit } from '@/lib/rate-limit';

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || "";

if (!GOOGLE_API_KEY) {
  console.warn('GOOGLE_API_KEY is not set in environment variables');
}

const ai = new GoogleGenAI({ apiKey: GOOGLE_API_KEY });

interface Message {
  role: "user" | "assistant";
  content: string;
}

type ChatActionResponse = {
  response: string;
  remainingPrompts: number | null;
  limit: number;
  error?: string;
};

export async function chatAction(messages: Message[]): Promise<ChatActionResponse> {
  try {
    const rateLimit = await checkAndConsumeChatRateLimit();
    if (!rateLimit.success) {
      return {
        response: '',
        remainingPrompts: rateLimit.remaining,
        limit: rateLimit.limit,
        error: rateLimit.error
      };
    }
    
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

    return {
      response: response.text ?? "",
      remainingPrompts: rateLimit.remaining,
      limit: CHAT_PROMPT_LIMIT
    };
  } catch (error) {
    console.error('Error in chatAction:', error);
    throw new Error('Failed to generate chat response');
  }
}

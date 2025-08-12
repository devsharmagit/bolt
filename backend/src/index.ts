import 'dotenv/config';
import { GoogleGenAI } from "@google/genai";

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || "";

const main = async ()=>{

const ai = new GoogleGenAI({apiKey:GOOGLE_API_KEY});

async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: {role: "user", parts: [{text: "Write code for TODO web application."}] },
  });
  console.log(response.text);
}

await main();
}
main();
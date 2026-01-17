import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

console.log('🔍 Testing API Key...');
console.log('Key exists:', !!process.env.GEMINI_API_KEY);
console.log('Key length:', process.env.GEMINI_API_KEY?.length);
console.log('Key preview:', process.env.GEMINI_API_KEY?.substring(0, 15) + '...');

import { GoogleGenerativeAI } from "@google/generative-ai";

const modelsToTry = [
  "gemini-pro",
  "gemini-1.5-pro",
  "gemini-1.5-flash-latest",
  "gemini-1.0-pro"
];

async function testModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  for (const modelName of modelsToTry) {
    try {
      console.log(`\n🚀 Testing model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const result = await model.generateContent("Say hello");
      const response = await result.response;
      const text = response.text();
      
      console.log(`✅ SUCCESS with ${modelName}!`);
      console.log('Response:', text);
      break; // Stop after first success
      
    } catch (error) {
      console.error(`❌ ${modelName} failed:`, error.message);
    }
  }
}

testModels();
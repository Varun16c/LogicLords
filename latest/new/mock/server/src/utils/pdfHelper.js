// src/utils/pdfHelper.js
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function extractPdfText(filePath) {
  try {
    // Dynamic import
    const pdfParse = (await import('pdf-parse')).default;
    const dataBuffer = readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text || "";
  } catch (error) {
    console.error("PDF Parse Error:", error);
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
}
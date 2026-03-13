import { GoogleGenerativeAI } from "@google/generative-ai";

const EXTRACTION_PROMPT = `You are a structured data extraction engine. Analyze the following unstructured text and extract all identifiable structured information.

Return ONLY a valid JSON object (no markdown, no code fences, no explanation). Extract fields such as:
- name, email, phone, address, company, date
- skills (as an array), experience, education
- invoice_number, total, amount, items
- Any other structured fields you can identify

Rules:
1. Return ONLY valid JSON — nothing else.
2. Use snake_case for keys.
3. If a field has multiple values, use an array.
4. If a field is not found, omit it from the output.
5. Keep values as close to the original text as possible.

Text to extract from:
"""
{TEXT}
"""`;

export async function extractWithAI(
  text: string
): Promise<Record<string, unknown>> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    throw new Error(
      "Gemini API key not configured. Please set GEMINI_API_KEY in your .env file."
    );
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = EXTRACTION_PROMPT.replace("{TEXT}", text);

  const result = await model.generateContent(prompt);
  const response = result.response;
  const responseText = response.text();

  // Clean up the response — remove markdown code fences if present
  let cleaned = responseText.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }

  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error(
      `Failed to parse AI response as JSON. Raw response:\n${responseText}`
    );
  }
}

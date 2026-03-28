import { GoogleGenAI } from "@google/genai";

export const summarizeText = async (text: string): Promise<string> => {
  if (!process.env.API_KEY) throw new Error("API Key is missing");
  if (!text || text.length < 10) return "Not enough text to summarize.";

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Please provide a concise and insightful summary of the following text from a book chapter. Focus on key plot points or concepts.\n\nText:\n${text}`,
    });
    return response.text || "No summary generated.";
  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error("Failed to generate summary.");
  }
};

export const explainSelection = async (text: string, context: string): Promise<string> => {
  if (!process.env.API_KEY) throw new Error("API Key is missing");

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `The user is reading a book and has highlighted the following text: "${text}". 
      Context surrounding the text is: "...${context}...".
      Please explain this text, define any complex terms, or provide historical/cultural context if applicable. Keep it brief.`,
    });
    return response.text || "No explanation generated.";
  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error("Failed to explain text.");
  }
};
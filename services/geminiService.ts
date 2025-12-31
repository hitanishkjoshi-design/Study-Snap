
import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Multimodal Scan-to-Score: Evaluates handwritten answers against university standards.
 * Uses Gemini 3 Pro with thinking mode for deep reasoning and image understanding.
 */
export const evaluateHandwrittenAnswer = async (base64Image: string, vaultContext: string = "") => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/jpeg' } },
        { text: `
          Analyze this handwritten answer for a university-level exam.
          
          TASK:
          1. Accurate Transcription: Read every word carefully.
          2. Score: Grade out of 10. Be strict but fair, following typical engineering marking schemes (e.g., Nirma University).
          3. Gap Analysis: Identify EXACTLY what is missing. Mention technical keywords, diagrams that should have been there, or specific derivations.
          4. Key Concepts: List the concepts the student successfully demonstrated.
          5. Improvement Tips: Provide 3 actionable tips to get full marks in the next attempt.

          VAULT CONTEXT (Prioritize these patterns/policies): 
          ${vaultContext}
          
          Return JSON ONLY.
        `}
      ]
    },
    config: {
      thinkingConfig: { thinkingBudget: 32768 },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          transcription: { type: Type.STRING },
          gapAnalysis: { type: Type.STRING },
          keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
          tips: { type: Type.STRING }
        }
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

/**
 * Video-to-Notes Engine: Generates structured notes from lecture content.
 * Uses Gemini 2.5 Flash Lite for high-speed low-latency responses.
 */
export const generateVideoNotes = async (url: string, topic?: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-lite-latest',
    contents: `
      Act as a senior professor. Watch/Analyze the content of this lecture: ${url} 
      Topic: ${topic || "Academic Lecture"}

      Generate a MASTER STUDY GUIDE:
      1. CONCEPTUAL TIMESTAMPS: Break the video into logical segments (e.g., [00:00 - 05:00] Introduction to X).
      2. CORE THEMES: 3-5 major pillars discussed.
      3. DETAILED NOTES: Bulleted technical breakdown.
      4. EXAM PROBABILITY: Rate the likelihood of this appearing in an End-Sem exam.
      5. MODEL QUESTIONS: Provide 2 short (2-mark) and 1 long (10-mark) question based on this video.

      Format using clean Markdown with bold headers.
    `
  });
  return response.text;
};

/**
 * Nirma Vault (RAG Tool): Ask questions based on specific university context.
 * Uses Gemini 2.5 Flash Lite for instant responses.
 */
export const askQuickTutor = async (query: string, university: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-lite-latest',
    contents: `You are an AI Tutor for ${university}. Answer this student query concisely and academically: "${query}". 
    Use a professional yet encouraging tone.`
  });
  return response.text;
};

/**
 * Model Solutions: High-quality subjective solutions using the Pro model with thinking mode.
 */
export const getModelSolutions = async (question: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `
      Question: "${question}"
      
      Generate a 'Perfect Score' solution for a university subjective exam.
      STRUCTURE:
      - Introduction: Context and definitions.
      - Main Body: Detailed points with logical flow.
      - Conclusion: Summary/Significance.
      - High-Impact Keywords: List 5-8 words that markers look for.

      Ensure the content is technically rigorous and uses appropriate engineering/scientific terminology.
    `,
    config: {
      thinkingConfig: { thinkingBudget: 32768 },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          intro: { type: Type.STRING },
          body: { type: Type.STRING },
          conclusion: { type: Type.STRING },
          keywords: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

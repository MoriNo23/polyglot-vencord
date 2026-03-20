/**
 * Gemini API service for translation, synonyms, and definitions
 * Uses the new @google/genai SDK (v1.46.0)
 */

import { GoogleGenAI } from "@google/genai";

// Initialize Gemini client
let geminiClient: GoogleGenAI | null = null;

/**
 * Initialize Gemini client with API key
 * @param apiKey The Gemini API key
 */
export const initGeminiClient = (apiKey: string): void => {
  if (!apiKey) {
    console.error("Gemini API key is missing");
    return;
  }
  
  geminiClient = new GoogleGenAI({ apiKey });
};

/**
 * Check if Gemini client is initialized
 * @returns boolean indicating if client is ready
 */
export const isGeminiClientReady = (): boolean => {
  return geminiClient !== null;
};

/**
 * Generate content using Gemini API
 * @param prompt The prompt to send to Gemini
 * @param model The model to use (default: gemini-3.1-flash-lite-preview)
 * @returns The generated text or empty string on error
 */
const generateContent = async (
  prompt: string,
  model: string = "gemini-3.1-flash-lite-preview"
): Promise<string> => {
  if (!geminiClient) {
    console.error("Gemini client not initialized. Call initGeminiClient first.");
    return "";
  }

  try {
    const response = await geminiClient.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text ?? "";
  } catch (error) {
    console.error("Error generating content with Gemini:", error);
    return "";
  }
};

/**
 * Translate text using Gemini API
 * @param text The text to translate
 * @param targetLang The target language code (e.g., 'es', 'fr')
 * @param model The model to use (default: gemini-3.1-flash-lite-preview)
 * @returns The translated text
 */
export const translateWithGemini = async (
  text: string,
  targetLang: string,
  model: string = "gemini-3.1-flash-lite-preview"
): Promise<string> => {
  const prompt = `Translate the following text to ${targetLang}: "${text}"`;
  return await generateContent(prompt, model);
};

/**
 * Get synonyms for a word using Gemini API (contextual)
 * @param word The word to get synonyms for
 * @param model The model to use (default: gemini-3.1-flash-lite-preview)
 * @returns Array of synonym words
 */
export const getSynonymsWithGemini = async (
  word: string,
  model: string = "gemini-3.1-flash-lite-preview"
): Promise<string[]> => {
  const prompt = `Give me a list of synonyms for the word: "${word}". Return only the synonyms separated by commas.`;
  const result = await generateContent(prompt, model);
  
  // Simple parsing: split by comma and clean up
  return result
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
};

/**
 * Get definition for a word using Gemini API (enhanced)
 * @param word The word to get definition for
 * @param model The model to use (default: gemini-3.1-flash-lite-preview)
 * @returns The definition text
 */
export const getDefinitionWithGemini = async (
  word: string,
  model: string = "gemini-3.1-flash-lite-preview"
): Promise<string> => {
  const prompt = `Give me a clear and concise definition of the word: "${word}".`;
  return await generateContent(prompt, model);
};

/**
 * Get available models for Gemini API
 * @returns Array of model names
 */
export const getAvailableModels = (): string[] => {
  return [
    "gemini-3.1-flash-lite-preview",
    "gemini-3-flash-preview",
    "gemini-3.1-pro-preview",
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-2.5-flash-lite",
  ];
};
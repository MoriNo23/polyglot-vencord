/**
 * DeepL API service for translation fallback
 * Uses the deepl-node package (v1.24.0)
 */

import { DeepLClient } from "deepl-node";

// Initialize DeepL client
let deeplClient: DeepLClient | null = null;

/**
 * Initialize DeepL client with API key
 * @param apiKey The DeepL API key
 */
export const initDeeplClient = (apiKey: string): void => {
  if (!apiKey) {
    console.error("DeepL API key is missing");
    return;
  }
  
  deeplClient = new DeepLClient(apiKey);
};

/**
 * Check if DeepL client is initialized
 * @returns boolean indicating if client is ready
 */
export const isDeeplClientReady = (): boolean => {
  return deeplClient !== null;
};

/**
 * Translate text using DeepL API
 * @param text The text to translate
 * @param targetLang The target language code (e.g., 'ES', 'FR', 'DE')
 * @param sourceLang Optional source language code (auto-detect if not provided)
 * @returns The translated text
 */
export const translateWithDeepl = async (
  text: string,
  targetLang: string,
  sourceLang?: string
): Promise<string> => {
  if (!deeplClient) {
    console.error("DeepL client not initialized. Call initDeeplClient first.");
    return "";
  }

  try {
    // DeepL requires uppercase language codes
    const formattedTargetLang = targetLang.toUpperCase();
    const formattedSourceLang = sourceLang?.toUpperCase() || null;
    
    const result = await deeplClient.translateText(
      text,
      formattedSourceLang as any,
      formattedTargetLang as any
    );
    
    return result.text;
  } catch (error) {
    console.error("Error translating with DeepL:", error);
    return "";
  }
};

/**
 * Get supported languages from DeepL API
 * @returns Array of supported language objects
 */
export const getSupportedLanguages = async (): Promise<Array<{ code: string; name: string }>> => {
  if (!deeplClient) {
    console.error("DeepL client not initialized");
    return [];
  }

  try {
    const languages = await deeplClient.getSourceLanguages();
    return languages.map((lang) => ({
      code: lang.code,
      name: lang.name,
    }));
  } catch (error) {
    console.error("Error getting DeepL supported languages:", error);
    return [];
  }
};

/**
 * Map common language codes to DeepL format
 * @param langCode Standard language code (e.g., 'es', 'fr')
 * @returns DeepL language code (e.g., 'ES', 'FR')
 */
export const mapToDeeplLangCode = (langCode: string): string => {
  const mapping: Record<string, string> = {
    en: "EN-US",  // DeepL distinguishes between EN-US and EN-GB
    es: "ES",
    fr: "FR",
    de: "DE",
    it: "IT",
    pt: "PT",
    nl: "NL",
    pl: "PL",
    ru: "RU",
    ja: "JA",
    zh: "ZH",
    ko: "KO",
  };
  
  return mapping[langCode.toLowerCase()] || langCode.toUpperCase();
};
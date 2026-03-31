// Gemini Service - Synonyms Function

import { settings } from "../../settings";
import { SynonymData } from "./types";
import { generateContent, extractJson, getLangLabel, getLanguageContext, getCurrentModel } from "./client";

export const getSynonymsWithGemini = async (
    word: string,
    phrase: string,
    model?: string
): Promise<SynonymData> => {
    const nativeLang = getLangLabel(settings.store.nativeLanguage);
    
    const prompt = `${getLanguageContext()}\n\nWord to analyze: "${word}"\nPhrase where it appears: "${phrase}"\n\nProvide synonyms, a detailed explanation in ${nativeLang}, context usage, and a grammatical breakdown of the word in that specific phrase context. Respond to grammaticalAnalysis as a string, not an object.\n\nRespond ONLY with valid JSON. Example: {"synonyms":["word1","word2"], "detailedExplanation":"...", "contextUsage":"...", "grammaticalAnalysis":"..."}`;
    
    const raw = await generateContent(prompt, model || getCurrentModel());
    
    try {
        const parsed = extractJson(raw);
        return {
            synonyms: (parsed.synonyms as string[] ?? []).map((s: string) => s.trim()).filter((s: string) => s.length > 0),
            detailedExplanation: parsed.detailedExplanation ?? "",
            contextUsage: parsed.contextUsage ?? "",
            grammaticalAnalysis: parsed.grammaticalAnalysis ?? ""
        };
    } catch {
        return { 
            synonyms: [], 
            detailedExplanation: "Error parsing data", 
            contextUsage: "", 
            grammaticalAnalysis: "" 
        };
    }
};

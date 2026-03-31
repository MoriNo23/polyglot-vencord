// Gemini Service - Definition Function

import { settings } from "../../settings";
import { generateContent, extractJson, getLangLabel, getLanguageContext, getCurrentModel } from "./client";

export const getDefinitionWithGemini = async (
    word: string,
    model?: string
): Promise<string> => {
    const nativeLang = getLangLabel(settings.store.nativeLanguage);
    
    const prompt = `${getLanguageContext()}\n\nDefine the word: "${word}". Respond in ${nativeLang}\n\nRespond ONLY with valid JSON. Example: {"definition":"A state of being happy or content"}`;
    
    const raw = await generateContent(prompt, model || getCurrentModel());
    
    try {
        return extractJson(raw).definition ?? raw;
    } catch {
        return raw;
    }
};

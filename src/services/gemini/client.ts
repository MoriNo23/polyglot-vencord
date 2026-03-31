// Gemini Service - API Client and Core Communication

import { PluginNative } from "@utils/types";
import { apiCache } from "../../utils/cache";
import { settings } from "../../settings";
import { GeminiError, GeminiResponse } from "./types";

const Native = VencordNative.pluginHelpers.Polyglot as PluginNative<typeof import("../../../native")>;

let apiKey: string = "";
let currentModel: string = "gemini-2.5-flash";

// Client initialization
export const initGeminiClient = (key: string, model?: string): void => {
    apiKey = key;
    if (model) {
        currentModel = model.replace(/^models\//, "");
    }
    // Clear cache on init to prevent stale translations
    apiCache.clear();
};

export const isGeminiClientReady = (): boolean => {
    return apiKey.length > 0;
};

export const setGeminiModel = (model: string): void => {
    currentModel = model.replace(/^models\//, "");
};

export const getCurrentModel = (): string => currentModel;

// JSON extraction utility
export const extractJson = (text: string): any => {
    let clean = text.trim();
    // Strip markdown code fences: ```json ... ``` or ``` ... ```
    clean = clean.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "");
    clean = clean.trim();
    // Try direct parse
    try {
        return JSON.parse(clean);
    } catch { }
    // Find first {...} or [...]
    const objMatch = clean.match(/\{[\s\S]*\}/);
    if (objMatch) return JSON.parse(objMatch[0]);
    const arrMatch = clean.match(/\[[\s\S]*\]/);
    if (arrMatch) return JSON.parse(arrMatch[0]);
    throw new Error("No valid JSON found in response");
};

// Simple hash function for cache keys
const hashString = (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
};

// Core API call
export const generateContent = async (prompt: string, model: string): Promise<string> => {
    const cacheKey = `gemini:${model}:${hashString(prompt)}`;

    const cached = apiCache.get<string>(cacheKey);
    if (cached !== null) return cached;

    if (!apiKey) {
        throw new GeminiError("API key not configured. Please add your Gemini API key in settings.");
    }

    try {
        const { status, data: rawData } = await Native.makeGeminiRequest(apiKey, model, prompt);

        if (status === -1) {
            throw new GeminiError("Network error. Please check your internet connection.");
        }

        if (status !== 200) {
            let errorMessage = "Unknown API error";
            try {
                const err = JSON.parse(rawData);
                errorMessage = err.error?.message || errorMessage;
            } catch { }
            if (status === 400 && errorMessage.includes("model")) {
                throw new GeminiError(`Model not found: ${model}. Please select a valid model in settings.`, status, true);
            }
            throw new GeminiError(`Translation failed: ${errorMessage}`, status, true);
        }

        const parsed = JSON.parse(rawData);
        const result = parsed.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

        if (result) apiCache.set(cacheKey, result, 5 * 60 * 1000);

        if (!result) {
            throw new GeminiError("No translation returned. Please try a different text or model.");
        }

        return result;
    } catch (error) {
        if (error instanceof GeminiError) {
            throw error;
        }
        throw new GeminiError("Network error. Please check your internet connection.");
    }
};

// Language code to label mapping
const LANG_LABELS: Record<string, string> = {
    "en": "English",
    "es": "Español",
    "pt": "Português",
    "fr": "Français",
    "de": "Deutsch",
    "it": "Italiano",
    "ru": "Русский",
    "ja": "日本語",
    "ko": "한국어",
    "zh": "中文",
    "ar": "العربية",
};

export const getLangLabel = (code: string): string => {
    return LANG_LABELS[code] || code;
};

export const getLanguageContext = (): string => {
    const native = getLangLabel(settings.store.nativeLanguage);
    const learning = getLangLabel(settings.store.learningLanguage);
    return `I am a native speaker of ${native} and I am learning ${learning}.`;
};

// Available models
export const getAvailableModels = (): string[] => {
    return [
        "gemini-2.5-flash",
        "gemini-2.5-flash-lite",
        "gemini-2.5-pro"
    ];
};

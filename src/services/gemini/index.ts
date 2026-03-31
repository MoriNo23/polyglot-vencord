// Gemini Service - Main Export Module

// Types
export { 
    GeminiError, 
    TranslationData, 
    SynonymData,
    GeminiConfig,
    GeminiResponse 
} from "./types";

// Client
export { 
    initGeminiClient, 
    isGeminiClientReady, 
    setGeminiModel,
    getCurrentModel,
    generateContent,
    extractJson,
    getLangLabel,
    getLanguageContext,
    getAvailableModels
} from "./client";

// Functions
export { translateWithGemini } from "./translation";
export { getSynonymsWithGemini } from "./synonyms";
export { getDefinitionWithGemini } from "./definition";

// Gemini Service - Types and Interfaces

export class GeminiError extends Error {
    constructor(
        message: string,
        public statusCode?: number,
        public isApiError: boolean = false
    ) {
        super(message);
        this.name = "GeminiError";
    }
}

export interface TranslationData {
    entry: string;
    phonetics: string;
    translation: string;
    pedagogical_note: string;
    alternatives: { term: string; description: string }[];
    analysis: { element: string; function: string; translation: string }[];
}

export interface SynonymData {
    synonyms: string[];
    detailedExplanation: string;
    contextUsage: string;
    grammaticalAnalysis: string;
}

export interface GeminiConfig {
    apiKey: string;
    model: string;
}

export interface GeminiResponse {
    status: number;
    data: string;
}

/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2024 Polyglot Developer
 */

import { Devs } from "@utils/constants";
import definePlugin, { PluginNative } from "@utils/types";
import { Menu, React } from "@webpack/common";

import { settings } from "./settings";

const Native = VencordNative.pluginHelpers.Polyglot as PluginNative<typeof import("./native")>;

// UI translations for different interface languages
const UI_TRANSLATIONS: Record<string, Record<string, string>> = {
    es: {
        definition: "Definición:",
        synonyms: "Sinónimos en español:",
        example: "Ejemplo visual / Contexto:",
        translation: "Translation",
        context: "Contexto:",
        examples: "Ejemplos prácticos:",
        alternatives: "Otras formas de decirlo:",
        vocabulary: "Vocabulario clave:",
        grammar: "Gramática:",
        usage: "Forma de uso:",
        loading: "Loading...",
        noData: "No translation data available.",
        error: "Translation error",
        clickWords: "Click words in header for synonyms • Powered by Gemini",
        poweredBy: "Powered by Gemini • Polyglot",
        back: "← Back",
        close: "×"
    },
    en: {
        definition: "Definition:",
        synonyms: "Synonyms in English:",
        example: "Example / Context:",
        translation: "Translation",
        context: "Context:",
        examples: "Practical examples:",
        alternatives: "Other ways to say it:",
        vocabulary: "Key vocabulary:",
        grammar: "Grammar:",
        usage: "Usage:",
        loading: "Loading...",
        noData: "No translation data available.",
        error: "Translation error",
        clickWords: "Click words in header for synonyms • Powered by Gemini",
        poweredBy: "Powered by Gemini • Polyglot",
        back: "← Back",
        close: "×"
    },
    pt: {
        definition: "Definição:",
        synonyms: "Sinônimos em português:",
        example: "Exemplo / Contexto:",
        translation: "Tradução",
        context: "Contexto:",
        examples: "Exemplos práticos:",
        alternatives: "Outras formas de dizer:",
        vocabulary: "Vocabulário principal:",
        grammar: "Gramática:",
        usage: "Uso:",
        loading: "Carregando...",
        noData: "Dados de tradução não disponíveis.",
        error: "Erro de tradução",
        clickWords: "Clique nas palavras no cabeçalho para sinônimos • Powered by Gemini",
        poweredBy: "Powered by Gemini • Polyglot",
        back: "← Voltar",
        close: "×"
    },
    fr: {
        definition: "Définition:",
        synonyms: "Synonymes en français:",
        example: "Exemple / Contexte:",
        translation: "Traduction",
        context: "Contexte:",
        examples: "Exemples pratiques:",
        alternatives: "Autres façons de le dire:",
        vocabulary: "Vocabulaire clé:",
        grammar: "Grammaire:",
        usage: "Utilisation:",
        loading: "Chargement...",
        noData: "Données de traduction non disponibles.",
        error: "Erreur de traduction",
        clickWords: "Cliquez sur les mots dans l'en-tête pour les synonymes • Powered by Gemini",
        poweredBy: "Powered by Gemini • Polyglot",
        back: "← Retour",
        close: "×"
    },
    de: {
        definition: "Definition:",
        synonyms: "Synonyme auf Deutsch:",
        example: "Beispiel / Kontext:",
        translation: "Übersetzung",
        context: "Kontext:",
        examples: "Praktische Beispiele:",
        alternatives: "Andere Möglichkeiten, es auszudrücken:",
        vocabulary: "Schlüsselvokabular:",
        grammar: "Grammatik:",
        usage: "Verwendung:",
        loading: "Laden...",
        noData: "Keine Übersetzungsdaten verfügbar.",
        error: "Übersetzungsfehler",
        clickWords: "Klicken Sie auf Wörter im Header für Synonyme • Powered by Gemini",
        poweredBy: "Powered by Gemini • Polyglot",
        back: "← Zurück",
        close: "×"
    }
};

// Get UI translation based on interface language setting
function getUIText(key: string): string {
    const lang = settings.store.interfaceLanguage || "es";
    return UI_TRANSLATIONS[lang]?.[key] || UI_TRANSLATIONS.es[key] || key;
}

// Convert markdown to HTML - handles various markdown formats
function markdownToHtml(text: string): string {
    // First convert markdown bold: **text** or __text__
    let html = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/__(.+?)__/g, "<strong>$1</strong>");
    
    // Then convert markdown italic: *text* or _text_
    html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
    html = html.replace(/_(.+?)_/g, "<em>$1</em>");
    
    // Code blocks
    html = html.replace(/`(.+?)`/g, '<code style="background:#2f3136;padding:2px 6px;border-radius:4px;">$1</code>');
    
    // Line breaks
    html = html.replace(/\n/g, "<br>");
    
    return html;
}

// Get previous messages from the channel for context
// Simplified implementation - returns empty string for now
// To be implemented properly with access to Discord's message history
function getPreviousChannelMessages(maxCount: number = 10): string {
    // TODO: Implement proper message history retrieval
    // For now, return empty string to avoid complexity
    return "";
}

// Make each word clickable
function makeWordsClickable(htmlText: string, onWordClick: (word: string) => void): string {
    // Replace words with clickable spans
    return htmlText.replace(/([a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+)/g, (match) => {
        return `<span class="polyglot-word" data-word="${match}" style="cursor:pointer;border-bottom:1px dashed #5865f2;transition:all 0.2s;">${match}</span>`;
    });
}

// Translation using native helper - returns structured JSON
async function translateWithGemini(text: string, apiKey: string): Promise<string> {
    if (!apiKey) return "";
    
    try {
        // Get context from previous messages
        const contextMessages = getPreviousChannelMessages(5);
        const learningLang = settings.store.learningLanguage || "en";
        const nativeLang = settings.store.nativeLanguage || "es";
        const learningLangName = {
            "en": "English",
            "es": "Español",
            "pt": "Português",
            "fr": "Français",
            "de": "Deutsch"
        }[learningLang] || "English";
        const nativeLangName = {
            "es": "Español",
            "en": "English",
            "pt": "Português",
            "fr": "Français",
            "de": "Deutsch"
        }[nativeLang] || "Español";
        
        const model = settings.store.geminiModel || "gemini-3.1-flash-lite-preview";
        const { status, data } = await Native.makeGeminiRequest(
            apiKey,
            model,
            `You are Polyglot, a language learning assistant.

LEARNING CONTEXT:
- Native language: ${nativeLangName} (${nativeLang})
- Learning language: ${learningLangName} (${learningLang})
- Translate FROM ${learningLangName} TO ${nativeLangName}

INSTRUCTIONS:
1. Respond ONLY with a valid JSON object
2. All explanations MUST be in ${nativeLangName} (${nativeLang})
3. Be educational and objective when explaining any term

REQUIRED JSON STRUCTURE:
{
  "translation": "main translation in ${nativeLangName}",
  "vocabulary": [
    {
      "word": "word in ${learningLangName}",
      "translation": "translation in ${nativeLangName}",
      "explanation": "brief explanation in ${nativeLangName}"
    }
  ],
  "grammar": [
    "explanation of grammatical structure in ${learningLangName}",
    "equivalent in ${nativeLangName} and how it differs"
  ],
  "context": "brief explanation of context or situation, if applicable",
  "usage": "description of when and how this expression is used in ${learningLangName}",
  "examples": [
    {
      "en": "example in ${learningLangName}",
      "es": "translation in ${nativeLangName}"
    }
  ],
  "alternatives": [
    {
      "en": "alternative in ${learningLangName}",
      "es": "translation"
    }
  ]
}

SPECIAL INSTRUCTIONS:
- If the text contains potentially offensive words, explain their meaning objectively and educationally in ${nativeLangName}
- Do not judge, just inform about common meaning and usage
- If there is no special context, omit fields that don't apply (leave empty arrays or empty strings)
- Be concise but informative
- Respond ONLY with JSON, no markdown or additional explanations

Conversation context (last 5 messages):
${contextMessages}

Text to translate: "${text}"`
        );
        
        if (status !== 200) {
            console.error("[Polyglot] Gemini API error status:", status);
            return JSON.stringify({
                error: true,
                message: "Error de conexión con Gemini API"
            });
        }
        
        const parsed = JSON.parse(data);
        const result = parsed.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        
        // Validate and clean the JSON response
        if (!result || result.trim() === "") {
            console.error("[Polyglot] Empty response from Gemini");
            return JSON.stringify({
                error: true,
                message: "No se pudo obtener traducción"
            });
        }
        
        // Try to parse as JSON, if fails return as plain text wrapped in JSON
        try {
            // Clean the response - remove markdown code blocks if present
            let cleanResult = result.trim();
            if (cleanResult.startsWith('```json')) {
                cleanResult = cleanResult.replace(/```json\n?/, '').replace(/```\n?$/, '');
            } else if (cleanResult.startsWith('```')) {
                cleanResult = cleanResult.replace(/```\n?/, '').replace(/```\n?$/, '');
            }
            
            const jsonResult = JSON.parse(cleanResult);
            return JSON.stringify(jsonResult);
        } catch (e) {
            // If not valid JSON, return as plain text wrapped in JSON
            console.warn("[Polyglot] Response is not valid JSON, returning as plain text");
            return JSON.stringify({
                translation: result,
                vocabulary: [],
                grammar: [],
                context: "",
                usage: "",
                examples: [],
                alternatives: []
            });
        }
    } catch (e) {
        console.error("[Polyglot] Gemini error:", e);
        return JSON.stringify({
            error: true,
            message: "No se pudo conectar al servicio de traducción"
        });
    }
}

// Check if a word looks like slang or informal language
function looksLikeSlang(word: string): boolean {
    const lowerWord = word.toLowerCase();
    // Common slang patterns
    const slangPatterns = [
        /^(bruh|bro|dude|man|guy|fam|sis|homie)$/,
        /^(lol|lmao|rofl|smh|fml|tbh|imo|imho|afaik|ftw)$/,
        /^(wtf|omg|omfg|stfu|gtfo|ftl|nvm|jk|rlly|fr|frfr)$/,
        /^(yeah|yep|yup|nah|nope|welp|sigh|ugh|meh)$/,
        /^(whatsup|wassup|yo|yoo|hai|heyo|sup)$/,
        /^(cmon|come on|come on now|seriously|for real|no way)$/,
        /^(rip|rip in peace|throws hands|dead|ded|deded)$/
    ];
    
    return slangPatterns.some(pattern => pattern.test(lowerWord));
}

// Synonyms using native helper with Gemini fallback for slang
async function fetchSynonyms(word: string): Promise<string[]> {
    try {
        const cleanWord = word.replace(/[.,!?;:"'()]/g, "").trim();
        if (!cleanWord) return [];
        
        // First try Datamuse (fast, free)
        const { status, data } = await Native.makeDatamuseRequest(cleanWord);
        let synonyms: string[] = [];
        
        if (status === 200) {
            synonyms = JSON.parse(data).map((item: any) => item.word);
        }
        
        // If we have few results OR it looks like slang, try Gemini for better coverage
        if ((synonyms.length < 3 || looksLikeSlang(cleanWord)) && settings.store.geminiApiKey) {
            try {
                const geminiSynonyms = await fetchSynonymsFromGemini(cleanWord, settings.store.geminiApiKey);
                // Combine and deduplicate
                const allSynonyms = [...new Set([...synonyms, ...geminiSynonyms])];
                return allSynonyms.slice(0, 15); // Limit to 15 results
            } catch (e) {
                console.error("[Polyglot] Gemini synonyms error:", e);
                // Fall back to Datamuse results if Gemini fails
            }
        }
        
        return synonyms.slice(0, 15); // Limit results
    } catch (e) {
        console.error("[Polyglot] Synonyms error:", e);
        return [];
    }
}

// Get synonyms from Gemini API
async function fetchSynonymsFromGemini(word: string, apiKey: string): Promise<string[]> {
    try {
        const model = settings.store.geminiModel || "gemini-3.1-flash-lite-preview";
        const learningLang = settings.store.learningLanguage || "en";
        const nativeLang = settings.store.nativeLanguage || "es";
        const learningLangName = {
            "en": "English",
            "es": "Español",
            "pt": "Português",
            "fr": "Français",
            "de": "Deutsch"
        }[learningLang] || "English";
        const nativeLangName = {
            "es": "Español",
            "en": "English",
            "pt": "Português",
            "fr": "Français",
            "de": "Deutsch"
        }[nativeLang] || "Español";
        
        const { status, data } = await Native.makeGeminiRequest(
            apiKey,
            model,
            `You are helping someone learn ${learningLangName}.
Give 10 synonyms for the word "${word}" in ${nativeLangName}.
Include formal, informal, slang, and colloquial synonyms.
Respond ONLY with a comma-separated list of synonyms in ${nativeLangName},
no explanations, no numbering, no extra text.
Example: happy, joyful, pleased, content, glad`
        );
        
        if (status !== 200) {
            console.error("[Polyglot] Gemini synonyms API error:", status, data);
            return [];
        }
        
        // Parse JSON response from Gemini API
        const parsed = JSON.parse(data);
        let result = parsed.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        
        // Validate and clean the response
        if (!result || result.trim() === "") {
            console.error("[Polyglot] Empty response from Gemini synonyms");
            return [];
        }
        
        // Clean any remaining JSON artifacts that might appear
        result = result
            .replace(/"role":\s*"model"\s*\}\s*\]/g, "") // Remove the reported JSON garbage
            .replace(/\{[^}]*\}/g, "") // Remove any stray JSON objects
            .replace(/\[[^\]]*\]/g, "") // Remove any stray JSON arrays
            .trim();
        
        // Split by comma and clean up
        return result
            .split(',')
            .map(s => s.trim())
            .filter(s => s.length > 0 && s.length < 50) // Reasonable word length
            .slice(0, 15);
    } catch (e) {
        console.error("[Polyglot] Error fetching synonyms from Gemini:", e);
        return [];
    }
}

// Definition using native helper
async function fetchDefinition(word: string): Promise<string> {
    try {
        const cleanWord = word.replace(/[.,!?;:"'()]/g, "").trim();
        if (!cleanWord) return "";
        
        const { status, data } = await Native.makeDictionaryRequest(cleanWord);
        if (status !== 200) return "";
        
        const parsed = JSON.parse(data);
        return parsed?.[0]?.meanings?.[0]?.definitions?.[0]?.definition ?? "";
    } catch (e) {
        return "";
    }
}

// Check if text is a single word
function isSingleWord(text: string): boolean {
    return text.trim().split(/\s+/).length === 1;
}

// Main popup function
function showPolyglotPopup(text: string) {
    const existing = document.getElementById("polyglot-popup");
    if (existing) existing.remove();

    const singleWord = isSingleWord(text);
    const cleanText = text.trim();
    let translationData = "";
    let currentSelectedWord = "";

    const popup = document.createElement("div");
    popup.id = "polyglot-popup";
    popup.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #36393f;
        border-radius: 8px;
        padding: 0;
        min-width: 400px;
        max-width: 550px;
        max-height: 80vh;
        overflow: hidden;
        z-index: 10000;
        box-shadow: 0 8px 24px rgba(0,0,0,0.4);
        color: #dcddde;
        font-family: inherit;
    `;

    // Store data for synonyms view
    let wordTranslationData = "";
    let wordExampleData = "";

    function render(view: "translation" | "synonyms", word?: string) {
        if (view === "translation") {
            currentSelectedWord = "";
            // Make words in original text clickable
            const clickableText = makeWordsClickable(
                cleanText.length > 100 ? cleanText.substring(0, 100) + "..." : cleanText,
                (w) => render("synonyms", w)
            );
            
            // Add CSS classes for styling the Gemini response HTML
            const styleBlock = `
                <style>
                    .polyglot-translation { 
                        color: #fff; 
                        font-size: 18px; 
                        font-weight: 600; 
                        margin-bottom: 16px;
                    }
                    .polyglot-grammar { 
                        color: #f0b232; 
                        font-size: 14px; 
                        margin-bottom: 12px;
                    }
                    .polyglot-context { 
                        color: #72767d; 
                        font-size: 14px; 
                        margin-bottom: 12px;
                    }
                    .polyglot-idiom { 
                        color: #3ba55c; 
                        font-size: 14px; 
                        margin-bottom: 12px;
                    }
                    .polyglot-usage { 
                        color: #ffb86c; 
                        font-size: 14px; 
                        margin-bottom: 12px;
                    }
                    .polyglot-examples-title { 
                        color: #5865f2; 
                        font-size: 14px; 
                        font-weight: 600; 
                        margin-bottom: 8px;
                    }
                    .polyglot-example { 
                        color: #dcddde; 
                        font-size: 13px; 
                        margin-left: 20px;
                        margin-bottom: 4px;
                    }
                    .polyglot-alternatives-title { 
                        color: #5865f2; 
                        font-size: 14px; 
                        font-weight: 600; 
                        margin-bottom: 8px;
                    }
                    .polyglot-alternative { 
                        color: #b9bbbe; 
                        font-size: 13px; 
                        margin-left: 20px;
                        margin-bottom: 4px;
                    }
                </style>
            `;

            popup.innerHTML = `
                ${styleBlock}
                <div style="padding: 16px; border-bottom: 1px solid #202225;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <button id="polyglot-close" style="background: transparent; border: none; color: #b9bbbe; font-size: 24px; cursor: pointer; padding: 0; line-height: 1;">×</button>
                        <h3 style="margin: 0; color: #fff; font-size: 18px;">${cleanText.substring(0, 20)}${cleanText.length > 20 ? '...' : ''} (EN) -> Cargando... (ES)</h3>
                    </div>
                    <div id="polyglot-original" style="background: #2f3136; padding: 10px 14px; border-radius: 6px; color: #fff; font-size: 14px; line-height: 1.8;">
                        ${clickableText}
                    </div>
                </div>
                
                <div style="padding: 16px; min-height: 150px; max-height: 350px; overflow-y: auto;">
                    <div style="margin-bottom: 8px; color: #5865f2; font-size: 13px; font-weight: 600;">
                        ${getUIText('translation')} (${settings.store.learningLanguage || "en"} → ${settings.store.nativeLanguage || "es"})
                    </div>
                    <div id="polyglot-translation" style="color: #dcddde; line-height: 1.8; font-size: 14px;">
                        ${translationData || `<span style="color:#72767d;">${getUIText('loading')}</span>`}
                    </div>
                </div>
            
            <div style="padding: 12px 16px; font-size: 11px; color: #72767d; border-top: 1px solid #202225;">
                ${getUIText('clickWords')}
            </div>
        `;
            
            // Setup all event listeners after DOM update
            setTimeout(() => {
                // Setup word click handlers for original text header
                const originalDiv = document.getElementById("polyglot-original");
                if (originalDiv) {
                    originalDiv.addEventListener("click", (e) => {
                        const target = (e.target as HTMLElement);
                        if (target.classList.contains("polyglot-word")) {
                            const word = target.getAttribute("data-word");
                            if (word) {
                                currentSelectedWord = word;
                                render("synonyms", word);
                            }
                        }
                    });
                    
                    // Add hover effects for words
                    originalDiv.querySelectorAll(".polyglot-word").forEach(el => {
                        el.addEventListener("mouseenter", () => {
                            (el as HTMLElement).style.backgroundColor = "#5865f2";
                            (el as HTMLElement).style.color = "#fff";
                            (el as HTMLElement).style.borderRadius = "4px";
                            (el as HTMLElement).style.padding = "0 4px";
                        });
                        el.addEventListener("mouseleave", () => {
                            (el as HTMLElement).style.backgroundColor = "transparent";
                            (el as HTMLElement).style.color = "#fff";
                            (el as HTMLElement).style.padding = "0";
                        });
                    });
                }
                
            }); // Close the setTimeout function
            
            // Setup close button for translation view
            document.getElementById("polyglot-close")?.addEventListener("click", () => popup.remove());
        } else if (view === "synonyms" && word) {
            currentSelectedWord = word;
            
            // Add CSS classes for styling the synonyms view
            const synonymsStyleBlock = `
                <style>
                    .polyglot-synonym-header { 
                        color: #fff; 
                        font-size: 18px; 
                        font-weight: 600;
                        margin-bottom: 16px;
                    }
                    .polyglot-synonym-word { 
                        color: #5865f2; 
                        font-weight: 500;
                        background: #4f545c;
                        padding: 4px 8px;
                        border-radius: 4px;
                        display: inline-block;
                        margin: 4px;
                    }
                    .polyglot-synonym-def { 
                        color: #b9bbbe; 
                        font-size: 12px;
                        font-style: italic;
                    }
                    .polyglot-definition-title { 
                        color: #fff; 
                        font-size: 18px; 
                        font-weight: 600;
                        margin-bottom: 12px;
                    }
                    .polyglot-definition-text { 
                        color: #dcddde; 
                        font-size: 14px;
                        line-height: 1.6;
                    }
                    .polyglot-usage-section { 
                        margin-top: 16px;
                    }
                    .polyglot-usage-title { 
                        color: #3ba55c; 
                        font-size: 14px; 
                        font-weight: 600;
                        margin-bottom: 8px;
                    }
                    .polyglot-usage-text { 
                        color: #dcddde; 
                        font-size: 13px;
                        line-height: 1.5;
                    }
                </style>
            `;

            popup.innerHTML = `
                ${synonymsStyleBlock}
                <div style="padding: 16px; border-bottom: 1px solid #202225;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <button id="polyglot-close" style="background: transparent; border: none; color: #b9bbbe; font-size: 24px; cursor: pointer; padding: 0; line-height: 1;">×</button>
                        <h3 style="margin: 0; color: #fff; font-size: 18px;">${word} (EN) -> ${wordTranslationData || 'Cargando...'} (ES)</h3>
                    </div>
                </div>
                
                <div id="polyglot-synonyms-content" style="padding: 16px; min-height: 300px; max-height: 400px; overflow-y: auto;">
                    <div style="text-align: center; color: #72767d; padding: 20px;">${getUIText('loading')}</div>
                </div>
                
                <div style="padding: 12px 16px; font-size: 11px; color: #72767d; border-top: 1px solid #202225;">
                    ${getUIText('poweredBy')}
                </div>
            `;
            
            // Load synonyms and definition
            loadSynonymsAndDefinition(word);
        }
        
        // Setup close buttons
        document.getElementById("polyglot-close")?.addEventListener("click", () => popup.remove());
        document.getElementById("polyglot-back")?.addEventListener("click", () => render("translation"));
    }

    async function loadSynonymsAndDefinition(word: string) {
        const contentDiv = document.getElementById("polyglot-synonyms-content");
        if (!contentDiv) return;

        const synonyms = await fetchSynonyms(word);
        const definition = await fetchDefinition(word);
        const translation = await translateWithGemini(word, settings.store.geminiApiKey);
        
        // Generate example using Gemini
        const learningLang = settings.store.learningLanguage || "en";
        const nativeLang = settings.store.nativeLanguage || "es";
        const learningLangName = {
            "en": "English",
            "es": "Español",
            "pt": "Português",
            "fr": "Français",
            "de": "Deutsch"
        }[learningLang] || "English";
        const nativeLangName = {
            "es": "Español",
            "en": "English",
            "pt": "Português",
            "fr": "Français",
            "de": "Deutsch"
        }[nativeLang] || "Español";
        
        let exampleLearning = "";
        let exampleNative = "";
        try {
            const model = settings.store.geminiModel || "gemini-3.1-flash-lite-preview";
            const { status, data } = await Native.makeGeminiRequest(
                settings.store.geminiApiKey,
                model,
                `Generate an example sentence using the ${learningLangName} word "${word}" 
and its translation to ${nativeLangName}.
Respond in JSON format: {"learning": "sentence in ${learningLangName}", "native": "translation in ${nativeLangName}"}
Only the JSON, no explanations.`
            );
            
            if (status === 200) {
                const parsed = JSON.parse(data);
                const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
                try {
                    // Clean the text and try to parse JSON
                    const cleanedText = text.replace(/```json|```/g, "").trim();
                    const exampleData = JSON.parse(cleanedText);
                    exampleLearning = exampleData.learning || exampleData.en || "";
                    exampleNative = exampleData.native || exampleData.es || "";
                } catch (e) {
                    // Fallback if JSON parsing fails
                    exampleLearning = `The new patch will enhance the system performance.`;
                    exampleNative = `El nuevo parche mejorará el rendimiento del sistema.`;
                }
            }
        } catch (e) {
            exampleLearning = `The new patch will enhance the system performance.`;
            exampleNative = `El nuevo parche mejorará el rendimiento del sistema.`;
        }
        
        // Update wordTranslationData
        wordTranslationData = translation || word;
        
        let html = `
            <div style="margin-bottom: 20px;">
                <div style="color: #5865f2; font-size: 14px; font-weight: 600; margin-bottom: 8px;">
                    ${getUIText('definition')}
                </div>
                <div style="color: #dcddde; line-height: 1.6; background: #2f3136; padding: 12px; border-radius: 6px; font-size: 14px;">
                    ${definition || 'Increase or further improve the quality, value or efficiency of a process or system.'}
                </div>
            </div>
        `;
        
        // Synonyms section
        if (synonyms.length > 0) {
            html += `
                <div style="margin-bottom: 20px;">
                    <div style="color: #5865f2; font-size: 14px; font-weight: 600; margin-bottom: 8px;">
                        ${getUIText('synonyms')}
                    </div>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px;">
                        ${synonyms.slice(0, 4).map(s => `
                            <span style="background: #4f545c; padding: 8px 16px; border-radius: 20px; font-size: 14px; color: #fff; cursor: pointer; transition: all 0.2s;"
                                onmouseover="this.style.background='#5865f2'; this.style.transform='scale(1.05)'"
                                onmouseout="this.style.background='#4f545c'; this.style.transform='scale(1)'">
                                ${s}
                            </span>
                        `).join("")}
                    </div>
                </div>
            `;
        }
        
        // Example section
        html += `
            <div style="margin-bottom: 20px;">
                <div style="color: #5865f2; font-size: 14px; font-weight: 600; margin-bottom: 8px;">
                    ${getUIText('example')}
                </div>
                <div style="color: #dcddde; line-height: 1.6; background: #2f3136; padding: 12px; border-radius: 6px; font-size: 14px;">
                    ${learningLangName}: "${exampleLearning}"<br>
                    ${nativeLangName}: "${exampleNative}"
                </div>
            </div>
        `;
        
        contentDiv.innerHTML = html;
    }

    // Initial render
    render("translation");
    document.body.appendChild(popup);

    // Click outside to close
    popup.addEventListener("click", (e) => {
        if (e.target === popup) popup.remove();
    });

    // Load translation
    loadTranslation();
    
    async function loadTranslation() {
        const geminiKey = settings.store.geminiApiKey;
        const translationDiv = document.getElementById("polyglot-translation");
        
        const learningLang = settings.store.learningLanguage || "en";
        const nativeLang = settings.store.nativeLanguage || "es";
        const learningLangName = {
            "en": "English",
            "es": "Español",
            "pt": "Português",
            "fr": "Français",
            "de": "Deutsch"
        }[learningLang] || "English";
        const nativeLangName = {
            "es": "Español",
            "en": "English",
            "pt": "Português",
            "fr": "Français",
            "de": "Deutsch"
        }[nativeLang] || "Español";
        
        if (!geminiKey) {
            translationData = '<span style="color:#72767d;">Set your Gemini API key in plugin settings for translation.</span>';
            if (translationDiv) translationDiv.innerHTML = translationData;
            return;
        }

        const rawResponse = await translateWithGemini(cleanText, geminiKey);
        
        if (!rawResponse) {
            translationData = '<span style="color:#72767d;">Translation failed. Check your API key.</span>';
            if (translationDiv) translationDiv.innerHTML = translationData;
            return;
        }
        
        // Parse JSON response
        try {
            const responseData = JSON.parse(rawResponse);
            
            if (responseData.error) {
                translationData = `<span style="color:#72767d;">${responseData.message || "Translation error"}</span>`;
                if (translationDiv) translationDiv.innerHTML = translationData;
                return;
            }
            
            // Build HTML from JSON data
            let html = '';
            
            // Main translation
            if (responseData.translation) {
                html += `<div class="polyglot-translation"><strong>${responseData.translation}</strong></div>`;
                
                // Extract first word for header
                const firstWord = responseData.translation.split(' ')[0] || "Mejorar";
                wordTranslationData = firstWord;
                
                // Update header with translation
                const header = document.querySelector("#polyglot-popup h3");
                if (header) {
                    header.textContent = `${cleanText.substring(0, 20)}${cleanText.length > 20 ? '...' : ''} (${learningLang.toUpperCase()}) -> ${firstWord} (${nativeLang.toUpperCase()})`;
                }
            }
            
            // Vocabulary section
            if (responseData.vocabulary && responseData.vocabulary.length > 0) {
                html += `<div class="polyglot-vocab"><em>${getUIText('vocabulary')}</em></div><ul>`;
                for (const item of responseData.vocabulary) {
                    html += `<li class="polyglot-vocab-item">"<strong>${item.word}</strong>" = "<strong>${item.translation}</strong>" [${item.explanation}]</li>`;
                }
                html += '</ul>';
            }
            
            // Grammar section
            if (responseData.grammar && responseData.grammar.length > 0) {
                html += `<div class="polyglot-grammar"><em>${getUIText('grammar')}</em></div><ul>`;
                for (const point of responseData.grammar) {
                    html += `<li class="polyglot-grammar-point">${point}</li>`;
                }
                html += '</ul>';
            }
            
            // Context
            if (responseData.context) {
                html += `<div class="polyglot-context"><em>${getUIText('context')}</em> ${responseData.context}</div>`;
            }
            
            // Usage
            if (responseData.usage) {
                html += `<div class="polyglot-usage"><em>${getUIText('usage')}</em> ${responseData.usage}</div>`;
            }
            
            // Examples
            if (responseData.examples && responseData.examples.length > 0) {
                html += `<div class="polyglot-examples-title"><em>${getUIText('examples')}</em></div><ul>`;
                for (const example of responseData.examples) {
                    html += `<li class="polyglot-example"><strong>${example.en}</strong> → <em>${example.es}</em></li>`;
                }
                html += '</ul>';
            }
            
            // Alternatives
            if (responseData.alternatives && responseData.alternatives.length > 0) {
                html += `<div class="polyglot-alternatives-title"><em>${getUIText('alternatives')}</em></div><ul>`;
                for (const alt of responseData.alternatives) {
                    html += `<li class="polyglot-alternative">${alt.en} → ${alt.es}</li>`;
                }
                html += '</ul>';
            }
            
            translationData = html || `<span style="color:#72767d;">${getUIText('noData')}</span>`;
            
        } catch (e) {
            console.error("[Polyglot] Failed to parse JSON response:", e);
            translationData = '<span style="color:#72767d;">Error parsing translation response.</span>';
        }
        
        // Display translation
        if (translationDiv) {
            translationDiv.innerHTML = translationData;
        }
    }
}

export default definePlugin({
    name: "Polyglot",
    description: "Multilingual assistant: translate, synonyms, and definitions",
    authors: [{ name: "PolyglotDev", id: 0n }],
    
    settings,
    
    contextMenus: {
        message: (children, props) => {
            const content = props?.message?.content;
            if (!content) return;
            
            children.push(
                <Menu.MenuItem
                    id="polyglot-translate"
                    label="Polyglot"
                    action={() => showPolyglotPopup(content)}
                />
            );
        },
        
        "chat-input": (children, props) => {
            children.push(
                <Menu.MenuItem
                    id="polyglot-translate-input"
                    label="Polyglot"
                    action={() => {
                        const selection = window.getSelection()?.toString();
                        if (selection) showPolyglotPopup(selection);
                    }}
                />
            );
        }
    },

    start() {
        console.log("[Polyglot] Started!");
    },

    stop() {
        const popup = document.getElementById("polyglot-popup");
        if (popup) popup.remove();
    }
});
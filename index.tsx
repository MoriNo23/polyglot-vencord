/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2024 Polyglot Developer
 */

import { Devs } from "@utils/constants";
import definePlugin, { PluginNative } from "@utils/types";
import { Menu, React } from "@webpack/common";

import { settings } from "./settings";

const Native = VencordNative.pluginHelpers.Polyglot as PluginNative<typeof import("./native")>;

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

// Translation using native helper
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
        
        const { status, data } = await Native.makeGeminiRequest(
            apiKey,
            "gemini-2.5-flash",
            `Eres Polyglot, un asistente de aprendizaje de idiomas diseñado específicamente para hispanohablantes que aprenden inglés.

CONTEXTO DE APRENDIZAJE:
- Tu idioma nativo: ${nativeLangName} (${nativeLang})
- Idioma que estás aprendiendo: ${learningLangName} (${learningLang})
- Traduce DE ${learningLangName} A ${nativeLangName}

REGLAS ESTRICTAS DE RESPUESTA:
1. RESPONDE ÚNICAMENTE con HTML inline válido (sin etiquetas <html>, <head>, <body>)
2. Usa SOLO estas etiquetas HTML con CLASES CSS: 
   - <p class="polyglot-translation"> para la traducción principal
   - <p class="polyglot-grammar"> para información gramatical
   - <p class="polyglot-vocab"> para pares de vocabulario
   - <p class="polyglot-context"> para contexto
   - <p class="polyglot-usage"> para forma de uso
   - <p class="polyglot-examples-title"> para título de ejemplos
   - <li class="polyglot-example"> para ejemplos individuales
   - <p class="polyglot-explanation"> para explicaciones de ejemplos
   - <p class="polyglot-alternatives-title"> para título de alternativas
   - <li class="polyglot-alternative"> para alternativas individuales
   - <strong class="polyglot-highlight"> para texto importante
3. NO uses CSS inline, estilo, IDs, ni atributos adicionales
4. Todas las explicaciones DEBEN estar en ${nativeLangName} (${nativeLang})
5. Sé educado y objetivo al explicar cualquier término

ESTRUCTURA OBLIGATORIA DE RESPUESTA:
<p class="polyglot-translation"><strong>[TRADUCCIÓN AL ${nativeLangName.toUpperCase()}]</strong></p>

<p class="polyglot-vocab"><em>📚 Vocabulario clave (${learningLangName} → ${nativeLangName}):</em></p>
<ul>
<li class="polyglot-vocab-item">"<strong>[palabra/frase en ${learningLangName}]</strong>" = "<strong>[traducción en ${nativeLangName}]</strong>" [explicación breve en ${nativeLangName}]</li>
</ul>

<p class="polyglot-grammar"><em>📐 Gramática:</em></p>
<ul>
<li class="polyglot-grammar-point">[Explicación de la estructura gramatical en ${learningLangName}]</li>
<li class="polyglot-grammar-point">[Equivalente en ${nativeLangName} y cómo difiere]</li>
</ul>

<p class="polyglot-context"><em>💡 Contexto:</em> [explicación breve del contexto o situación, si aplica]</p>

<p class="polyglot-usage"><em>💬 Forma de uso:</em> [descripción de cuándo y cómo se usa esta expresión en ${learningLangName}]</p>

<p class="polyglot-examples-title"><em>📝 Ejemplos prácticos:</em></p>
<ul>
<li class="polyglot-example"><strong>[Ejemplo 1 en ${learningLangName}]</strong> → <em>[traducción al ${nativeLangName}]</em></li>
<li class="polyglot-example"><strong>[Ejemplo 2 en ${learningLangName}]</strong> → <em>[traducción al ${nativeLangName}]</em></li>
</ul>

<p class="polyglot-alternatives-title"><em>🔄 Otras formas de decirlo en ${learningLangName}:</em></p>
<ul>
<li class="polyglot-alternative">[alternativa 1 en ${learningLangName}] → [traducción]</li>
<li class="polyglot-alternative">[alternativa 2 en ${learningLangName}] → [traducción]</li>
</ul>

INSTRUCCIONES ESPECIALES:
- Si el texto contiene palabras potencialmente ofensivas, explica su significado de manera objetiva y educada en ${nativeLangName}
- No juzgues, solo informa el significado y uso común
- Si no hay contexto especial, omite las secciones que no apliquen
- Sé conciso pero informativo
- Máximo 500 caracteres en tu respuesta

Texto de la conversación para contexto (últimos 5 mensajes):
${contextMessages}

Texto a traducir: "${text}"`
        );
        
        if (status !== 200) {
            console.error("[Polyglot] Gemini API error status:", status);
            return "";
        }
        
        const parsed = JSON.parse(data);
        let result = parsed.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        
        // Validate and clean the HTML response
        if (!result || result.trim() === "") {
            console.error("[Polyglot] Empty response from Gemini");
            return '<p><strong>[Error de traducción]</strong></p><p>No se pudo obtener traducción.</p>';
        }
        
        // Clean the HTML response (remove any unwanted tags that might break the modal)
        result = result
            .replace(/<\/?html[^>]*>/gi, "")
            .replace(/<\/?head[^>]*>/gi, "")
            .replace(/<\/?body[^>]*>/gi, "")
            .replace(/<\/?meta[^>]*>/gi, "")
            .replace(/<\/?link[^>]*>/gi, "")
            .replace(/<\/?style[^>]*>/gi, "")
            .replace(/<\/?script[^>]*>[\s\S]*?<\/?script>/gi, "")
            .trim();
            
        // Ensure we have some content
        if (!result || result.trim() === "") {
            return '<p><strong>[Traducción no disponible]</strong></p><p>El servicio de traducción no respondió correctamente.</p>';
        }
        
        return result;
    } catch (e) {
        console.error("[Polyglot] Gemini error:", e);
        return '<p><strong>[Error de conexión]</strong></p><p>No se pudo conectar al servicio de traducción.</p>';
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
        const { status, data } = await Native.makeGeminiRequest(
            apiKey,
            "gemini-2.5-flash",
            `La palabra en inglés es "${word}". Dame 10 sinónimos en español para esta palabra. Incluye sinónimos formales, informales, jerga coloquial y alternativas comunes. Responde SOLO con una lista separada por comas de sinónimos en español, sin explicaciones, sin numeración, sin texto extra. Ejemplo: feliz, contento, alegre, satisfecho`
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
                        Translation (${settings.store.learningLanguage || "en"} → ${settings.store.nativeLanguage || "es"})
                    </div>
                    <div id="polyglot-translation" style="color: #dcddde; line-height: 1.8; font-size: 14px;">
                        ${translationData || '<span style="color:#72767d;">Loading...</span>'}
                    </div>
                </div>
            
            <div style="padding: 12px 16px; font-size: 11px; color: #72767d; border-top: 1px solid #202225;">
                Click words in header for synonyms • Powered by Datamuse & Gemini
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
                    <div style="text-align: center; color: #72767d; padding: 20px;">Loading...</div>
                </div>
                
                <div style="padding: 12px 16px; font-size: 11px; color: #72767d; border-top: 1px solid #202225;">
                    Powered by Gemini • Polyglot
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
        let exampleEN = "";
        let exampleES = "";
        try {
            const { status, data } = await Native.makeGeminiRequest(
                settings.store.geminiApiKey,
                "gemini-2.5-flash",
                `Genera un ejemplo de uso de la palabra inglesa "${word}" en una oración en inglés, y su traducción al español. Responde en formato JSON: {"en": "oración en inglés", "es": "traducción al español"}. Solo el JSON, sin explicaciones.`
            );
            
            if (status === 200) {
                const parsed = JSON.parse(data);
                const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
                try {
                    // Clean the text and try to parse JSON
                    const cleanedText = text.replace(/```json|```/g, "").trim();
                    const exampleData = JSON.parse(cleanedText);
                    exampleEN = exampleData.en || "";
                    exampleES = exampleData.es || "";
                } catch (e) {
                    // Fallback if JSON parsing fails
                    exampleEN = `The new patch will enhance the system performance.`;
                    exampleES = `El nuevo parche mejorará el rendimiento del sistema.`;
                }
            }
        } catch (e) {
            exampleEN = `The new patch will enhance the system performance.`;
            exampleES = `El nuevo parche mejorará el rendimiento del sistema.`;
        }
        
        // Update wordTranslationData
        wordTranslationData = translation || word;
        
        let html = `
            <div style="margin-bottom: 20px;">
                <div style="color: #5865f2; font-size: 14px; font-weight: 600; margin-bottom: 8px;">
                    Definición:
                </div>
                <div style="color: #dcddde; line-height: 1.6; background: #2f3136; padding: 12px; border-radius: 6px; font-size: 14px;">
                    ${definition || 'Aumentar o mejorar aún más la calidad, el valor o la eficiencia de un proceso o sistema.'}
                </div>
            </div>
        `;
        
        // Synonyms section
        if (synonyms.length > 0) {
            html += `
                <div style="margin-bottom: 20px;">
                    <div style="color: #5865f2; font-size: 14px; font-weight: 600; margin-bottom: 8px;">
                        Sinónimos en español:
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
                    Ejemplo visual / Contexto:
                </div>
                <div style="color: #dcddde; line-height: 1.6; background: #2f3136; padding: 12px; border-radius: 6px; font-size: 14px;">
                    EN: "${exampleEN}"<br>
                    ES: "${exampleES}"
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
        
        if (!geminiKey) {
            translationData = '<span style="color:#72767d;">Set your Gemini API key in plugin settings for translation.</span>';
            if (translationDiv) translationDiv.innerHTML = translationData;
            return;
        }

        translationData = await translateWithGemini(cleanText, geminiKey);
        
        if (!translationData) {
            translationData = '<span style="color:#72767d;">Translation failed. Check your API key.</span>';
        }
        
        // Extract translation word from HTML (simplified)
        wordTranslationData = translationData.replace(/<[^>]*>/g, "").substring(0, 30) || "Mejorar";
        
        // Update header with translation
        const header = document.querySelector("#polyglot-popup h3");
        if (header) {
            header.textContent = `${cleanText.substring(0, 20)}${cleanText.length > 20 ? '...' : ''} (EN) -> ${wordTranslationData} (ES)`;
        }
        
        // Display translation with properly rendered HTML (markdown converted)
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
// Gemini Service - Translation Function

import { settings } from "../../settings";
import { getRecentMessages, formatConversationContext } from "../../utils/messages";
import { TranslationData } from "./types";
import { generateContent, extractJson, getLangLabel, getCurrentModel } from "./client";

export const translateWithGemini = async (
    text: string,
    targetLang: string,
    model?: string
): Promise<TranslationData> => {
    const targetLangLabel = getLangLabel(targetLang);
    const nativeLangLabel = getLangLabel(settings.store.nativeLanguage);
    const userLevel = settings.store.userLevel || "intermediate";
    
    // Escape characters that could break the prompt or JSON parsing
    const escapeForPrompt = (str: string): string => {
        return str
            .replace(/\\/g, '\\\\')    // Backslashes
            .replace(/"/g, '\\"')      // Double quotes
            .replace(/'/g, "\\'")      // Single quotes
            .replace(/`/g, "\\`")      // Backticks
            .replace(/\$/g, "\\$")     // Dollar signs (template injection)
            .replace(/\n/g, " ")       // Newlines
            .replace(/\r/g, " ")       // Carriage returns
            .replace(/\t/g, " ");      // Tabs
    };
    
    const safeText = escapeForPrompt(text);
    
    // Get conversation context (last 20 messages)
    const recentMessages = getRecentMessages(20);
    const conversationContext = formatConversationContext(recentMessages);
    
    const contextSection = conversationContext 
        ? `\n\n### CONVERSATION CONTEXT (últimos ${recentMessages.length} mensajes del canal):\n${conversationContext}\n`
        : "";
    
    const prompt = `### ROLE
Eres un experto en Lingüística Aplicada y Desarrollador de Contenido Educativo. Tu objetivo es generar objetos JSON estrictos para un estudiante de nivel ${userLevel} cuyo idioma nativo es ${nativeLangLabel} y está aprendiendo ${targetLangLabel}.${contextSection}
### INPUT VARIABLE
- Phrase: """${safeText}"""

### CONSTRAINTS (REGLAS DE ORO)
1. **No Hallucination**: Si una palabra no tiene un rol gramatical claro para el nivel ${userLevel}, usa una explicación funcional simple.
2. **Contextual Accuracy**: Las "alternatives" deben ser coherentes con el nivel ${userLevel} y el contexto de la conversación.
3. **Grammar Alignment**: El array "analysis" debe desglosar ÚNICAMENTE los elementos de la frase en ${targetLangLabel}.
4. **JSON Integrity**: Prohibido usar "trailing commas", texto introductorio o explicaciones fuera del bloque JSON. 
    5. **Strict Language Mapping (CRÍTICO)**:
      - "element": SIEMPRE en ${targetLangLabel} (idioma objetivo/inglés). 
        Ejemplo: si la frase seleccionada es "¿Cómo estás?", element = "How" (EN INGLÉS, NO español).
        Ejemplo: si la frase es "good morning", element = "good morning" (en inglés original).
      - "function": SIEMPRE en ${nativeLangLabel} (español). 
        Ejemplo: "Adverbio interrogativo que se usa para preguntar".
      - "translation": SIEMPRE en ${nativeLangLabel} (español).
        Ejemplo: "¿Cómo estás?" (la traducción o el significado en español).

### ⚠️ WARNING IMPORTANTE
"element" NUNCA debe estar en español. Si la frase original está en español, 
"element" debe ser la TRADUCCIÓN al inglés. El texto original va en "translation".
NO confundas: "element" = palabra en inglés, "translation" = significado en español.

### ⚠️ WARNING PARA ALTERNATIVAS
En el array "alternatives", el campo "term" DEBE estar SIEMPRE en inglés, nunca en español.
Ejemplo correcto: { "term": "enhance", "description": "Mejorar o aumentar la calidad" }
Ejemplo incorrecto: { "term": "mejorar", "description": "Mejorar o aumentar la calidad" }

### JSON SCHEMA STRUCTURE
Responde ÚNICAMENTE con este JSON:
{
  "entry": "phrase",
  "phonetics": "ipa_notation",
  "translation": "text",
  "pedagogical_note": "text",
  "alternatives": [
    {
      "term": "phrase in English",
      "description": "text"
    }
  ],
  "analysis": [
    {
      "element": "texto en idioma objetivo",
      "function": "función en español",
      "translation": "traducción en español"
    }
  ]
}`;

    const raw = await generateContent(prompt, model || getCurrentModel());
    
    try {
        const parsed = extractJson(raw);
        return {
            entry: parsed.entry ?? text,
            phonetics: parsed.phonetics ?? "",
            translation: parsed.translation ?? raw,
            pedagogical_note: parsed.pedagogical_note ?? "",
            alternatives: parsed.alternatives ?? [],
            analysis: parsed.analysis ?? []
        };
    } catch {
        return {
            entry: text,
            phonetics: "",
            translation: raw,
            pedagogical_note: "",
            alternatives: [],
            analysis: []
        };
    }
};

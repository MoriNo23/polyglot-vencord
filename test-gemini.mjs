#!/usr/bin/env node

/**
 * Test script for Gemini API to understand response format
 */

const testGeminiAPI = async (apiKey, model, prompt) => {
    console.log('Testing Gemini API with:');
    console.log('Model:', model);
    console.log('Prompt:', prompt);
    console.log('---');
    
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            }
        );

        const data = await response.text();
        
        console.log('Status:', response.status);
        console.log('Response (raw):');
        console.log(data);
        console.log('---');
        
        try {
            const parsed = JSON.parse(data);
            console.log('Parsed JSON:');
            console.log(JSON.stringify(parsed, null, 2));
            console.log('---');
            
            // Extract the text content
            const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
            console.log('Extracted text:');
            console.log(text);
            console.log('---');
            
            return { success: true, text, parsed };
        } catch (e) {
            console.log('Failed to parse JSON:', e.message);
            return { success: false, error: e.message, raw: data };
        }
    } catch (e) {
        console.error('Request failed:', e.message);
        return { success: false, error: e.message };
    }
};

// Test different prompts to see response formats
const runTests = async () => {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
        console.error('Please set GEMINI_API_KEY environment variable');
        console.log('Example: GEMINI_API_KEY=your_key node test-gemini.mjs');
        process.exit(1);
    }
    
    const model = 'gemini-3.1-flash-lite-preview';
    
    console.log('=== Test 1: Translation ===');
    await testGeminiAPI(apiKey, model, 
        `Translate the following English text to Spanish: "Hello, how are you?"`);
    
    console.log('\n=== Test 2: Synonyms ===');
    await testGeminiAPI(apiKey, model,
        `Give 5 synonyms for the word "happy". Return ONLY a comma-separated list.`);
    
    console.log('\n=== Test 3: Spanish Synonyms ===');
    await testGeminiAPI(apiKey, model,
        `La palabra en inglés es "happy". Dame 5 sinónimos en español. Responde SOLO con una lista separada por comas.`);
    
    console.log('\n=== Test 4: JSON Format ===');
    await testGeminiAPI(apiKey, model,
        `Give me a translation of "hello" from English to Spanish. Respond in JSON format: {"en": "hello", "es": "translation"}`);
    
    console.log('\n=== Test 5: Educational Translation ===');
    await testGeminiAPI(apiKey, model,
        `Eres Polyglot, un asistente de aprendizaje de idiomas.
        
Responde en formato JSON con esta estructura:
{
  "translation": "traducción al español",
  "definition": "definición en español",
  "synonyms": ["sinónimo1", "sinónimo2", "sinónimo3"],
  "example_en": "example sentence in English",
  "example_es": "oración de ejemplo en español",
  "grammar": "explicación gramatical breve en español"
}

Texto a traducir: "The cat is on the table"`);
};

runTests().catch(console.error);
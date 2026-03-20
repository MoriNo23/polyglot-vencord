/**
 * Free Dictionary API service for fetching definitions
 */

interface DictionaryResponse {
  word: string;
  phonetic?: string;
  phonetics?: Array<{
    text?: string;
    audio?: string;
    sourceUrl?: string;
    license?: { name: string; url: string };
  }>;
  meanings: Array<{
    partOfSpeech: string;
    definitions: Array<{
      definition: string;
      synonyms?: string[];
      antonyms?: string[];
      example?: string;
    }>;
    synonyms?: string[];
    antonyms?: string[];
  }>;
  license?: { name: string; url: string };
  sourceUrls: string[];
}

/**
 * Fetch definitions for a given word using Free Dictionary API
 * @param word The word to get definitions for
 * @returns Array of definition objects or empty array on error
 */
export const fetchDefinitions = async (word: string): Promise<any[]> => {
  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        return []; // No definitions found
      }
      throw new Error(`Dictionary API error: ${response.status}`);
    }

    const data: DictionaryResponse[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching definitions from Dictionary API:", error);
    return [];
  }
};
/**
 * Datamuse API service for fetching synonyms
 */

interface DatamuseResponse {
  word: string;
  score: number;
  tags?: string[];
}

/**
 * Fetch synonyms for a given word using Datamuse API
 * @param word The word to find synonyms for
 * @returns Array of synonym words
 */
export const fetchSynonyms = async (word: string): Promise<string[]> => {
  try {
    const response = await fetch(
      `https://api.datamuse.com/words?rel_syn=${encodeURIComponent(word)}&max=10`
    );

    if (!response.ok) {
      throw new Error(`Datamuse API error: ${response.status}`);
    }

    const data: DatamuseResponse[] = await response.json();
    return data.map(item => item.word);
  } catch (error) {
    console.error("Error fetching synonyms from Datamuse:", error);
    return [];
  }
};
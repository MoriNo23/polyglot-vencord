/**
 * Text selection detection utilities
 */

let selectionTimeout: NodeJS.Timeout | null = null;
let currentSelection = "";

/**
 * Get the currently selected text
 * @returns The selected text or empty string
 */
export const getSelectedText = (): string => {
  const selection = window.getSelection();
  if (!selection) return "";
  
  return selection.toString().trim();
};

/**
 * Get the bounding rectangle of the current selection
 * @returns The bounding rectangle or null
 */
export const getSelectionRect = (): DOMRect | null => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;
  
  const range = selection.getRangeAt(0);
  return range.getBoundingClientRect();
};

/**
 * Check if there's currently selected text
 * @returns boolean indicating if text is selected
 */
export const hasSelection = (): boolean => {
  const text = getSelectedText();
  return text.length > 0;
};

/**
 * Listen for text selection changes
 * @param callback Function to call when selection changes
 * @param delay Debounce delay in milliseconds
 */
export const onSelectionChange = (
  callback: (text: string, rect: DOMRect | null) => void,
  delay: number = 300
): (() => void) => {
  const handleSelectionChange = () => {
    if (selectionTimeout) {
      clearTimeout(selectionTimeout);
    }
    
    selectionTimeout = setTimeout(() => {
      const text = getSelectedText();
      const rect = getSelectionRect();
      
      // Only trigger callback if selection actually changed
      if (text !== currentSelection) {
        currentSelection = text;
        callback(text, rect);
      }
    }, delay);
  };
  
  // Add event listeners
  document.addEventListener("selectionchange", handleSelectionChange);
  document.addEventListener("mouseup", handleSelectionChange);
  
  // Return cleanup function
  return () => {
    if (selectionTimeout) {
      clearTimeout(selectionTimeout);
    }
    document.removeEventListener("selectionchange", handleSelectionChange);
    document.removeEventListener("mouseup", handleSelectionChange);
  };
};

/**
 * Clear the current selection
 */
export const clearSelection = (): void => {
  const selection = window.getSelection();
  if (selection) {
    selection.removeAllRanges();
  }
  currentSelection = "";
};

/**
 * Check if selection is within Discord message content
 * @returns boolean indicating if selection is in Discord message
 */
export const isDiscordMessageSelection = (): boolean => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return false;
  
  const range = selection.getRangeAt(0);
  const container = range.commonAncestorContainer;
  
  // Check if selection is within message content
  const messageContent = (container as Element).closest?.(
    '[class*="messageContent"]'
  );
  
  return !!messageContent;
};

/**
 * Get the selected word (if selection is a single word)
 * @returns The selected word or null if multiple words are selected
 */
export const getSelectedWord = (): string | null => {
  const text = getSelectedText();
  if (!text || text.includes(" ") || text.includes("\n")) return null;
  return text;
};

/**
 * Get the selected sentence (if selection is a single sentence)
 * @returns The selected sentence or null
 */
export const getSelectedSentence = (): string | null => {
  const text = getSelectedText();
  if (!text) return null;
  
  // Simple sentence detection: ends with . ! ? and is not multiple sentences
  const sentenceRegex = /^[^.!?]+[.!?]$/;
  if (sentenceRegex.test(text)) {
    return text;
  }
  
  return null;
};
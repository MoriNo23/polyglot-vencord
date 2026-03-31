// Cache for the last selection
let lastSelection: string = "";
let lastSelectionTime: number = 0;

if (typeof document !== "undefined") {
    document.addEventListener("selectionchange", () => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            const text = selection.toString().trim();
            if (text.length > 0) {
                lastSelection = text;
                lastSelectionTime = Date.now();
            }
        }
    });
}

export const getSelectedText = (): string => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
        if (Date.now() - lastSelectionTime < 2000 && lastSelection.length > 0) {
            return lastSelection;
        }
        return "";
    }
    
    const selectionText = selection.toString().trim();
    if (!selectionText) return "";
    
    const range = selection.getRangeAt(0);
    
    // Find ALL messageContent elements and find the one that CONTAINS this selection
    const allMessageContents = document.querySelectorAll('[class*="messageContent"]');
    
    for (const mc of allMessageContents) {
        const containsStart = mc.contains(range.startContainer);
        const containsEnd = mc.contains(range.endContainer);
        
        if (containsStart && containsEnd) {
            // Selection is fully within this messageContent
            return selectionText;
        }
    }
    
    // No single messageContent contains the full selection
    // Return empty to avoid copying wrong content
    return "";
};

export const getSelectionRect = (): DOMRect | null => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;

    const range = selection.getRangeAt(0);
    const rects = range.getClientRects();

    return rects.length > 0 ? rects[rects.length - 1] : range.getBoundingClientRect();
};

export const isSingleWord = (text: string): boolean => {
    if (!text) return false;
    const words = text.trim().split(/\s+/);
    return words.length === 1 && words[0].length > 0;
};

export const isDiscordMessageSelection = (): boolean => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return false;

    const range = selection.getRangeAt(0);
    const allMessageContents = document.querySelectorAll('[class*="messageContent"]');
    
    for (const mc of allMessageContents) {
        if (mc.contains(range.startContainer) && mc.contains(range.endContainer)) {
            return true;
        }
    }
    
    return false;
};

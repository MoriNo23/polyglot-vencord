import "./styles.css";

import definePlugin from "@utils/types";
import { createRoot } from "@webpack/common";
import type { Root } from "react-dom/client";

import { settings } from "./src/settings";
import { PopupCard } from "./src/components/PopupCard";
import { getSelectedText, getSelectionRect, isDiscordMessageSelection } from "./src/utils/selection";
import { initGeminiClient } from "./src/services/gemini";

let floatingButton: HTMLButtonElement | null = null;
let popupContainer: HTMLDivElement | null = null;
let popupRoot: Root | null = null;
let boundMouseUp: ((e: MouseEvent) => void) | null = null;
let boundMouseDown: ((e: MouseEvent) => void) | null = null;
let selectionBlockerStyle: HTMLStyleElement | null = null;
let toggleButton: HTMLButtonElement | null = null;

function removeFloatingButton() {
    if (floatingButton) {
        floatingButton.remove();
        floatingButton = null;
    }
}

function removeToggleButton() {
    if (toggleButton) {
        toggleButton.remove();
        toggleButton = null;
    }
}

function createToggleButton() {
    removeToggleButton();

    toggleButton = document.createElement("button");
    toggleButton.textContent = "\uD83C\uDF10";
    toggleButton.title = "Polyglot: Open Language Panel";
    toggleButton.className = "polyglot-toggle-btn";
    Object.assign(toggleButton.style, {
        position: "fixed",
        right: "20px",
        bottom: "20px",
        zIndex: "2147483646",
        backgroundColor: "#5865f2",
        color: "white",
        border: "none",
        borderRadius: "50%",
        width: "50px",
        height: "50px",
        cursor: "pointer",
        fontSize: "20px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        transition: "transform 0.2s ease, background-color 0.2s ease",
    });

    document.body.appendChild(toggleButton);

    toggleButton.addEventListener("click", e => {
        e.stopPropagation();
        e.preventDefault();
        
        if (popupContainer) {
            // If panel is open, close it
            removePopup();
        } else {
            // If panel is closed, open it with empty text
            showPopup("");
        }
    });
}

function removePopup() {
    if (popupRoot) {
        popupRoot.unmount();
        popupRoot = null;
    }
    if (popupContainer) {
        popupContainer.remove();
        popupContainer = null;
    }
}

function showPopup(text: string) {
    removePopup();

    popupContainer = document.createElement("div");
    popupContainer.id = "polyglot-popup-container";
    document.body.appendChild(popupContainer);

    popupRoot = createRoot(popupContainer);
    popupRoot.render(
        <PopupCard
            isOpen={true}
            onClose={() => removePopup()}
            selectedText={text}
        />
    );
}

function showFloatingButton(x: number, y: number, selectedText: string) {
    removeFloatingButton();

    floatingButton = document.createElement("button");
    floatingButton.textContent = "\uD83C\uDF10";
    floatingButton.title = "Polyglot: Translate & Define";
    floatingButton.className = "polyglot-floating-btn";
    Object.assign(floatingButton.style, {
        position: "fixed",
        left: `${x + 5}px`,
        top: `${y + 5}px`,
        zIndex: "2147483647",
        backgroundColor: "#5865f2",
        color: "white",
        border: "none",
        borderRadius: "6px",
        padding: "4px 8px",
        cursor: "pointer",
        fontSize: "16px",
        lineHeight: "1",
        boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
        transition: "opacity 0.15s ease, transform 0.15s ease",
        opacity: "0",
        transform: "scale(0.8)",
    });

    document.body.appendChild(floatingButton);

    requestAnimationFrame(() => {
        if (floatingButton) {
            floatingButton.style.opacity = "1";
            floatingButton.style.transform = "scale(1)";
        }
    });

    floatingButton.addEventListener("click", e => {
        e.stopPropagation();
        e.preventDefault();
        removeFloatingButton();
        showPopup(selectedText);
    });
}

export default definePlugin({
    name: "Polyglot",
    description: "Educational language learning tool - get translations, synonyms, and definitions by selecting text in Discord",
    authors: [{ name: "Polyglot", id: 0n }],
    version: "2.0.0",
    settings,

    start() {
        selectionBlockerStyle = document.createElement('style');
        selectionBlockerStyle.id = 'polyglot-selection-blocker';
        selectionBlockerStyle.textContent = '[class*="buttons"] [class*="button"],[class*="buttonsInner"],[class*="hoverBarButton"],[class*="reactions"],[class*="hiddenVisually"],[class*="emojiTooltipText"]{user-select:none!important;-webkit-user-select:none!important;}';
        document.head.appendChild(selectionBlockerStyle);
        const apiKey = settings.store.geminiApiKey;
        const model = settings.store.geminiModel;
        if (apiKey) {
            initGeminiClient(apiKey, model);
        }

        createToggleButton();

        boundMouseUp = () => {
            setTimeout(() => {
                const text = getSelectedText();
                if (!text || text.length < 1) return;
                if (!isDiscordMessageSelection()) return;

                const rect = getSelectionRect();
                if (!rect) return;

                // Re-init in case settings changed since start
                const currentKey = settings.store.geminiApiKey;
                const currentModel = settings.store.geminiModel;
                if (currentKey) {
                    initGeminiClient(currentKey, currentModel);
                }

                showFloatingButton(rect.right, rect.bottom, text);
            }, 50);
        };

        boundMouseDown = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (floatingButton?.contains(target) || popupContainer?.contains(target)) {
                return;
            }
        if (selectionBlockerStyle) {
            selectionBlockerStyle.remove();
            selectionBlockerStyle = null;
        }
        removeFloatingButton();
            // Don't remove popup on mousedown — let popup's own close button handle it
        };

        document.addEventListener("mouseup", boundMouseUp);
        document.addEventListener("mousedown", boundMouseDown);
    },

    stop() {
        if (boundMouseUp) {
            document.removeEventListener("mouseup", boundMouseUp);
            boundMouseUp = null;
        }
        if (boundMouseDown) {
            document.removeEventListener("mousedown", boundMouseDown);
            boundMouseDown = null;
        }
        if (selectionBlockerStyle) {
            selectionBlockerStyle.remove();
            selectionBlockerStyle = null;
        }
        removeFloatingButton();
        removePopup();
        removeToggleButton();
    },
});

import { React, useState } from "@webpack/common";
import { SynonymsTab } from "./SynonymsTab";
import { TranslationTab } from "./TranslationTab";
import { DefinitionsTab } from "./DefinitionsTab";

interface PopupCardProps {
  isOpen: boolean;
  onClose: () => void;
  selectedText: string;
  position: { x: number; y: number };
}

export const PopupCard = ({ 
  isOpen, 
  onClose, 
  selectedText,
  position 
}: PopupCardProps) => {
  const [activeTab, setActiveTab] = useState<"synonyms" | "translation" | "definitions">("synonyms");

  if (!isOpen) return null;

  const tabs = [
    { id: "synonyms", label: "Synonyms" },
    { id: "translation", label: "Translation" },
    { id: "definitions", label: "Definitions" },
  ];

  return (
    <div
      className="polyglot-popup-card"
      style={{
        position: "fixed",
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 9999,
        backgroundColor: "#36393f",
        borderRadius: "8px",
        padding: "16px",
        minWidth: "300px",
        maxWidth: "400px",
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3)",
        border: "1px solid #202225",
        color: "#dcddde",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h3 style={{ margin: 0, color: "#ffffff" }}>
          Polyglot
        </h3>
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
            color: "#b9bbbe",
            cursor: "pointer",
            fontSize: "18px",
            padding: "4px 8px",
            lineHeight: 1,
          }}
          type="button"
        >
          ×
        </button>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <div style={{ 
          backgroundColor: "#2f3136", 
          padding: "8px 12px", 
          borderRadius: "4px",
          border: "1px solid #202225",
          color: "#ffffff",
          fontWeight: 500,
        }}>
          "{selectedText}"
        </div>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <div style={{ display: "flex", gap: "4px", marginBottom: "12px" }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: "8px 12px",
                border: "none",
                borderRadius: "4px",
                backgroundColor: activeTab === tab.id ? "#5865f2" : "#4f545c",
                color: activeTab === tab.id ? "#ffffff" : "#dcddde",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 500,
                flex: 1,
                transition: "background-color 0.2s ease",
              }}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ 
          backgroundColor: "#2f3136", 
          padding: "16px", 
          borderRadius: "4px",
          minHeight: "200px",
          border: "1px solid #202225",
        }}>
          {activeTab === "synonyms" && <SynonymsTab text={selectedText} />}
          {activeTab === "translation" && <TranslationTab text={selectedText} />}
          {activeTab === "definitions" && <DefinitionsTab text={selectedText} />}
        </div>
      </div>

      <div style={{ 
        borderTop: "1px solid #202225", 
        paddingTop: "12px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <div style={{ fontSize: "12px", color: "#72767d" }}>
          Powered by Gemini & DeepL
        </div>
        <button
          onClick={onClose}
          style={{
            padding: "6px 12px",
            backgroundColor: "#4f545c",
            border: "none",
            borderRadius: "4px",
            color: "#ffffff",
            cursor: "pointer",
            fontSize: "13px",
          }}
          type="button"
        >
          Close
        </button>
      </div>
    </div>
  );
};
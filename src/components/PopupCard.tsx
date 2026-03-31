import { React, useState, useEffect } from "@webpack/common";
import { SynonymsTab } from "./SynonymsTab";
import { TranslationTab } from "./TranslationTab";
import { DefinitionsTab } from "./DefinitionsTab";
import { WordSegment } from "./WordSegment";
import { isSingleWord } from "../utils/selection";

interface PopupCardProps {
  isOpen: boolean;
  onClose: () => void;
  selectedText: string;
}

export const PopupCard = ({ 
  isOpen, 
  onClose, 
  selectedText
}: PopupCardProps) => {
  const [activeTab, setActiveTab] = useState<"synonyms" | "translation" | "definitions">("synonyms");
  const [clickedWord, setClickedWord] = useState<string | null>(null);

   useEffect(() => {
     setActiveTab(isSingleWord(selectedText) ? "synonyms" : "translation");
     setClickedWord(null);
   }, [selectedText]);

  if (!isOpen) return null;

  // Handle empty text (when panel is opened via toggle)
  if (!selectedText || selectedText.trim() === "") {
    return (
      <div
        className="polyglot-popup-card"
        style={{
          position: "fixed",
          right: "0",
          top: "0",
          height: "100vh",
          width: "420px",
          zIndex: 9999,
          backgroundColor: "#36393f",
          borderRadius: "8px 0 0 8px",
          padding: "16px",
          boxShadow: "-4px 0 24px rgba(0, 0, 0, 0.3)",
          border: "1px solid #202225",
          color: "#dcddde",
          overflowY: "auto",
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
        
        <div style={{ 
          backgroundColor: "#2f3136", 
          padding: "16px", 
          borderRadius: "4px",
          minHeight: "200px",
          border: "1px solid #202225",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#72767d",
          fontSize: "14px",
        }}>
          Select text in Discord and click the globe button to translate
        </div>
      </div>
    );
  }

  const handleWordClick = (word: string) => {
    setClickedWord(word);
    setActiveTab("synonyms");
  };

  const handleTabClick = (tabId: "synonyms" | "translation" | "definitions") => {
    setActiveTab(tabId);
    if (tabId === "translation") {
      setClickedWord(null);
    }
  };

  const isOriginalWord = isSingleWord(selectedText);
  const currentText = clickedWord || selectedText;

  const showTabs = isOriginalWord;

  return (
    <div
      className="polyglot-popup-card"
      style={{
        position: "fixed",
        right: "0",
        top: "0",
        height: "100vh",
        width: "420px",
        zIndex: 9999,
        backgroundColor: "#36393f",
        borderRadius: "8px 0 0 8px",
        padding: "16px",
        boxShadow: "-4px 0 24px rgba(0, 0, 0, 0.3)",
        border: "1px solid #202225",
        color: "#dcddde",
        overflowY: "auto",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h3 style={{ margin: 0, color: "#ffffff", fontSize: "16px", fontWeight: 600 }}>
          Polyglot
        </h3>
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
            color: "#b9bbbe",
            cursor: "pointer",
            fontSize: "20px",
            padding: "4px 8px",
            lineHeight: 1,
            borderRadius: "4px",
            transition: "background-color 0.15s ease, color 0.15s ease",
          }}
          type="button"
        >
          ×
        </button>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <div className="polyglot-card">
          <WordSegment text={currentText} onWordClick={handleWordClick} />
        </div>
      </div>

      {showTabs && (
        <div style={{ display: "flex", gap: "4px", marginBottom: "12px" }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id as any)}
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
      )}

      <div style={{ 
        backgroundColor: "#2f3136", 
        padding: "16px", 
        borderRadius: "6px",
        minHeight: "200px",
        maxHeight: "calc(100vh - 200px)",
        overflowY: "auto",
        border: "1px solid #40444b",
      }}>
         {!showTabs && <TranslationTab text={currentText} />}
         {showTabs && activeTab === "synonyms" && (
           isOriginalWord || clickedWord ? (
             <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
               <SynonymsTab text={currentText} phrase={selectedText} />
               <div style={{ borderTop: "1px solid #40444b", paddingTop: "16px" }}>
                 <DefinitionsTab text={currentText} />
               </div>
             </div>
           ) : (
             <SynonymsTab text={selectedText} phrase={selectedText} />
           )
         )}
         {showTabs && activeTab === "translation" && <TranslationTab text={currentText} />}
         {showTabs && activeTab === "definitions" && isOriginalWord && <DefinitionsTab text={currentText} />}
      </div>

      <div className="polyglot-footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        Powered by Gemini
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
            transition: "background-color 0.15s ease",
          }}
          type="button"
        >
          Close
        </button>
      </div>
    </div>
  );
};
import { React, useState, useEffect } from "@webpack/common";
import { translateWithGemini } from "../services/gemini";
import { translateWithDeepl } from "../services/deepl";

interface TranslationTabProps {
  text: string;
}

export const TranslationTab = ({ text }: TranslationTabProps) => {
  const [translation, setTranslation] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sourceLang] = useState<string>("auto");
  const [targetLang, setTargetLang] = useState<string>("es");
  const [service, setService] = useState<"gemini" | "deepl">("gemini");

  const languages = [
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "it", name: "Italian" },
    { code: "pt", name: "Portuguese" },
    { code: "ru", name: "Russian" },
    { code: "ja", name: "Japanese" },
    { code: "ko", name: "Korean" },
    { code: "zh", name: "Chinese" },
    { code: "ar", name: "Arabic" },
  ];

  useEffect(() => {
    const loadTranslation = async () => {
      if (!text.trim()) return;
      
      setLoading(true);
      setError(null);
      
      try {
        let result = "";
        
        if (service === "gemini") {
          result = await translateWithGemini(text, targetLang);
        } else {
          result = await translateWithDeepl(text, targetLang, sourceLang === "auto" ? undefined : sourceLang);
        }
        
        if (result) {
          setTranslation(result);
        } else {
          setError("Translation failed. Please check your API key.");
        }
      } catch (err) {
        setError("Failed to translate text");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadTranslation();
  }, [text, targetLang, service, sourceLang]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", color: "#72767d" }}>
        <div style={{ marginBottom: "8px" }}>Translating...</div>
        <div style={{ fontSize: "12px" }}>
          Using {service === "gemini" ? "Gemini" : "DeepL"} API
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: "12px" }}>
        <div style={{ 
          display: "flex", 
          gap: "8px", 
          marginBottom: "12px",
          flexWrap: "wrap",
        }}>
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            style={{
              backgroundColor: "#4f545c",
              color: "#ffffff",
              border: "none",
              borderRadius: "4px",
              padding: "6px 8px",
              fontSize: "13px",
              cursor: "pointer",
              flex: 1,
              minWidth: "100px",
            }}
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>

          <select
            value={service}
            onChange={(e) => setService(e.target.value as any)}
            style={{
              backgroundColor: "#4f545c",
              color: "#ffffff",
              border: "none",
              borderRadius: "4px",
              padding: "6px 8px",
              fontSize: "13px",
              cursor: "pointer",
              flex: 1,
              minWidth: "100px",
            }}
          >
            <option value="gemini">Gemini API</option>
            <option value="deepl">DeepL API</option>
          </select>
        </div>

        {error && (
          <div style={{ 
            backgroundColor: "#ed4245", 
            color: "#ffffff",
            padding: "8px 12px",
            borderRadius: "4px",
            marginBottom: "12px",
            fontSize: "13px",
          }}>
            {error}
            {service === "gemini" && (
              <div style={{ marginTop: "4px", fontSize: "12px", opacity: 0.8 }}>
                Try switching to DeepL API
              </div>
            )}
          </div>
        )}

        <div style={{ marginBottom: "12px" }}>
          <div style={{ color: "#72767d", fontSize: "12px", marginBottom: "4px" }}>
            Original ({sourceLang === "auto" ? "auto" : sourceLang}):
          </div>
          <div style={{ 
            backgroundColor: "#202225",
            padding: "8px 12px",
            borderRadius: "4px",
            color: "#ffffff",
            fontSize: "14px",
            border: "1px solid #202225",
          }}>
            {text}
          </div>
        </div>

        <div>
          <div style={{ color: "#72767d", fontSize: "12px", marginBottom: "4px" }}>
            Translation ({targetLang}):
          </div>
          <div style={{ 
            backgroundColor: "#2f3136",
            padding: "8px 12px",
            borderRadius: "4px",
            color: "#ffffff",
            fontSize: "14px",
            minHeight: "40px",
            border: "1px solid #202225",
            display: "flex",
            alignItems: "center",
          }}>
            {translation || "No translation available"}
          </div>
        </div>
      </div>

      <div style={{ 
        fontSize: "12px", 
        color: "#72767d",
        borderTop: "1px solid #202225",
        paddingTop: "12px",
        marginTop: "12px",
      }}>
        {service === "gemini" ? (
          <div>Powered by Gemini API (requires API key in settings)</div>
        ) : (
          <div>Powered by DeepL API (requires API key in settings)</div>
        )}
      </div>
    </div>
  );
};
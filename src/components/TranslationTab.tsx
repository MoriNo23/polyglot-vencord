import { React, useState, useEffect } from "@webpack/common";
import {
  translateWithGemini,
  GeminiError,
  TranslationData,
} from "../services/gemini";
import "../../styles.css";

const BookIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle", marginRight: "6px" }}>
    <title>Book</title>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const SwapIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle", marginRight: "6px" }}>
    <title>Swap</title>
    <path d="M16 3l4 4-4 4" />
    <path d="M20 7H4" />
    <path d="M8 21l-4-4 4-4" />
    <path d="M4 17h16" />
  </svg>
);

const TextIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle", marginRight: "6px" }}>
    <title>Text</title>
    <polyline points="4 7 4 4 20 4 20 7" />
    <line x1="9" y1="20" x2="15" y2="20" />
    <line x1="12" y1="4" x2="12" y2="20" />
  </svg>
);

const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle", margin: "0 6px", color: "#72767d" }}>
    <title>Arrow</title>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

interface TranslationTabProps {
  text: string;
}

export const TranslationTab = ({ text }: TranslationTabProps) => {
  const [data, setData] = useState<TranslationData>({
    entry: "",
    phonetics: "",
    translation: "",
    pedagogical_note: "",
    alternatives: [],
    analysis: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [targetLang, setTargetLang] = useState<string>("es");

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
       if (!text || !text.trim()) {
         setError("No text to translate");
         setLoading(false);
         return;
       }
       
       setLoading(true);
       setError(null);
       setData({
         entry: "",
         phonetics: "",
         translation: "",
         pedagogical_note: "",
         alternatives: [],
         analysis: []
       });
       
       try {
         const result = await translateWithGemini(text, targetLang);
         setData(result);
       } catch (err: unknown) {
         if (err instanceof GeminiError) {
           setError(err.message);
         } else if (err instanceof Error) {
           setError(`Failed to translate: ${err.message}`);
         } else {
           setError(`Failed to translate: ${String(err)}`);
         }
       } finally {
         setLoading(false);
       }
     };
     
     loadTranslation();
   }, [text, targetLang]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", color: "#72767d" }}>
        <div style={{ marginBottom: "8px" }}>Translating...</div>
        <div style={{ fontSize: "12px" }}>Using Gemini 2.5 Flash API</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: "12px" }}>
        <div style={{ marginBottom: "12px" }}>
          <select
            className="polyglot-select"
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: "#ed4245",
              color: "#ffffff",
              padding: "8px 12px",
              borderRadius: "4px",
              marginBottom: "12px",
              fontSize: "13px",
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <div className="polyglot-label">
              Entrada / Entry
            </div>
            <div className="polyglot-entry">
              <span>{data.entry || text}</span>
              {data.phonetics && (
                <span className="polyglot-entry-phonetics">
                  /{data.phonetics}/
                </span>
              )}
            </div>
          </div>

          <div>
            <div className="polyglot-label">
              Traducción
            </div>
            <div className="polyglot-translation">
              {data.translation || "No translation available"}
            </div>
          </div>

          {data.pedagogical_note && (
            <div>
              <div className="polyglot-section-header">
                <BookIcon />Nota pedagógica
              </div>
              <div className="polyglot-note">
                {data.pedagogical_note}
              </div>
            </div>
          )}

          {data.alternatives?.length > 0 && (
            <div>
              <div className="polyglot-section-header">
                <SwapIcon />Alternativas
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                  gap: "8px",
                }}
              >
                {data.alternatives.map((alt, i) => (
                  <div key={i} className="polyglot-alt-card">
                    <span className="polyglot-alt-term">
                      {alt.term}
                    </span>
                    <span className="polyglot-alt-desc">
                      {alt.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

            {data.analysis?.length > 0 && (
             <div>
               <div className="polyglot-section-header">
                 <TextIcon />Grammatical Analysis
               </div>
                <div className="polyglot-card">
                  {data.analysis.map((item, i) => (
                    <div key={i} className="polyglot-grammar-item">
                      <span className="polyglot-grammar-element">
                        {item.element}
                      </span>
                      <ArrowIcon />
                      <span className="polyglot-grammar-function">
                        {item.function}
                      </span>
                    </div>
                  ))}
                </div>
             </div>
           )}
        </div>
      </div>

      <div className="polyglot-footer">
        Powered by Gemini 2.5 Flash API
      </div>
    </div>
  );
};

import { React, useState, useEffect } from "@webpack/common";
import { getSynonymsWithGemini, GeminiError, SynonymData } from "../services/gemini";

interface SynonymsTabProps {
  text: string;
  phrase: string;
}

export const SynonymsTab = ({ text, phrase }: SynonymsTabProps) => {
  const [data, setData] = useState<SynonymData>({ synonyms: [], detailedExplanation: "", contextUsage: "", grammaticalAnalysis: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

   useEffect(() => {
     const loadSynonyms = async () => {
       if (!text.trim()) return;
       
       setLoading(true);
       setError(null);
       
       try {
         const results = await getSynonymsWithGemini(text, phrase);
         setData(results);
         
         if (results.synonyms.length === 0 && !results.detailedExplanation) {
           setError("No synonyms found");
         }
        } catch (err: unknown) {
          if (err instanceof GeminiError) {
            setError(err.message);
          } else if (err instanceof Error) {
            setError(`Failed to load synonyms: ${err.message}`);
          } else {
            setError(`Failed to load synonyms: ${String(err)}`);
          }
        } finally {
         setLoading(false);
       }
     };

    loadSynonyms();
  }, [text, phrase]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", color: "#72767d" }}>
        <div style={{ marginBottom: "8px" }}>Loading details...</div>
        <div style={{ fontSize: "12px" }}>
          Searching Gemini for "{text}"
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", color: "#ed4245" }}>
        <div>{error}</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div>
        <div className="polyglot-section-header">
          Synonyms for "{text}"
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {data.synonyms.map((synonym, index) => (
            <button
              key={index}
              className="polyglot-pill"
              type="button"
            >
              {synonym}
            </button>
          ))}
        </div>
      </div>

      {data.detailedExplanation && (
        <div>
          <div className="polyglot-section-header">
            Explicación detallada
          </div>
          <div style={{ color: "#dcddde", fontSize: "14px", lineHeight: "1.5" }}>{data.detailedExplanation}</div>
        </div>
      )}

      {data.contextUsage && (
        <div>
          <div className="polyglot-section-header">
            Uso en contexto
          </div>
          <div style={{ color: "#dcddde", fontSize: "14px", fontStyle: "italic", lineHeight: "1.5" }}>"{data.contextUsage}"</div>
        </div>
      )}

      {data.grammaticalAnalysis && (
        <div>
          <div className="polyglot-section-header">
            Análisis gramatical
          </div>
          <div style={{ color: "#dcddde", fontSize: "14px", lineHeight: "1.5" }}>{data.grammaticalAnalysis}</div>
        </div>
      )}
    </div>
  );
};

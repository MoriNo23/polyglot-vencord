import { React, useState, useEffect } from "@webpack/common";
import { fetchSynonyms } from "../services/datamuse";

interface SynonymsTabProps {
  text: string;
}

export const SynonymsTab = ({ text }: SynonymsTabProps) => {
  const [synonyms, setSynonyms] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSynonyms = async () => {
      if (!text.trim()) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const results = await fetchSynonyms(text);
        setSynonyms(results);
        
        if (results.length === 0) {
          setError("No synonyms found");
        }
      } catch (err) {
        setError("Failed to load synonyms");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadSynonyms();
  }, [text]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", color: "#72767d" }}>
        <div style={{ marginBottom: "8px" }}>Loading synonyms...</div>
        <div style={{ fontSize: "12px" }}>
          Searching Datamuse API for "{text}"
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", color: "#ed4245" }}>
        <div>{error}</div>
        <div style={{ fontSize: "12px", marginTop: "8px", color: "#72767d" }}>
          Try Gemini API for contextual synonyms
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: "12px", color: "#72767d", fontSize: "13px" }}>
        Synonyms for "{text}" (from Datamuse):
      </div>
      <div style={{ 
        display: "flex", 
        flexWrap: "wrap", 
        gap: "8px",
      }}>
        {synonyms.map((synonym, index) => (
          <button
            key={index}
            style={{
              backgroundColor: "#4f545c",
              color: "#ffffff",
              padding: "4px 12px",
              borderRadius: "12px",
              fontSize: "13px",
              cursor: "pointer",
              transition: "background-color 0.2s ease",
              border: "none",
              fontWeight: "normal",
            }}
            onClick={() => {
              // Could implement click to search functionality
              console.log("Clicked synonym:", synonym);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                console.log("Clicked synonym:", synonym);
              }
            }}
            type="button"
          >
            {synonym}
          </button>
        ))}
      </div>
      
      {synonyms.length > 0 && (
        <div style={{ 
          marginTop: "16px", 
          paddingTop: "12px",
          borderTop: "1px solid #202225",
          fontSize: "12px",
          color: "#72767d",
        }}>
          Found {synonyms.length} synonyms
        </div>
      )}
    </div>
  );
};
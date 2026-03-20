import { React, useState, useEffect } from "@webpack/common";
import { fetchDefinitions } from "../services/dictionary";
import { getDefinitionWithGemini } from "../services/gemini";

interface DefinitionsTabProps {
  text: string;
}

interface Definition {
  partOfSpeech: string;
  definitions: string[];
  example?: string;
}

export const DefinitionsTab = ({ text }: DefinitionsTabProps) => {
  const [definitions, setDefinitions] = useState<Definition[]>([]);
  const [geminiDefinition, setGeminiDefinition] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [loadingGemini, setLoadingGemini] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGemini, setShowGemini] = useState(false);

  useEffect(() => {
    const loadDefinitions = async () => {
      if (!text.trim()) return;
      
      setLoading(true);
      setError(null);
      setDefinitions([]);
      
      try {
        // First try free dictionary API
        const data = await fetchDefinitions(text);
        
        if (data && data.length > 0) {
          const formattedDefinitions: Definition[] = [];
          
          for (const entry of data) {
            if (entry.meanings) {
              for (const meaning of entry.meanings) {
                const def: Definition = {
                  partOfSpeech: meaning.partOfSpeech,
                  definitions: meaning.definitions.map(d => d.definition),
                  example: meaning.definitions.find(d => d.example)?.example,
                };
                formattedDefinitions.push(def);
              }
            }
          }
          
          setDefinitions(formattedDefinitions);
        } else {
          setError("No definitions found in dictionary. Try Gemini API for enhanced definitions.");
        }
      } catch (err) {
        setError("Failed to load definitions");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadDefinitions();
  }, [text]);

  const loadGeminiDefinition = async () => {
    if (!text.trim()) return;
    
    setLoadingGemini(true);
    setShowGemini(true);
    
    try {
      const definition = await getDefinitionWithGemini(text);
      if (definition) {
        setGeminiDefinition(definition);
      } else {
        setGeminiDefinition("Failed to get definition from Gemini API. Please check your API key.");
      }
    } catch (err) {
      setGeminiDefinition("Error calling Gemini API");
      console.error(err);
    } finally {
      setLoadingGemini(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", color: "#72767d" }}>
        <div style={{ marginBottom: "8px" }}>Loading definitions...</div>
        <div style={{ fontSize: "12px" }}>
          Searching Free Dictionary API for "{text}"
        </div>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div style={{ 
          backgroundColor: "#4f545c", 
          padding: "12px",
          borderRadius: "4px",
          marginBottom: "16px",
          border: "1px solid #72767d",
        }}>
          <div style={{ color: "#dcddde", marginBottom: "8px" }}>
            {error}
          </div>
          <button
            onClick={loadGeminiDefinition}
            disabled={loadingGemini}
            style={{
              backgroundColor: "#5865f2",
              color: "#ffffff",
              border: "none",
              borderRadius: "4px",
              padding: "6px 12px",
              cursor: loadingGemini ? "not-allowed" : "pointer",
              fontSize: "13px",
              opacity: loadingGemini ? 0.7 : 1,
            }}
            type="button"
          >
            {loadingGemini ? "Loading..." : "Try Gemini API"}
          </button>
        </div>
      )}

      {showGemini && (
        <div style={{ marginBottom: "16px" }}>
          <div style={{ 
            color: "#72767d", 
            fontSize: "12px", 
            marginBottom: "8px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}>
            <span>Gemini AI Definition:</span>
            <button
              onClick={() => setShowGemini(false)}
              style={{
                background: "transparent",
                border: "none",
                color: "#b9bbbe",
                cursor: "pointer",
                fontSize: "14px",
                padding: "2px 4px",
              }}
              type="button"
            >
              ×
            </button>
          </div>
          <div style={{ 
            backgroundColor: "#2f3136",
            padding: "12px",
            borderRadius: "4px",
            color: "#ffffff",
            fontSize: "14px",
            lineHeight: "1.5",
            border: "1px solid #202225",
            whiteSpace: "pre-wrap",
          }}>
            {loadingGemini ? "Loading..." : geminiDefinition}
          </div>
        </div>
      )}

      {definitions.length > 0 ? (
        <div>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            marginBottom: "16px",
          }}>
            <div style={{ color: "#72767d", fontSize: "13px" }}>
              Definitions from Free Dictionary:
            </div>
            <button
              onClick={loadGeminiDefinition}
              disabled={loadingGemini}
              style={{
                backgroundColor: "transparent",
                color: "#5865f2",
                border: "1px solid #5865f2",
                borderRadius: "4px",
                padding: "4px 8px",
                cursor: loadingGemini ? "not-allowed" : "pointer",
                fontSize: "12px",
                opacity: loadingGemini ? 0.7 : 1,
              }}
              type="button"
            >
              {loadingGemini ? "Loading..." : "Enhance with Gemini"}
            </button>
          </div>

          {definitions.map((def, index) => (
            <div 
              key={index}
              style={{ 
                marginBottom: "16px",
                paddingBottom: index < definitions.length - 1 ? "16px" : 0,
                borderBottom: index < definitions.length - 1 ? "1px solid #202225" : "none",
              }}
            >
              <div style={{ 
                color: "#5865f2", 
                fontSize: "14px", 
                fontWeight: 500,
                marginBottom: "8px",
                textTransform: "capitalize",
              }}>
                {def.partOfSpeech}
              </div>
              
              <div style={{ marginBottom: "8px" }}>
                {def.definitions.map((definition, defIndex) => (
                  <div 
                    key={defIndex}
                    style={{ 
                      color: "#dcddde",
                      fontSize: "14px",
                      lineHeight: "1.5",
                      marginBottom: defIndex < def.definitions.length - 1 ? "8px" : 0,
                    }}
                  >
                    {definition}
                  </div>
                ))}
              </div>
              
              {def.example && (
                <div style={{ 
                  color: "#72767d",
                  fontSize: "13px",
                  fontStyle: "italic",
                  marginTop: "4px",
                  paddingLeft: "12px",
                  borderLeft: "2px solid #5865f2",
                }}>
                  Example: "{def.example}"
                </div>
              )}
            </div>
          ))}
        </div>
      ) : !error && !showGemini ? (
        <div style={{ textAlign: "center", color: "#72767d" }}>
          <div>No definitions found in dictionary</div>
          <button
            onClick={loadGeminiDefinition}
            disabled={loadingGemini}
            style={{
              backgroundColor: "#5865f2",
              color: "#ffffff",
              border: "none",
              borderRadius: "4px",
              padding: "8px 16px",
              cursor: loadingGemini ? "not-allowed" : "pointer",
              fontSize: "13px",
              marginTop: "12px",
              opacity: loadingGemini ? 0.7 : 1,
            }}
            type="button"
          >
            {loadingGemini ? "Loading..." : "Get AI Definition with Gemini"}
          </button>
        </div>
      ) : null}
    </div>
  );
};
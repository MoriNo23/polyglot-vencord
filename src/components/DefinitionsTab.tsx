import { React, useState, useEffect } from "@webpack/common";
import { getDefinitionWithGemini, GeminiError } from "../services/gemini";

interface DefinitionsTabProps {
  text: string;
}

export const DefinitionsTab = ({ text }: DefinitionsTabProps) => {
  const [definition, setDefinition] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

   useEffect(() => {
     const loadDefinition = async () => {
       if (!text.trim()) return;
       
       setLoading(true);
       setError(null);
       
       try {
         const result = await getDefinitionWithGemini(text);
         if (result) {
           setDefinition(result);
         } else {
           setError("No definition found");
         }
        } catch (err: unknown) {
          if (err instanceof GeminiError) {
            setError(err.message);
          } else if (err instanceof Error) {
            setError(`Failed to load definition: ${err.message}`);
          } else {
            setError(`Failed to load definition: ${String(err)}`);
          }
        } finally {
         setLoading(false);
       }
     };

    loadDefinition();
  }, [text]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", color: "#72767d" }}>
        <div style={{ marginBottom: "8px" }}>Loading definition...</div>
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
        <div style={{ fontSize: "12px", marginTop: "8px", color: "#72767d" }}>
          Check Gemini API key in settings
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: "12px", color: "#72767d", fontSize: "13px" }}>
        Definition for "{text}" (from Gemini):
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
        {definition}
      </div>
    </div>
  );
};

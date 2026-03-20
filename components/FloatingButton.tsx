import { React } from "@webpack/common";

interface FloatingButtonProps {
  visible: boolean;
  onClick: () => void;
  position: { x: number; y: number };
  children?: React.ReactNode;
}

export const FloatingButton = ({ 
  visible, 
  onClick, 
  position,
  children = "A" // Default icon/text
}: FloatingButtonProps) => {
  if (!visible) return null;

  return (
    <button type="button"
      className="polyglot-floating-button"
      onClick={onClick}
      style={{
        position: "fixed",
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 9999,
        backgroundColor: "#5865f2",
        color: "white",
        border: "none",
        borderRadius: "4px",
        padding: "4px 8px",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "bold",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
        transition: "all 0.2s ease",
        opacity: visible ? 1 : 0,
        transform: visible ? "scale(1)" : "scale(0.8)",
      }}
      title="Polyglot: Get synonyms, translations, definitions"
    >
      {children}
    </button>
  );
};
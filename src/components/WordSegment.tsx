import { ReactNode } from "@webpack/common";

interface WordSegmentProps {
    text: string;
    onWordClick?: (word: string) => void;
}

export function WordSegment({ text, onWordClick }: WordSegmentProps): ReactNode {
    if (!text) return null;

    const segments = text.split(/([^\p{L}\p{N}]+)/u);

    return (
        <span style={{ display: "inline-block", lineHeight: 1.5 }}>
            {segments.map((segment, index) => {
                if (!segment) return null;

                const isWord = /[\p{L}\p{N}]/u.test(segment);

                if (!isWord || !onWordClick) {
                    return <span key={index}>{segment}</span>;
                }

                return (
                    <button
                        key={index}
                        type="button"
                        onClick={() => onWordClick(segment)}
                        style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            margin: 0,
                            color: "inherit",
                            font: "inherit",
                            cursor: "pointer",
                        textDecoration: "underline",
                        textDecorationColor: "#54575e",
                        transition: "all 0.2s",
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.color = "#5865f2";
                        e.currentTarget.style.textDecorationColor = "#5865f2";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.color = "inherit";
                        e.currentTarget.style.textDecorationColor = "#54575e";
                      }}
                    >
                        {segment}
                    </button>
                );
            })}
        </span>
    );
}

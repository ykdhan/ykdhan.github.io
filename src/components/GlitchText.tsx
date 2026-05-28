import { useState, type ElementType } from "react";

/** One-shot RGB-split glitch on hover (re-triggerable). */
export default function GlitchText({
  text,
  as: Tag = "span",
  className = ""
}: {
  text: string;
  as?: ElementType;
  className?: string;
}) {
  const [go, setGo] = useState(false);

  const trigger = () => {
    setGo(false);
    requestAnimationFrame(() => setGo(true));
    window.setTimeout(() => setGo(false), 520);
  };

  return (
    <Tag
      className={`glitch ${go ? "go" : ""} ${className}`}
      data-text={text}
      onMouseEnter={trigger}
    >
      {text}
    </Tag>
  );
}

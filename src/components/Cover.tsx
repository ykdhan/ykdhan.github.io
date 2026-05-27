import { useEffect, useState } from "react";

const Cover = () => {
  const [opacity, setOpacity] = useState(1);

  useEffect(() => setOpacity(0), []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "var(--color-bg-dark)",
        opacity: opacity,
        zIndex: 1000,
        pointerEvents: "none",
        cursor: "default",
        transition: "opacity 500ms ease-in-out",
        transitionDelay: "300ms"
      }}
    />
  );
};

export default Cover;

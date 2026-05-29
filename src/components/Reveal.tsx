import { useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Fade + rise block that also flips an `is-in` class (drives `.mark` sweeps). */
export function Reveal({
  children,
  className = "",
  delay = 0,
  y = 28,
  amount = 0.25
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  amount?: number;
}) {
  const reduce = useReducedMotion();
  const [seen, setSeen] = useState(false);

  if (reduce) return <div className={`${className} is-in`}>{children}</div>;

  return (
    <motion.div
      className={`${className} ${seen ? "is-in" : ""}`}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      onViewportEnter={() => setSeen(true)}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Poster-style heading: each line slides up from behind a mask. */
export function RevealText({
  text,
  className = "",
  delay = 0,
  stagger = 0.09,
  amount = 0.45
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  amount?: number;
}) {
  const reduce = useReducedMotion();
  const lines = text.split("\n");

  if (reduce) {
    return (
      <span className={className} aria-label={text}>
        {lines.map((l, i) => (
          <span key={i} style={{ display: "block" }}>
            {l}
          </span>
        ))}
      </span>
    );
  }

  // The wrapper stays put (no transform) so the in-view check is reliable;
  // each line then slides up from behind its own mask via inherited variants.
  return (
    <motion.span
      className={className}
      aria-label={text}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger, delayChildren: delay } }
      }}
    >
      {lines.map((line, i) => (
        <span
          key={i}
          style={{ display: "block", overflow: "hidden", paddingBottom: "0.08em" }}
        >
          <motion.span
            style={{ display: "block" }}
            variants={{ hidden: { y: "115%" }, show: { y: 0 } }}
            transition={{ duration: 0.85, ease: EASE }}
          >
            {line || " "}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

/** Renders text, wrapping any *starred* phrase in a highlight that sweeps in. */
export function Marked({ text }: { text: string }) {
  const parts = text.split(/(\*[^*]+\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("*") && p.endsWith("*") ? (
          <span className="mark" key={i}>
            {p.slice(1, -1)}
          </span>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

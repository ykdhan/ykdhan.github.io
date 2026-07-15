import { useEffect, useRef, useState } from "react";

const GLYPHS = "ABCDEF0123456789#$%&<>*+=?/\\_";

interface Props {
  text: string;
  className?: string;
  /** ms to wait after entering the viewport */
  delay?: number;
}

/**
 * Decrypt-style text reveal: glyphs shuffle into the final string once the
 * element scrolls into view (and again whenever `text` changes, i.e. on
 * locale toggle). Renders the real text on first paint so crawlers and
 * reduced-motion users always see the content.
 */
export default function Scramble({ text, className, delay = 0 }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || !inView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = text;
      return;
    }

    let frame = 0;
    let raf = 0;
    const chars = text.split("");
    const resolveAt = chars.map((_, i) => 6 + i * 1.4 + Math.random() * 8);

    const timer = window.setTimeout(function tick() {
      frame += 1;
      let out = "";
      let done = true;
      for (let i = 0; i < chars.length; i++) {
        const c = chars[i];
        if (c === " " || frame >= resolveAt[i]) {
          out += c;
        } else {
          done = false;
          out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
      }
      el.textContent = out;
      if (!done) raf = requestAnimationFrame(() => tick());
    }, delay);

    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(raf);
      el.textContent = text;
    };
  }, [text, inView, delay]);

  return (
    <span ref={ref} className={className} aria-label={text}>
      {text}
    </span>
  );
}

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { CoreRenderer, type CoreState } from "./CoreRenderer";

export interface CoreHandle {
  setLevel(level: number): void;
  pulse(strength?: number): void;
}

interface Props {
  state: CoreState;
  className?: string;
}

/**
 * React wrapper around the WebGL core. State is a prop; level/pulse go through
 * a ref so the 60fps voice signal never re-renders React. Without WebGL it
 * falls back to a CSS glow that still reflects the state.
 */
const Core = forwardRef<CoreHandle, Props>(function Core({ state, className }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderer = useRef<CoreRenderer | null>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;
    try {
      const r = new CoreRenderer(canvasRef.current);
      renderer.current = r;
      if (new URLSearchParams(window.location.search).has("debug")) {
        (window as unknown as { __kai: CoreRenderer }).__kai = r;
      }
      return () => {
        r.destroy();
        renderer.current = null;
      };
    } catch (err) {
      console.warn("[core] falling back to CSS:", err);
      setFallback(true);
    }
  }, []);

  useEffect(() => {
    renderer.current?.setState(state);
  }, [state]);

  useImperativeHandle(ref, () => ({
    setLevel: (level) => renderer.current?.setLevel(level),
    pulse: (strength) => renderer.current?.pulse(strength)
  }));

  return fallback ? (
    <div className={`${className ?? ""} core-fallback core-fallback-${state}`} aria-hidden="true" />
  ) : (
    <canvas ref={canvasRef} className={className} aria-hidden="true" />
  );
});

export default Core;
export type { CoreState };

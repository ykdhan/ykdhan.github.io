import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { CoreRenderer, type CoreState } from "./CoreRenderer";

export interface CoreHandle {
  setLevel(level: number): void;
  pulse(strength?: number): void;
}

interface Props {
  state: CoreState;
  className?: string;
}

/** React wrapper around the canvas core. State is a prop; level/pulse go through a ref. */
const Core = forwardRef<CoreHandle, Props>(function Core({ state, className }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderer = useRef<CoreRenderer | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const r = new CoreRenderer(canvasRef.current);
    renderer.current = r;
    if (new URLSearchParams(window.location.search).has("debug")) {
      (window as unknown as { __kai: CoreRenderer }).__kai = r;
    }
    return () => {
      r.destroy();
      renderer.current = null;
    };
  }, []);

  useEffect(() => {
    renderer.current?.setState(state);
  }, [state]);

  useImperativeHandle(ref, () => ({
    setLevel: (level) => renderer.current?.setLevel(level),
    pulse: (strength) => renderer.current?.pulse(strength)
  }));

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
});

export default Core;
export type { CoreState };

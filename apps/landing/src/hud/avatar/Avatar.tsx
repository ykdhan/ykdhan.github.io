import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { AvatarRenderer, type AvatarState } from "./AvatarRenderer";

export interface AvatarHandle {
  setLevel(level: number): void;
  pulse(): void;
}

interface Props {
  state: AvatarState;
  className?: string;
}

/**
 * The assistant's ASCII body. State is a prop; level/pulse go through a ref
 * so the 60fps voice signal never re-renders React.
 */
const Avatar = forwardRef<AvatarHandle, Props>(function Avatar({ state, className }, ref) {
  const preRef = useRef<HTMLPreElement>(null);
  const renderer = useRef<AvatarRenderer | null>(null);

  useEffect(() => {
    if (!preRef.current) return;
    const r = new AvatarRenderer(preRef.current);
    renderer.current = r;
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
    pulse: () => renderer.current?.pulse()
  }));

  return (
    <div className={className} aria-hidden="true">
      <pre ref={preRef} className="avatar-ascii" />
    </div>
  );
});

export default Avatar;
export type { AvatarState };

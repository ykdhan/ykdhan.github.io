import { useEffect, useRef, useState } from "react";
import type { MediaItem } from "../data/portfolio";

/** Lazy, in-view image/video tile with a print-style overlay (overlay in CSS). */
export default function MediaFrame({
  item,
  tall = false
}: {
  item: MediaItem;
  tall?: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [src, setSrc] = useState<string>("");

  // observe visibility
  useEffect(() => {
    const node = wrapRef.current;
    if (!node) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "300px 0px" }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  // images: swap in real src once near viewport
  useEffect(() => {
    if (item.type !== "image" || !inView || src) return;
    const img = new Image();
    img.src = item.source;
    img.onload = () => {
      setSrc(item.source);
      setLoaded(true);
    };
  }, [inView, item, src]);

  // videos: load + play in view, pause out of view
  useEffect(() => {
    if (item.type !== "video") return;
    const v = videoRef.current;
    if (!v) return;
    if (inView) {
      if (!loaded) {
        v.load();
        setLoaded(true);
      } else {
        v.play().catch(() => {});
      }
    } else if (loaded) {
      v.pause();
    }
  }, [inView, loaded, item.type]);

  return (
    <div className={`frame ${tall ? "tall" : ""}`} ref={wrapRef}>
      {!loaded && <div className="skeleton" />}

      {item.type === "image" && src && (
        <img src={src} alt="" loading="lazy" decoding="async" draggable={false} />
      )}

      {item.type === "video" && (
        <video
          ref={videoRef}
          src={inView || loaded ? item.source : undefined}
          muted
          loop
          playsInline
          preload="none"
          draggable={false}
          onLoadedData={(e) => e.currentTarget.play().catch(() => {})}
        />
      )}
    </div>
  );
}

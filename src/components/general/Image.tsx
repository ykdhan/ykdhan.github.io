import { useEffect, useRef, useState } from "react";

const Image = ({ src, alt = "", style, placeholder, ...props }) => {
  const ref = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(placeholder || "");

  useEffect(() => {
    const root = document.getElementsByTagName("main")[0] as Element;
    if (!root || !ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!inView) {
          setInView(entry.isIntersecting);
        }
      },
      {
        root,
        rootMargin: "400px"
      }
    );
    observer.observe(ref.current as Element);
    return () => {
      observer.disconnect();
    };
  }, [ref.current]);

  useEffect(() => {
    if (inView && !loaded) {
      const img = new window.Image();
      img.src = src;
      img.onload = () => {
        setLoaded(true);
        setCurrentSrc(src);
      };
    }
  }, [inView, src]);

  return (
    <div ref={ref} style={{ ...style, pointerEvents: "none" }}>
      {currentSrc && (
        <img
          src={currentSrc}
          alt={alt}
          style={{
            ...style,
            width: "100%",
            height: "100%",
            opacity: loaded ? 1 : 0,
            transition: "opacity 0.3s ease-in-out"
          }}
          {...props}
        />
      )}
    </div>
  );
};

export default Image;

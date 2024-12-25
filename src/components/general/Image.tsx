import { useEffect, useRef, useState } from "react";

const Image = ({ src, alt = "", style, placeholder, ...props }) => {
  const ref = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(placeholder || "");

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      {
        rootMargin: "200px"
      }
    );
    observer.observe(ref.current as Element);
    return () => {
      observer.disconnect();
    };
  }, [ref.current]);

  useEffect(() => {
    if (inView && !loaded) {
      setLoaded(true);
      const img = new window.Image();
      img.src = src;
      img.onload = () => {
        setCurrentSrc(src);
      };
    }
  }, [inView]);

  return (
    <div ref={ref} style={{ ...style, pointerEvents: "none" }}>
      {currentSrc && (
        <img
          src={currentSrc}
          alt={alt}
          style={{
            ...style,
            width: "100%",
            height: "100%"
          }}
          {...props}
        />
      )}
    </div>
  );
};

export default Image;

import { useEffect, useState } from "react";
import { useInView, animated } from "@react-spring/web";

const Image = ({ src, alt = "", style, placeholder, ...props }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    rootMargin: "400px"
  });
  const [loaded, setLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(placeholder || "");

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
    <animated.div ref={ref} style={{ ...style, pointerEvents: "none" }}>
      <>
        {currentSrc && (
          <img
            src={currentSrc}
            alt={alt}
            style={{
              ...style,
              opacity: loaded ? 1 : 0,
              transition: "opacity 0.3s ease-in-out"
            }}
            {...props}
          />
        )}
      </>
    </animated.div>
  );
};

export default Image;

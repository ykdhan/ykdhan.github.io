import { useEffect, useRef, useState } from "react";

const Video = ({ src, style, ...props }) => {
  const ref = useRef(null);
  const videoRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);

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
    if (inView) {
      if (!loaded) {
        setLoaded(true);
        videoRef.current.load();
      } else {
        videoRef.current.play();
      }
    } else if (loaded) {
      videoRef.current.pause();
    }
  }, [inView]);

  return (
    <div ref={ref} style={style}>
      <video
        ref={videoRef}
        src={src}
        playsInline
        muted
        loop
        preload={"none"}
        onLoadedData={() => {
          videoRef.current.play();
        }}
        style={{
          width: "100%",
          height: "100%",
          ...style
        }}
        {...props}
      />
    </div>
  );
};

export default Video;

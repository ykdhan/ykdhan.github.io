import { useInView, animated } from "@react-spring/web";
import { useEffect, useRef, useState } from "react";

const Video = ({ src, style, ...props }) => {
  const videoRef = useRef(null);
  const [ref, inView] = useInView({
    rootMargin: "400px"
  });
  const [loaded, setLoaded] = useState(false);

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
    <animated.div ref={ref} style={style}>
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
    </animated.div>
  );
};

export default Video;

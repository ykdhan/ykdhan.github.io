import {useEffect, useMemo, useRef, useState} from "react";
import styled from "styled-components";
import {useRecoilState} from "recoil";
import {appState} from "../states/appState.ts";

interface Props {
  media: { type: string, source: string }[];
  direction?: string;
}

const LeftButton = styled.button`
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #e4e4e4;
  width: 40px;
  height: 40px;
  color: #141414;
  border: none;
  padding: 8px;
  border-radius: 50%;
  font-size: 20px;
  font-weight: bold;
  line-height: 1.2;
  z-index: 3;
  opacity: ${(props) => props.disabled ? 0.3 : 1};
`;

const RightButton = styled.button`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #e4e4e4;
  width: 40px;
  height: 40px;
  color: #141414;
  border: none;
  padding: 8px;
  border-radius: 50%;
  font-size: 20px;
  font-weight: bold;
  line-height: 1.2;
  z-index: 3;
  opacity: ${(props) => props.disabled ? 0.3 : 1};
`;

const ProjectMedia = ({media, direction = 'horizontal'}: Props) => {
  const [app, _] = useRecoilState(appState);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<HTMLVideoElement[]>([]);

  const [index, setIndex] = useState(0);
  const [offsetWidth, setOffsetWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  const leftOffset = useMemo(() => app.isMobile ? 16 : 0, [app.isMobile]);
  const width = useMemo(() => (offsetWidth + 8) / media.length, [offsetWidth, media.length, app.isMobile]);
  const maxWidth = useMemo(() =>
    offsetWidth - containerWidth + leftOffset * 2,
    [offsetWidth, containerWidth, leftOffset, app.isMobile]
  );
  const translateX = useMemo(() => Math.max(-maxWidth, index * -width), [index, width, maxWidth]);

  useEffect(() => {
    setContainerWidth(containerRef.current?.getBoundingClientRect().width || 0);
  }, [app.width]);

  useEffect(() => {
    videoRefs.current.forEach((video) => {
      video.load();
    });
  }, []);

  if (media.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative', width: '100%', marginTop: 24,
        height: direction === 'vertical' ? 240 : 160,
        overflow: 'hidden'
      }}
    >
      <ul
        onLoad={(e) => setOffsetWidth(e.currentTarget.offsetWidth)}
        onResize={(e) => setOffsetWidth(e.currentTarget.offsetWidth)}
        style={{
          position: 'absolute',
          display: 'flex',
          gap: 8,
          top: 0,
          bottom: 0,
          left: leftOffset,
          transform: `translateX(${translateX}px)`,
          transition: 'transform 0.3s ease-out',
        }}
      >
        {media.map((item, i) => (
          <li key={i} style={{display: "block"}}>
            {item.type === 'video' &&
                <video src={item.source} playsInline autoPlay muted loop style={{
                  width: 'auto', height: '100%', borderRadius: 8, overflow: 'hidden'
                }} ref={(el) => {
                  if (el && i < 2) {
                    videoRefs.current.push(el);
                  }
                }} preload={'auto'} />}
            {item.type === 'image' && <img src={item.source} alt={''} style={{
              width: 'auto',
              height: '100%',
              borderRadius: 8,
              overflow: 'hidden'
            }}/>}
          </li>
        ))}
      </ul>
      {media.length > 0 && <LeftButton type={'button'} onClick={() => setIndex(index - 1)} disabled={translateX === 0}>
        <div style={{
          width: 0,
          height: 0,
          borderLeft: "8px solid transparent",
          borderRight: "8px solid transparent",
          borderBottom: "8px solid #141414",
          transform: 'rotate(-90deg) translateY(-1px)',
        }} />
      </LeftButton>}
      {media.length > 0 && <RightButton type={'button'} onClick={() => setIndex(index + 1)} disabled={translateX <= -maxWidth}>
        <div style={{
          width: 0,
          height: 0,
          borderLeft: "8px solid transparent",
          borderRight: "8px solid transparent",
          borderBottom: "8px solid #141414",
          transform: 'rotate(90deg) translateY(-1px)',
        }}/>
      </RightButton>}
    </div>
  );
};

export default ProjectMedia;

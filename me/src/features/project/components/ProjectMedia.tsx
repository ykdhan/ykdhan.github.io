import {useMemo, useState} from "react";
import styled from "styled-components";

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
  const [index, setIndex] = useState(0);
  const [offsetWidth, setOffsetWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  const width = useMemo(() => (offsetWidth + 8) / media.length, [offsetWidth, media.length]);
  const maxWidth = useMemo(() => offsetWidth - containerWidth, [offsetWidth, containerWidth]);
  const translateX = useMemo(() => Math.max(-maxWidth, index * -width), [index, width, maxWidth]);

  if (media.length === 0) {
    return null;
  }

  return (
    <div
      onLoad={(e) => setContainerWidth(e.currentTarget.offsetWidth)}
      onResize={(e) => setContainerWidth(e.currentTarget.offsetWidth)}
      style={{
        position: 'relative', width: '100%', marginTop: 24,
        height: direction === 'vertical' ? 360 : 240,
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
          transform: `translateX(${translateX}px)`,
          transition: 'transform 0.3s ease-out',
        }}
      >
        {media.map((item, i) => (
          <li key={i} style={{display: "block"}}>
            {item.type === 'video' &&
                <video src={item.source} playsInline autoPlay muted loop style={{
                  width: 'auto', height: '100%', borderRadius: 8, overflow: 'hidden'
                }}/>}
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

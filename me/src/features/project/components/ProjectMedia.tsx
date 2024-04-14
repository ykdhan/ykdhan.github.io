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

  if (media.length === 0) {
    return null;
  }

  const items = useMemo(() => {
    return [

        media[index === 0 ? media.length - 1 : index - 1],
        media[index],
        media[index === media.length - 1 ? 0 : index + 1]
    ]
  }, [index, media]);

  return (
      <div style={{position: 'relative', marginTop: 24}}>
      <ul
          style={{
            position: 'relative',
            display: 'flex',
            flex: 1,
            height: direction === 'vertical' ? 360 : 240,
            overflow: 'hidden',
          }}
      >
        {items.map((item, i) => (
          <li key={i} style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                display: "block",
                width: '100%',
                height: '100%',
                ...(i === 0 ? {transform: 'translateX(-100%)'} : i === 2 ? {transform: 'translateX(100%)'} : {transform: 'translateX(0)', zIndex: 1}),
              }}>
            {item.type === 'video' &&
                <video src={item.source} playsInline autoPlay muted loop style={{width: '100%', height: '100%'}}/>}
            {item.type === 'image' && <img src={item.source} alt={''} style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}/>}
          </li>
        ))}
      </ul>
        {items.length > 0 && <LeftButton type={'button'} onClick={() => setIndex(index - 1)} disabled={index === 0}>
            <div style={{
              width: 0,
              height: 0,
              borderLeft: "8px solid transparent",
              borderRight: "8px solid transparent",
              borderBottom: "8px solid #141414",
              transform: 'rotate(-90deg) translateY(-1px)',
            }} />
        </LeftButton>}
        {items.length > 0 &&
            <RightButton type={'button'} onClick={() => setIndex(index + 1)} disabled={index === media.length - 1}>
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

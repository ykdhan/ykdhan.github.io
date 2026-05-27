import Video from "./general/Video";
import Image from "./general/Image";
import { useRecoilState } from "recoil";
import { appState } from "../states/appState";
import { Fragment } from "react";

interface Props {
  media: { type: string; source: string }[];
  direction?: string;
}

const ProjectMedia = ({ media, direction = "horizontal" }: Props) => {
  if (media.length === 0) {
    return null;
  }

  return (
    <ul
      style={{
        display: "grid",
        gridTemplateColumns:
          direction === "horizontal" ? "1fr 1fr" : "1fr 1fr 1fr",
        gap: "10px"
      }}
    >
      {media.map((item, i) => (
        <Fragment key={i}>
          {item.type === "video" && (
            <Video style={{ borderRadius: "8px" }} src={item.source} />
          )}
          {item.type === "image" && (
            <Image style={{ borderRadius: "8px" }} src={item.source} />
          )}
        </Fragment>
      ))}
    </ul>
  );
};

export default ProjectMedia;

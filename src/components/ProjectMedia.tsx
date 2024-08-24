import Video from "./general/Video";
import Image from "./general/Image";
import { useRecoilState } from "recoil";
import { appState } from "../states/appState";

interface Props {
  media: { type: string; source: string }[];
  direction?: string;
}

const ProjectMedia = ({ media, direction = "horizontal" }: Props) => {
  const [app] = useRecoilState(appState);

  if (media.length === 0) {
    return null;
  }

  return (
    <ul style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {media.map((item, i) => (
        <li
          key={i}
          style={{
            display: "block",
            height: app.isMobile
              ? direction === "horizontal"
                ? 80
                : 140
              : direction === "horizontal"
                ? 120
                : 200
          }}
        >
          {item.type === "video" && (
            <Video
              src={item.source}
              style={{
                width: "auto",
                height: "100%",
                overflow: "hidden"
              }}
            />
          )}
          {item.type === "image" && (
            <Image
              src={item.source}
              style={{
                width: "auto",
                height: "100%",
                overflow: "hidden"
              }}
            />
          )}
        </li>
      ))}
    </ul>
  );
};

export default ProjectMedia;

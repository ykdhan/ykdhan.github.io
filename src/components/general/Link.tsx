import Text from "./Text";
import { useRecoilState } from "recoil";
import { appState } from "../../states/appState";

interface Props {
  link: string;
  title: string;
}

const Link = ({ link, title }: Props) => {
  const [app] = useRecoilState(appState);
  return (
    <a
      href={link}
      target="_blank"
      style={{
        display: "inline-block",
        padding: "6px 8px"
      }}
    >
      <Text style={{ fontSize: app.isMobile ? 20 : 24, pointerEvents: "none" }}>
        {title}
      </Text>
    </a>
  );
};

export default Link;

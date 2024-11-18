import Text from "./Text";
import { useRecoilState } from "recoil";
import { appState } from "../../states/appState";

interface Props {
  link: string;
  title?: string;
}

const Link = ({ link, title = "Link" }: Props) => {
  const [app] = useRecoilState(appState);
  return (
    <a
      href={link}
      target="_blank"
      style={{
        display: "inline-block",
        padding: "2px 6px 4px",
        border: "2px solid var(--color-font-light2)"
      }}
    >
      <Text
        color={"var(--color-font-light2)"}
        style={{ fontSize: app.isMobile ? 14 : 16 }}
      >
        {title}
      </Text>
    </a>
  );
};

export default Link;

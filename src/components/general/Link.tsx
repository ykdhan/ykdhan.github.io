import Text from "./Text";
import { useRecoilState } from "recoil";
import { appState } from "../../states/appState";

interface Props {
  link: string;
  title?: string;
}

const Link = ({ link, title }: Props) => {
  const [app] = useRecoilState(appState);
  return (
    <a
      href={link}
      target="_blank"
      style={{
        display: "inline-block",
        padding: "2px 6px 4px",
        border: "2px solid var(--color-font-light2)",
        borderRadius: 4
      }}
    >
      <Text
        color={"var(--color-font-light2)"}
        style={{ fontSize: app.isMobile ? 14 : 16 }}
      >
        {title ?? (app.locale === "ko" ? "링크" : "Link")}
      </Text>
    </a>
  );
};

export default Link;

import { useRecoilState } from "recoil";
import { appState } from "../states/appState";
import Text from "./general/Text";
import Link from "./general/Link";

const Header = () => {
  const [app] = useRecoilState(appState);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        padding: app.isMobile ? "32px 20px 48px" : "40px 32px 80px",
        background:
          "linear-gradient(180deg, var(--color-bg-dark), transparent 100%)",
        cursor: "default",
        zIndex: 100
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Text
            bold
            style={{
              fontSize: app.isMobile ? 20 : 24
            }}
          >
            {"YK"}
          </Text>
          <Text
            style={{
              fontSize: app.isMobile ? 16 : 24
            }}
          >
            {"Full-stack developer"}
          </Text>
        </div>
        <Link link={"mailto:ykdhan@gmail.com"} title={"Contact"} />
      </div>
    </header>
  );
};

export default Header;

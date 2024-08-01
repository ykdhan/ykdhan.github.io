import { useRecoilState } from "recoil";
import { FONT } from "../lib/fonts.ts";
import { appState } from "../states/appState.ts";

interface Props {
  size: "normal" | "small";
}

const Header = ({size}: Props) => {
  const [app, _] = useRecoilState(appState);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        padding: app.isMobile ? "16px" : "24px 0",
        backgroundColor: "#141414",
        borderBottom: "1px solid #343434",
        zIndex: 10,
        cursor: "default",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: app.isMobile ? 20 : 24,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: app.isMobile ? 56 : 80,
            height: app.isMobile ? 56 : 80,
            borderRadius: 6,
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            transition: "width 0.3s, height 0.3s",
            ...(size === "small" && {
              width: app.isMobile ? 40 : 56,
              height: app.isMobile ? 40 : 56,
            }),
          }}
        >
          <span
            style={{
              fontSize: app.isMobile ? 32 : 56,
              transition: "font-size 0.3s",
              ...(size === "small" && {
                fontSize: app.isMobile ? 20 : 40,
              })
            }}
          >
            👨🏻‍💻
          </span>
        </div>
        <h1
          style={{
            flex: 1,
            fontFamily: FONT.Bold,
            fontSize: app.isMobile ? 20 : 24,
          }}
        >
          YK
        </h1>
        <div style={{ display: "flex", flexDirection: "row", gap: 10 }}>
        </div>
      </div>
    </header>
  );
};

export default Header;

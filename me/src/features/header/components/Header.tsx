import { useRecoilState } from "recoil";
import Button from "../../app/components/Button";
import { FONT } from "../../app/fonts";
import { appState } from "../../app/states/appState";

const Header = () => {
  const [app, _] = useRecoilState(appState);

  const onClickGithub = () => {
    window.open("https://github.com/ykdhan", "_blank");
  };

  const onClickContact = () => {
    window.open("mailto:ykdhan@naver.com");
  };

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        padding: app.isMobile ? "16px 0" : "24px 0",
        backgroundColor: "#0d1117",
        borderBottom: "1px solid #30363d",
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
            width: app.isMobile ? 60 : 100,
            height: app.isMobile ? 60 : 100,
            borderRadius: 6,
            backgroundColor: "rgba(255, 255, 255, 0.1)",
          }}
        >
          <span
            style={{
              fontSize: app.isMobile ? 36 : 60,
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
          <Button onClick={onClickGithub}>Github</Button>
          <Button onClick={onClickContact}>Contact</Button>
        </div>
      </div>
    </header>
  );
};

export default Header;

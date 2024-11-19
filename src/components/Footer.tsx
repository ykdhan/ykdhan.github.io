import { useRecoilState } from "recoil";
import { appState } from "../states/appState";

const Footer = () => {
  const [app] = useRecoilState(appState);

  return (
    <footer
      style={{
        position: "sticky",
        bottom: 0,
        padding: app.isMobile ? "32px 20px 48px" : "40px 32px 80px",
        background:
          "linear-gradient(0deg, var(--color-bg-dark), transparent 100%)",
        cursor: "default",
        zIndex: 100
      }}
    />
  );
};

export default Footer;

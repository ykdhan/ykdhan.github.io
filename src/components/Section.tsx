import { CSSProperties, ReactNode } from "react";
import { useRecoilState } from "recoil";
import { appState } from "../states/appState";

type Props = {
  children: ReactNode;
  style?: CSSProperties;
  innerStyle?: CSSProperties;
};

const Section = ({ children, style = {}, innerStyle = {} }: Props) => {
  const [app] = useRecoilState(appState);
  return (
    <section style={{ width: "100%", ...style }}>
      <div
        style={{
          width: "100%",
          padding: app.isMobile ? "32px 20px" : "40px 32px",
          paddingRight: app.isMobile ? "8dvw" : "10dvw",
          margin: "0 auto",
          ...innerStyle
        }}
      >
        {children}
      </div>
    </section>
  );
};

export default Section;

import { useState } from "react";
import { FONT } from "../lib/fonts.ts";
import { appState } from "../states/appState.ts";
import { useRecoilState } from "recoil";

interface Props {
  onClick: () => void;
  children: React.ReactNode;
}
const Button = ({ onClick, children }: Props) => {
  const [app, _] = useRecoilState(appState);
  const [hover, setHover] = useState(false);

  const onMouseEnter = () => {
    setHover(true);
  };
  const onMouseLeave = () => {
    setHover(false);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        display: "flex",
        alignItems: "center",
        height: app.isMobile ? 30 : 34,
        padding: app.isMobile ? "0 12px" : "0 16px",
        backgroundColor: hover ? "#30363d" : "#21262d",
        border: "1px solid",
        borderColor: hover ? "#8b949e" : "rgba(240, 246, 252, 0.1)",
        borderRadius: 6,
        fontFamily: FONT.Regular,
        fontSize: 14,
        transition:
          "background-color 0.1s ease-in-out, border-color 0.1s ease-in-out",
      }}
    >
      {children}
    </button>
  );
};
export default Button;

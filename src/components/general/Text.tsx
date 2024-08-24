import { CSSProperties, ReactNode } from "react";
import { FONT, FONT_WEIGHT } from "../../lib/fonts";

type Props = {
  bold?: boolean;
  color?: string;
  children: ReactNode;
  style?: CSSProperties;
};

const Text = ({
  bold = false,
  color = "var(--color-font-light)",
  children,
  style = {}
}: Props) => {
  return (
    <span
      style={{
        fontFamily: FONT.Pixel,
        fontWeight: bold ? FONT_WEIGHT.Bold : FONT_WEIGHT.Regular,
        fontSize: 14,
        lineHeight: 1.4,
        cursor: "default",
        color,
        ...style
      }}
    >
      {children}
    </span>
  );
};

export default Text;

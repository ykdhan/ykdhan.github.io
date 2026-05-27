import { CSSProperties, ReactNode } from "react";
import { FONT, FONT_WEIGHT } from "../../lib/fonts";

type Props = {
  bold?: boolean;
  color?: string;
  children: ReactNode;
  style?: CSSProperties;
};

const Text = ({ bold = false, color, children, style = {} }: Props) => {
  return (
    <span
      style={{
        fontFamily: bold ? FONT.Bold : FONT.Regular,
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

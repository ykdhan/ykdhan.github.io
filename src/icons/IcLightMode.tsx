import { animated } from "@react-spring/web";

type Props = {
  color?: string;
  size?: number;
};

const IcLightMode = ({ color = "#000000", size = 24 }) => {
  return (
    <animated.svg
      width={size}
      height={size}
      viewBox="0 0 400 400"
      xml:space="preserve"
      xmlns="http://www.w3.org/2000/svg"
      fill={color}
    >
      <path d="M213.3 26.7V0h-26.6v53.3h26.6zM53.3 53.3H80V80H53.3zM320 53.3h26.7V80H320zM80 80h26.7v26.7H80zM213.3 106.7H240V80h-80v26.7h26.7zM293.3 80H320v26.7h-26.7zM133.3 106.7H160v26.7h-26.7zM240 106.7h26.7v26.7H240z" />
      <path d="M106.7 133.3h26.7V160h-26.7zM266.7 133.3h26.7V160h-26.7zM53.3 186.7H0v26.6h53.3zM106.7 186.7V160H80v80h26.7v-26.7zM293.3 213.3V240H320v-80h-26.7v26.7zM373.3 186.7h-26.6v26.6H400v-26.6zM106.7 240h26.7v26.7h-26.7zM266.7 240h26.7v26.7h-26.7zM133.3 266.7H160v26.7h-26.7zM240 266.7h26.7v26.7H240zM80 293.3h26.7V320H80zM186.7 293.3H160V320h80v-26.7h-26.7zM293.3 293.3H320V320h-26.7zM53.3 320H80v26.7H53.3zM320 320h26.7v26.7H320zM186.7 373.3V400h26.6v-53.3h-26.6z" />
    </animated.svg>
  );
};

export default IcLightMode;

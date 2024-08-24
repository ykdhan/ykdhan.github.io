import { animated } from "@react-spring/web";

type Props = {
  color?: string;
  size?: number;
};

const IcDarkMode = ({ color = "#000000", size = 24 }) => {
  return (
    <animated.svg
      width={size}
      height={size}
      viewBox="0 0 400 400"
      xml:space="preserve"
      xmlns="http://www.w3.org/2000/svg"
      fill={color}
    >
      <path d="M133.3 53.3V26.7H80v26.6h26.7z" />
      <path d="M160 53.3h26.7V26.7h26.6V0h-80v26.7H160zM53.3 53.3H80V80H53.3zM133.3 53.3H160V80h-26.7zM106.7 106.7v106.6h26.6V80h-26.6zM53.3 106.7V80H26.7v53.3h26.6zM373.3 186.7v26.6h-26.6V240h26.6v26.7H400v-80zM26.7 213.3v-80H0v133.4h26.7V240zM133.3 213.3H160V240h-26.7zM160 240h26.7v26.7H160zM320 240h26.7v26.7H320zM53.3 266.7H26.7V320h26.6v-26.7zM213.3 293.3H320v-26.6H186.7v26.6zM346.7 293.3V320h26.6v-53.3h-26.6zM53.3 320H80v26.7H53.3zM320 320h26.7v26.7H320zM106.7 346.7H80v26.6h53.3v-26.6zM266.7 346.7v26.6H320v-26.6h-26.7zM213.3 373.3h-80V400h133.4v-26.7H240z" />
    </animated.svg>
  );
};

export default IcDarkMode;

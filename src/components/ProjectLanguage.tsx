import { FONT } from "../lib/fonts.ts";

interface Props {
  title: string;
  color: string;
}

const ProjectLanguage = ({ title, color }: Props) => {
  return (
    <li
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        fontFamily: FONT.Regular,
        fontSize: 12,
        color: "#A4A4A4",
      }}
    >
      <span
        style={{
          display: "block",
          width: 12,
          height: 12,
          borderRadius: 12,
          border: "1px solid rgba(255, 255, 255, 0.2)",
          backgroundColor: color,
        }}
      />
      {title}
    </li>
  );
};

export default ProjectLanguage;

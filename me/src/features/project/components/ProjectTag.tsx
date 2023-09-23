import { FONT } from "../../app/fonts";

interface Props {
  title: string;
}

const ProjectTag = ({ title }: Props) => {
  return (
    <li
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 18,
        paddingLeft: 8,
        paddingRight: 8,
        border: "1px solid #30363d",
        borderRadius: 18,
      }}
    >
      <span
        style={{
          fontFamily: FONT.Regular,
          fontSize: 12,
          lineHeight: 18,
          color: "#7D8590",
        }}
      >
        {title}
      </span>
    </li>
  );
};

export default ProjectTag;

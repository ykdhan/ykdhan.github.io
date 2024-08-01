import { FONT } from "../../app/fonts";

interface Props {
  title: string;
}

const ProjectTag = ({ title }: Props) => {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 18,
        paddingLeft: 8,
        paddingRight: 8,
        border: "1px solid #30363d",
        borderRadius: 18,
        fontFamily: FONT.Regular,
        fontSize: 12,
        color: "#A4A4A4",
      }}
    >
      {title}
    </span>
  );
};

export default ProjectTag;

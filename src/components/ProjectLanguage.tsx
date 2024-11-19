import Text from "./general/Text";

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
        gap: 6
      }}
    >
      <div
        style={{
          position: "relative",
          width: 13,
          height: 13,
          borderRadius: 4,
          backgroundColor: color
        }}
      />
      <Text color={"var(--color-font-light3)"} style={{ fontSize: 14 }}>
        {title}
      </Text>
    </li>
  );
};

export default ProjectLanguage;

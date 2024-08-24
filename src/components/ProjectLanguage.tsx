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
          width: 16,
          height: 16,
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 3,
            display: "block",
            width: 16,
            height: 10,
            backgroundColor: color
          }}
        />
        <span
          style={{
            marginLeft: 3,
            display: "block",
            width: 10,
            height: 16,
            backgroundColor: color
          }}
        />
      </div>
      <Text color={"var(--color-font-light2)"} style={{ fontSize: 12 }}>
        {title}
      </Text>
    </li>
  );
};

export default ProjectLanguage;

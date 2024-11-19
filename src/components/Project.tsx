import ProjectLanguage from "./ProjectLanguage";
import { useRecoilState } from "recoil";
import { appState } from "../states/appState";
import ProjectMedia from "./ProjectMedia";
import { LANGUAGE_COLORS } from "../consts";
import Text from "./general/Text";
import Link from "./general/Link";

interface Props {
  title: string;
  description: string;
  company: string;
  languages: string[];
  contribution: string[];
  media: { type: string; source: string }[];
  link?: string;
  mediaDirection?: string;
}

const Project = ({
  title,
  description,
  company,
  languages,
  contribution,
  media,
  link,
  mediaDirection
}: Props) => {
  const [app, _] = useRecoilState(appState);

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 20,
          marginBottom: 32
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              alignItems: "center",
              gap: app.isMobile ? 8 : 10,
              marginBottom: 6
            }}
          >
            <Text bold style={{ fontSize: app.isMobile ? 18 : 20 }}>
              {title}
            </Text>
            <Text
              style={{
                fontSize: app.isMobile ? 18 : 20,
                color: "var(--color-font-light2)"
              }}
            >
              {company}
            </Text>
          </div>
          <Text
            color={"var(--color-font-light2)"}
            style={{
              fontSize: 15
            }}
          >
            {description}
          </Text>
        </div>
        <ul
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            columnGap: app.isMobile ? 12 : 16,
            rowGap: 16
          }}
        >
          {languages.map((language, index) => (
            <ProjectLanguage
              key={index}
              title={language}
              color={LANGUAGE_COLORS[language]}
            />
          ))}
        </ul>
        <ul
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12
          }}
        >
          {contribution[app.locale].map((item, index) => (
            <li
              style={{
                display: "flex",
                flexDirection: "row",
                gap: 6
              }}
            >
              <Text style={{ fontSize: 16 }} key={index}>
                {"•"}
              </Text>
              <Text style={{ flex: 1, fontSize: 16 }} key={index}>
                {item}
              </Text>
            </li>
          ))}
        </ul>
        {link && <Link link={link} />}
      </div>
      <ProjectMedia media={media} direction={mediaDirection} />
    </div>
  );
};

export default Project;

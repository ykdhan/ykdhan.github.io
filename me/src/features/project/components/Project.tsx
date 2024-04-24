import ProjectTag from "./ProjectTag";
import { FONT } from "../../app/fonts";
import ProjectLanguage from "./ProjectLanguage";
import { useRecoilState } from "recoil";
import { appState } from "../../app/states/appState";
import ProjectMedia from "./ProjectMedia";
import {LANGUAGE_COLORS} from "../consts";

interface Props {
  title: string;
  description: string;
  languages: string[];
  media: { type: string, source: string }[];
  tags?: string[];
  link?: string;
  mediaDirection?: string;
}

const Project = ({ title, description, tags, languages, media, link, mediaDirection }: Props) => {
  const [app, _] = useRecoilState(appState);

  return (
    <li
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: '100%',
        padding: app.isMobile ? '16px 0' : '16px 8px',
        borderRadius: 6,
        boxSizing: "border-box",
        cursor: "default",
        overflow: "hidden",
      }}>
      <div style={{padding: app.isMobile ? '0 16px' : '0'}}>
        <p
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 8,
            marginBottom: 8,
          }}>
          <span
            style={{
              fontFamily: FONT.Bold,
              fontSize: 16,
              color: "#E4E4E4",
            }}>
            {link ? (
              <a href={link} target="_blank">
                {title}
              </a>
            ) : (
              <span>{title}</span>
            )}
          </span>
          {tags?.map((tag, index) => (
            <ProjectTag key={`${title}-tag-${index}`} title={tag} />
          ))}
        </p>
        <p
          style={{
            fontFamily: FONT.Regular,
            fontSize: 14,
            color: "#A4A4A4",
            marginBottom: 24,
            cursor: "default",
          }}>
          {description}
        </p>
        <ul
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            columnGap: app.isMobile ? 12 : 16,
            rowGap: 8,
          }}>
          {languages.map((language, index) => (
            <ProjectLanguage
              key={`${title}-lang-${index}`}
              title={language}
              // @ts-ignore
              color={LANGUAGE_COLORS[language]}
            />
          ))}
        </ul>
      </div>
      <ProjectMedia media={media} direction={mediaDirection} />
    </li>
  );
};

export default Project;

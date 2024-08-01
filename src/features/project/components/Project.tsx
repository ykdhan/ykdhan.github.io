import { FONT } from "../../app/fonts";
import ProjectLanguage from "./ProjectLanguage";
import { useRecoilState } from "recoil";
import { appState } from "../../app/states/appState";
import ProjectMedia from "./ProjectMedia";
import { LANGUAGE_COLORS } from "../consts";
import icLink from "../../../assets/images/ic_link.svg";

interface Props {
  title: string;
  description: string;
  company: string;
  languages: string[];
  media: { type: string, source: string }[];
  link?: string;
  mediaDirection?: string;
}

const Project = ({ title, description, company, languages, media, link, mediaDirection }: Props) => {
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
            height: 24,
            marginBottom: 8
          }}>
          <span
            style={{
              fontFamily: FONT.Bold,
              fontSize: 18,
              color: "#E4E4E4"
            }}>
            {title}
          </span>
          <span
            style={{
              flex: 1,
              fontSize: 18,
              color: "#747474",
            }}>
            {company}
          </span>
          {link &&
            <a href={link} target="_blank" style={{
              display: "block",
              width: 24,
              height: 24,
            }}>
              <img src={icLink} style={{width: 24, height: 24}} />
            </a>
          }
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

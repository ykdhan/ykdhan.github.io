import ProjectTag from "./ProjectTag";
import { FONT } from "../../app/fonts";
import { ICON } from "../../app/icons";
import ProjectLanguage from "./ProjectLanguage";
import { useRecoilState } from "recoil";
import { appState } from "../../app/states/appState";

const LANGUAGE_COLORS = {
  HTML: "#e44b23",
  SASS: "#cf649a",
  jQuery: "#0769ad",
  React: "#159eca",
  ReactNative: "#61dafb",
  Redux: "#764abc",
  ReduxSaga: "#764abc",
  ReduxToolkit: "#764abc",
  Vue: "#42b883",
  Nuxt: "#02dc81",
  Pinia: "#ffd858",
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Vite: "#747bff",
  PHP: "#4F5D95",
  Flutter: "#5bc7f8",
  Firebase: "#ffcc2d",
  GetX: "#8f14fe",
  Linux: "#f5f5f5",
  "Three.js": "#000000",
  "Gulp.js": "#cf4647",
};

interface Props {
  title: string;
  description: string;
  languages: string[];
  tags?: string[];
  link?: string;
}

const Project = ({ title, description, tags, languages, link }: Props) => {
  const [app, _] = useRecoilState(appState);

  return (
    <li
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 16,
        border: "1px solid #30363d",
        borderRadius: 6,
        boxSizing: "border-box",
        cursor: "default",
      }}
    >
      <p
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 8,
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontFamily: FONT.Bold,
            fontSize: 16,
            color: "#2f81f7",
          }}
        >
          {link ? (
            <a href={link} target="_blank">
              {title}
            </a>
          ) : (
            <span style={{ opacity: 0.6 }}>{title}</span>
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
          color: "#7D8590",
          marginBottom: 24,
          cursor: "default",
        }}
      >
        {description}
      </p>
      <ul
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          gap: app.isMobile ? 12 : 16,
          rowGap: 8,
        }}
      >
        {languages.map((language, index) =>
          language === "Responsive" ? (
            <span style={{ display: "block", width: 20, height: 20 }}>
              {ICON.responsive}
            </span>
          ) : language === "SEO" ? (
            <span
              style={{ display: "block", width: 16, height: 18, paddingTop: 2 }}
            >
              {ICON.seo}
            </span>
          ) : language === "Localization" ? (
            <span style={{ display: "block", width: 18, height: 18 }}>
              {ICON.localization}
            </span>
          ) : (
            <ProjectLanguage
              key={`${title}-lang-${index}`}
              title={language}
              // @ts-ignore
              color={LANGUAGE_COLORS[language]}
            />
          ),
        )}
      </ul>
    </li>
  );
};

export default Project;

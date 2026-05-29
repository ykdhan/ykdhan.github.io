import { useLocale } from "../i18n/LocaleContext";
import { useT } from "../i18n/strings";
import type { Project } from "../data/portfolio";
import { colorFor } from "../lib/consts";
import { Reveal, RevealText } from "./Reveal";
import MediaFrame from "./MediaFrame";
import GlitchText from "./GlitchText";

export default function ProjectCard({
  project,
  index,
  flip
}: {
  project: Project;
  index: number;
  flip: boolean;
}) {
  const { locale } = useLocale();
  const t = useT(locale);

  const accent = project.color && project.color !== "#0c0c0c" ? project.color : "#d8ff35";
  const vertical = project.mediaDirection === "vertical";
  const num = String(index + 1).padStart(2, "0");

  return (
    <article
      className={`project ${flip ? "flip" : ""}`}
      style={{ ["--proj" as string]: accent }}
    >
      {project.popular && (
        <span className="featured-badge">★ {t("featured")}</span>
      )}

      <div className="project-info">
        <Reveal y={20}>
          <div className="project-index">
            {t("file")} {num}
          </div>
        </Reveal>

        <RevealText
          text={project.title[locale]}
          className={`project-title ${locale === "ko" ? "ko" : ""}`}
          amount={0.4}
        />

        <Reveal delay={0.05} y={18}>
          <div className="project-company">
            <GlitchText text={project.company[locale]} />
            {project.tags?.map((tag) => (
              <span className="tag" key={tag}>
                {tag}
              </span>
            ))}
          </div>

          <p className="project-desc">{project.description[locale]}</p>

          <ul className="project-tech">
            {project.languages.map((lang) => (
              <li
                className="t"
                key={lang}
                style={{ ["--tc" as string]: colorFor(lang) }}
              >
                {lang}
              </li>
            ))}
          </ul>

          <ul className="contrib">
            {project.contribution[locale].map((c, i) => (
              <li key={i}>
                <span className="mk">{"//"}</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>

          {project.link && (
            <a
              className="btn"
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("viewLive")} <span className="arrow">↗</span>
            </a>
          )}
        </Reveal>
      </div>

      <Reveal className="project-media-wrap" delay={0.08} y={36} amount={0.15}>
        <span className="tape tl" aria-hidden="true" />
        <span className="tape br" aria-hidden="true" />
        <ul className={`media-grid ${vertical ? "vertical" : "horizontal"}`}>
          {project.media.map((m, i) => (
            <li key={i}>
              <MediaFrame item={m} tall={vertical} />
            </li>
          ))}
        </ul>
      </Reveal>
    </article>
  );
}

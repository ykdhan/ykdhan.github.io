import { useLocale } from "../i18n/LocaleContext";
import { useT } from "../i18n/strings";
import { projects } from "../data/portfolio";
import { Reveal, RevealText } from "./Reveal";
import ProjectCard from "./ProjectCard";

export default function Projects() {
  const { locale } = useLocale();
  const t = useT(locale);

  return (
    <section id="work" className="section">
      <div className="container">
        <div className="section-head">
          <Reveal y={16}>
            <span className="eyebrow">{t("worksEyebrow")}</span>
          </Reveal>
          <RevealText
            text={t("worksTitle")}
            className={`display section-title ${locale === "ko" ? "ko" : ""}`}
          />
        </div>

        <div className="projects-list">
          {projects.map((project, i) => (
            <ProjectCard
              key={`${project.title.en}-${i}`}
              project={project}
              index={i}
              flip={i % 2 === 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

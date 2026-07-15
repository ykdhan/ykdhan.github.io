import { useLocale } from "../i18n/LocaleContext";
import { useT } from "../i18n/strings";
import { WORK } from "../data/experience";
import SectionHead from "./SectionHead";
import Reveal from "./Reveal";

export default function Work() {
  const { locale } = useLocale();
  const t = useT(locale);

  return (
    <section className="section" id="work">
      <SectionHead index="02" label={t("workLabel")} title={t("workTitle")} />
      <div className="work-list">
        {WORK.map((w, i) => {
          const inner = (
            <>
              <div className="work-company mono">
                <span>{w.company[locale]}</span>
                {w.tag && <em className="work-tag">{w.tag[locale]}</em>}
              </div>
              <div className="work-main">
                <h3 className="work-project">
                  {w.project[locale]}
                  {w.link && (
                    <span className="work-arrow" aria-hidden="true">
                      ↗
                    </span>
                  )}
                </h3>
                <p className="work-desc">{w.description[locale]}</p>
              </div>
              <ul className="work-stack" aria-label="Stack">
                {w.stack.map((s) => (
                  <li key={s} className="chip mono">
                    {s}
                  </li>
                ))}
              </ul>
            </>
          );
          return (
            <Reveal key={`${w.company.en}-${w.project.en}`} delay={i * 60}>
              {w.link ? (
                <a
                  className="work-row"
                  href={w.link}
                  target="_blank"
                  rel="noreferrer"
                >
                  {inner}
                </a>
              ) : (
                <div className="work-row">{inner}</div>
              )}
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

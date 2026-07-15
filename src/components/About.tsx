import { useLocale } from "../i18n/LocaleContext";
import { useT } from "../i18n/strings";
import SectionHead from "./SectionHead";
import Reveal from "./Reveal";

const CARDS = [
  { title: "aboutCard1Title", body: "aboutCard1Body", glyph: "◇" },
  { title: "aboutCard2Title", body: "aboutCard2Body", glyph: "△" },
  { title: "aboutCard3Title", body: "aboutCard3Body", glyph: "○" }
] as const;

export default function About() {
  const { locale } = useLocale();
  const t = useT(locale);

  return (
    <section className="section" id="about">
      <SectionHead index="01" label={t("aboutLabel")} title={t("aboutTitle")} />
      <Reveal>
        <p className="section-body">{t("aboutBody")}</p>
      </Reveal>
      <div className="about-cards">
        {CARDS.map((c, i) => (
          <Reveal key={c.title} delay={i * 90}>
            <article className="card">
              <span className="card-glyph mono" aria-hidden="true">
                {c.glyph}
              </span>
              <h3 className="card-title">{t(c.title)}</h3>
              <p className="card-body">{t(c.body)}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

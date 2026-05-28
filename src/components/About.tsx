import { useLocale } from "../i18n/LocaleContext";
import { useT } from "../i18n/strings";
import { introduction, SITE } from "../data/portfolio";
import { Reveal, RevealText } from "./Reveal";

export default function About() {
  const { locale } = useLocale();
  const t = useT(locale);
  const statements = introduction[locale];

  return (
    <section id="about" className="section">
      <div className="container about-grid">
        <div className="about-left">
          <div className="section-head" style={{ marginBottom: 0 }}>
            <Reveal y={16}>
              <span className="eyebrow">{t("aboutEyebrow")}</span>
            </Reveal>
            <RevealText
              text={t("aboutTitle")}
              className={`display section-title ${locale === "ko" ? "ko" : ""}`}
            />
          </div>

          <Reveal className="about-card" delay={0.1}>
            <h3>{t("aboutCardTitle")}</h3>
            <div className="fact-list">
              <div className="fact">
                <span className="k">{t("factRole")}</span>
                <span className="v hl">{t("role")}</span>
              </div>
              <div className="fact">
                <span className="k">{t("factFocus")}</span>
                <span className="v">{t("factFocusVal")}</span>
              </div>
              <div className="fact">
                <span className="k">{t("factStack")}</span>
                <span className="v">{t("factStackVal")}</span>
              </div>
              <div className="fact">
                <span className="k">{t("factMail")}</span>
                <a className="v" href={`mailto:${SITE.email}`}>
                  {SITE.email}
                </a>
              </div>
            </div>
          </Reveal>
        </div>

        <div className="about-statements">
          {statements.map((s, i) => (
            <Reveal key={i} delay={i * 0.08} className="about-statement">
              <span className="n">{String(i + 1).padStart(2, "0")}</span>
              {s}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

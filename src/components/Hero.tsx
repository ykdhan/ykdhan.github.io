import { useLocale } from "../i18n/LocaleContext";
import { useT } from "../i18n/strings";
import Scramble from "./Scramble";
import HeroFX from "./HeroFX";

export default function Hero() {
  const { locale } = useLocale();
  const t = useT(locale);

  return (
    <section className="hero" id="top">
      <HeroFX />
      <p className="hero-kicker mono">
        <span className="hero-dot" aria-hidden="true" />
        {t("heroKicker")}
      </p>

      <h1 className="hero-title">
        <Scramble text={t("heroLine1")} />
        <br />
        <Scramble className="grad-text" text={t("heroLine2")} delay={250} />
      </h1>

      <p className="hero-sub">{t("heroSub")}</p>

      <div className="hero-cta">
        <a className="btn btn-primary" href="#contact">
          {t("heroCta")}
        </a>
        <a className="btn" href="#work">
          {t("heroCta2")}
        </a>
      </div>

      <ul className="hero-meta mono" aria-label="Highlights">
        <li>{t("heroMeta1")}</li>
        <li>{t("heroMeta2")}</li>
        <li>{t("heroMeta3")}</li>
      </ul>
    </section>
  );
}

import { useLocale } from "../i18n/LocaleContext";
import { useT, STRINGS } from "../i18n/strings";
import { Reveal, RevealText, Marked } from "./Reveal";

export default function Hero() {
  const { locale } = useLocale();
  const t = useT(locale);

  const line1 = locale === "ko" ? "풀스택" : "Fullstack";
  const line2 = locale === "ko" ? "개발자" : "Developer";
  const titleClass = `hero-title ${locale === "ko" ? "ko" : ""}`;

  return (
    <header id="top" className="hero">
      <div className="container" style={{ position: "relative", zIndex: 1, width: "100%" }}>
        <Reveal className="hero-tag" y={16}>
          <span className="eyebrow">
            {t("heroKicker")} · {new Date().getFullYear()} · {STRINGS.nameFull[locale]}
          </span>
        </Reveal>

        <h1 className={titleClass}>
          <RevealText text={line1} className="line outline" delay={0.05} />
          <RevealText text={line2} className="line accent" delay={0.18} />
        </h1>

        <div className="hero-sub">
          <Reveal className="hero-lede" delay={0.25}>
            <Marked text={t("heroLede")} />
          </Reveal>
        </div>
      </div>

      <div className="hero-watermark" aria-hidden="true">
        YK
      </div>

      <a
        className="scroll-cue"
        href="#about"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
        }}
      >
        <span className="bar" />
        {t("scrollCue")}
      </a>
    </header>
  );
}

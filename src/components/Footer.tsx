import { useLocale } from "../i18n/LocaleContext";
import { useT } from "../i18n/strings";
import { SITE } from "../data/portfolio";
import { Reveal, RevealText, Marked } from "./Reveal";
import { scrollToId } from "../hooks/useSmoothScroll";
import ContactForm from "./ContactForm";

export default function Footer() {
  const { locale } = useLocale();
  const t = useT(locale);
  const year = new Date().getFullYear();

  return (
    <footer id="contact" className="footer">
      <div className="container">
        <Reveal y={16}>
          <span className="eyebrow">{t("footerEyebrow")}</span>
        </Reveal>

        <RevealText
          text={t("footerCta")}
          className={`footer-cta ${locale === "ko" ? "ko" : ""}`}
          delay={0.05}
        />

        <a className="footer-mail" href={`mailto:${SITE.email}`}>
          <span className="line">{SITE.email}</span>
          <span aria-hidden="true">↗</span>
        </a>

        <Reveal delay={0.08} y={16}>
          <ContactForm />
        </Reveal>

        <Reveal delay={0.1} className="muted" y={14}>
          <p style={{ marginTop: 18, maxWidth: "44ch", fontSize: "clamp(15px,1.8vw,18px)" }}>
            <Marked text={t("footerNote")} />
          </p>
        </Reveal>

        <div className="footer-bottom">
          <span>
            © {year} {SITE.name[locale]} — {t("rights")}
          </span>
          <div className="footer-links">
            <a className="sticker" href={`mailto:${SITE.email}`}>
              ✉ Email
            </a>
            <a
              className="sticker"
              href={SITE.github}
              target="_blank"
              rel="noopener noreferrer"
            >
              ⌥ GitHub
            </a>
            <button
              className="sticker"
              onClick={() => scrollToId("top")}
              aria-label={t("backTop")}
            >
              ↑ {t("backTop")}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

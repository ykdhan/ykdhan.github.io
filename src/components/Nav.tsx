import { useEffect, useState } from "react";
import { useLocale } from "../i18n/LocaleContext";
import { useT } from "../i18n/strings";
import { SITE } from "../data/portfolio";
import { scrollToId } from "../hooks/useSmoothScroll";
import GlitchText from "./GlitchText";

export default function Nav() {
  const { locale, setLocale } = useLocale();
  const t = useT(locale);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`nav ${scrolled ? "scrolled" : ""}`}>
      <a
        className="nav-logo"
        href="#top"
        onClick={(e) => {
          e.preventDefault();
          scrollToId("top");
        }}
        aria-label="YK — home"
      >
        <span className="badge">YK</span>
        <span className="nav-role hide-sm">
          <GlitchText text={t("role")} />
        </span>
      </a>

      <div className="nav-right">
        <div className="sticker lang-toggle" role="group" aria-label="Language">
          <button
            className={locale === "ko" ? "on" : "off"}
            onClick={() => setLocale("ko")}
            aria-pressed={locale === "ko"}
          >
            KO
          </button>
          <span className="sep">/</span>
          <button
            className={locale === "en" ? "on" : "off"}
            onClick={() => setLocale("en")}
            aria-pressed={locale === "en"}
          >
            EN
          </button>
        </div>

        <a className="sticker solid hide-sm" href={`mailto:${SITE.email}`}>
          ✉ {locale === "ko" ? "메일" : "Email"}
        </a>
      </div>
    </nav>
  );
}

import { useLocale } from "../i18n/LocaleContext";
import { useT } from "../i18n/strings";
import { SITE } from "../data/experience";
import LogoMark from "./LogoMark";

const LINKS = [
  { id: "about", key: "navAbout" },
  { id: "work", key: "navWork" },
  { id: "stack", key: "navStack" },
  { id: "contact", key: "navContact" }
] as const;

export default function Nav() {
  const { locale, setLocale } = useLocale();
  const t = useT(locale);

  return (
    <header className="nav">
      <a className="nav-logo" href="#top" aria-label="YK — top">
        <LogoMark />
        <span className="nav-logo-mark">{SITE.name}</span>
        <span className="nav-logo-hex">{SITE.hex}</span>
      </a>

      <nav className="nav-links" aria-label="Sections">
        {LINKS.map((l) => (
          <a key={l.id} href={`#${l.id}`}>
            {t(l.key)}
          </a>
        ))}
      </nav>

      <div className="nav-lang" role="group" aria-label="Language">
        <button
          type="button"
          className={locale === "en" ? "on" : ""}
          onClick={() => setLocale("en")}
          aria-pressed={locale === "en"}
        >
          EN
        </button>
        <span aria-hidden="true">/</span>
        <button
          type="button"
          className={locale === "ko" ? "on" : ""}
          onClick={() => setLocale("ko")}
          aria-pressed={locale === "ko"}
        >
          KO
        </button>
      </div>
    </header>
  );
}

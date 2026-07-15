import { useLocale } from "../i18n/LocaleContext";
import { useT } from "../i18n/strings";
import { SITE } from "../data/experience";

export default function Footer() {
  const { locale } = useLocale();
  const t = useT(locale);

  return (
    <footer className="footer">
      <p className="mono footer-hex">
        © {new Date().getFullYear()} {SITE.name} · {SITE.hex}
      </p>
      <p className="footer-built">{t("footerBuilt")}</p>
      <a className="mono footer-top" href="#top">
        {t("backTop")} ↑
      </a>
    </footer>
  );
}

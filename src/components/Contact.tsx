import { useLocale } from "../i18n/LocaleContext";
import { useT } from "../i18n/strings";
import { SITE } from "../data/experience";
import SectionHead from "./SectionHead";
import Reveal from "./Reveal";
import ContactForm from "./ContactForm";

export default function Contact() {
  const { locale } = useLocale();
  const t = useT(locale);

  return (
    <section className="section" id="contact">
      <SectionHead
        index="04"
        label={t("contactLabel")}
        title={t("contactTitle")}
      />
      <Reveal>
        <p className="section-body">{t("contactBody")}</p>
      </Reveal>

      <Reveal delay={80}>
        <div className="contact-links">
          <a className="btn" href={`mailto:${SITE.email}`}>
            <span className="mono btn-tag">@</span> {SITE.email}
          </a>
          <a className="btn" href={SITE.github} target="_blank" rel="noreferrer">
            <span className="mono btn-tag">GH</span> GitHub
          </a>
          <a
            className="btn"
            href={SITE.linkedin}
            target="_blank"
            rel="noreferrer"
          >
            <span className="mono btn-tag">IN</span> LinkedIn
          </a>
        </div>
      </Reveal>

      <Reveal delay={160}>
        <p className="contact-note">{t("contactFormNote")}</p>
        <ContactForm />
      </Reveal>
    </section>
  );
}

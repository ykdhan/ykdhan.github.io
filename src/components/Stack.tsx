import { useLocale } from "../i18n/LocaleContext";
import { useT } from "../i18n/strings";
import { STACK_GROUPS } from "../data/experience";
import SectionHead from "./SectionHead";
import Reveal from "./Reveal";

export default function Stack() {
  const { locale } = useLocale();
  const t = useT(locale);

  return (
    <section className="section" id="stack">
      <SectionHead index="03" label={t("stackLabel")} title={t("stackTitle")} />
      <div className="stack-grid">
        {STACK_GROUPS.map((g, i) => (
          <Reveal key={g.label.en} delay={i * 90}>
            <div className="stack-group">
              <h3 className="stack-label mono">{g.label[locale]}</h3>
              <ul className="stack-items">
                {g.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

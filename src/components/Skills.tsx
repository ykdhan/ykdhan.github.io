import { motion, useReducedMotion } from "framer-motion";
import { useLocale } from "../i18n/LocaleContext";
import { useT } from "../i18n/strings";
import { allTech } from "../data/portfolio";
import { colorFor } from "../lib/consts";
import { Reveal, RevealText, Marked } from "./Reveal";
import Marquee from "./Marquee";

export default function Skills() {
  const { locale } = useLocale();
  const t = useT(locale);
  const reduce = useReducedMotion();

  return (
    <section id="stack" className="section">
      <div className="container">
        <div className="section-head">
          <Reveal y={16}>
            <span className="eyebrow">{t("skillsEyebrow")}</span>
          </Reveal>
          <RevealText
            text={t("skillsTitle")}
            className={`display section-title ${locale === "ko" ? "ko" : ""}`}
          />
          <Reveal delay={0.1} className="muted" y={14}>
            <p style={{ maxWidth: "52ch", fontSize: "clamp(15px,1.8vw,18px)" }}>
              <Marked text={t("skillsNote")} />
            </p>
          </Reveal>
        </div>

        {reduce ? (
          <ul className="sticker-wall">
            {allTech.map((tech) => (
              <li key={tech} className="chip" style={{ ["--c" as string]: colorFor(tech) }}>
                <span className="blob" />
                {tech}
              </li>
            ))}
          </ul>
        ) : (
          <motion.ul
            className="sticker-wall"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            variants={{ show: { transition: { staggerChildren: 0.028 } } }}
          >
            {allTech.map((tech) => (
              <motion.li
                key={tech}
                className="chip"
                style={{ ["--c" as string]: colorFor(tech) }}
                variants={{
                  hidden: { opacity: 0, y: 16, scale: 0.92, rotate: -2 },
                  show: { opacity: 1, y: 0, scale: 1, rotate: 0 }
                }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="blob" />
                {tech}
              </motion.li>
            ))}
          </motion.ul>
        )}
      </div>

      <div style={{ marginTop: "clamp(40px, 7vw, 80px)" }}>
        <Marquee items={allTech} duration="36s" invert />
      </div>
    </section>
  );
}

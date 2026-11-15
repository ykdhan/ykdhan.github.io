import type { Locale, PublicData } from "@yk/shared";
import { t } from "../i18n/strings";
import type { PanelRequest } from "./useAssistant";

type Entry = PublicData["entries"][number];

/** First meaningful lines of a body, without list markers. */
function excerpt(body: string, max = 280) {
  const text = body
    .split("\n")
    .map((l) => l.replace(/^[-*#>\s]+/, "").trim())
    .filter(Boolean)
    .join(" / ");
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function Links({ links }: { links: { label: string; url: string }[] }) {
  if (!links.length) return null;
  return (
    <p className="box-links">
      {links.map((l) => (
        <a key={l.url} href={l.url} target="_blank" rel="noreferrer">
          [{l.label}]
        </a>
      ))}
    </p>
  );
}

function EntryBox({ entry }: { entry: Entry }) {
  return (
    <fieldset className="box">
      <legend>
        {" "}
        {entry.kind.toUpperCase()}: {entry.title.toUpperCase()}{" "}
      </legend>
      {entry.subtitle && <p>{entry.subtitle}</p>}
      {entry.period && <p className="dim">{entry.period}</p>}
      {entry.body && <p className="dim">{excerpt(entry.body)}</p>}
      {entry.tags.length > 0 && <p>&gt; {entry.tags.slice(0, 10).join(" · ")}</p>}
      <Links links={entry.links} />
    </fieldset>
  );
}

/** A panel rendered as a DOS-style box inside the terminal log. */
export default function Panel({ req, data, locale }: { req: PanelRequest; data: PublicData; locale: Locale }) {
  if (req.panel === "contact") {
    const p = data.profile;
    return (
      <fieldset className="box">
        <legend> {t(locale, "contact").toUpperCase()} </legend>
        <p>
          {p.name} · {p.role[locale]}
        </p>
        {p.email && (
          <p>
            &gt; <a href={`mailto:${p.email}`}>{p.email}</a>
          </p>
        )}
        <Links links={p.links} />
      </fieldset>
    );
  }

  if (req.panel === "stack") {
    const groups = data.entries.filter((e) => e.kind === "skill");
    return (
      <fieldset className="box">
        <legend> {t(locale, "stack").toUpperCase()} </legend>
        {groups.map((g) => (
          <p key={g.slug}>
            <span className="box-key">{g.title.padEnd(12, " ")}</span>
            {(g.tags.length ? g.tags : g.body.split(/,\s*/)).join(" · ")}
          </p>
        ))}
      </fieldset>
    );
  }

  const entry = data.entries.find((e) => e.slug === req.slug);
  return entry ? <EntryBox entry={entry} /> : null;
}

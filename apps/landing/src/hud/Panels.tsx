import type { Locale, PublicData } from "@yk/shared";
import { t } from "../i18n/strings";
import type { PanelRequest } from "./useKai";

type Entry = PublicData["entries"][number];

/** First meaningful lines of a body, without list markers. */
function excerpt(body: string, max = 260) {
  const text = body
    .split("\n")
    .map((l) => l.replace(/^[-*#>\s]+/, "").trim())
    .filter(Boolean)
    .join(" · ");
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function EntryCard({ entry }: { entry: Entry }) {
  return (
    <>
      <p className="panel-kicker mono">{entry.kind}</p>
      <h3 className="panel-title">{entry.title}</h3>
      {entry.subtitle && <p className="panel-sub">{entry.subtitle}</p>}
      {entry.period && <p className="panel-period mono">{entry.period}</p>}
      {entry.body && <p className="panel-body">{excerpt(entry.body)}</p>}
      {entry.tags.length > 0 && (
        <ul className="panel-tags">
          {entry.tags.slice(0, 8).map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      )}
      {entry.links.length > 0 && (
        <div className="panel-links">
          {entry.links.map((l) => (
            <a key={l.url} href={l.url} target="_blank" rel="noreferrer">
              {l.label} ↗
            </a>
          ))}
        </div>
      )}
    </>
  );
}

function Body({ req, data, locale }: { req: PanelRequest; data: PublicData; locale: Locale }) {
  if (req.panel === "contact") {
    const p = data.profile;
    return (
      <>
        <p className="panel-kicker mono">{t(locale, "contact")}</p>
        <h3 className="panel-title">{p.name}</h3>
        <p className="panel-sub">{p.role[locale]}</p>
        <div className="panel-links panel-links-col">
          {p.email && <a href={`mailto:${p.email}`}>{p.email}</a>}
          {p.links.map((l) => (
            <a key={l.url} href={l.url} target="_blank" rel="noreferrer">
              {l.label} ↗
            </a>
          ))}
        </div>
      </>
    );
  }

  if (req.panel === "stack") {
    const groups = data.entries.filter((e) => e.kind === "skill");
    return (
      <>
        <p className="panel-kicker mono">{t(locale, "stack")}</p>
        {groups.map((g) => (
          <div key={g.slug} className="panel-group">
            <h3 className="panel-title panel-title-sm">{g.title}</h3>
            <ul className="panel-tags">
              {(g.tags.length ? g.tags : g.body.split(/,\s*/)).map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          </div>
        ))}
      </>
    );
  }

  const entry = data.entries.find((e) => e.slug === req.slug);
  return entry ? <EntryCard entry={entry} /> : null;
}

export default function Panels({
  panels,
  data,
  locale,
  onClose
}: {
  panels: PanelRequest[];
  data: PublicData;
  locale: Locale;
  onClose(key: string): void;
}) {
  return (
    <aside className="panels" aria-live="polite">
      {panels.map((req) => (
        <section key={req.key} className="panel" role="region" aria-label={req.slug ?? req.panel}>
          <button className="panel-close" onClick={() => onClose(req.key)} aria-label={t(locale, "close")}>
            ×
          </button>
          <Body req={req} data={data} locale={locale} />
        </section>
      ))}
    </aside>
  );
}

import { useMemo, useState } from "react";
import type { Entry, EntryKind } from "@yk/shared";
import { ENTRY_KINDS } from "@yk/shared";
import { api } from "../api";
import { Field, Page, State, formatLinks, parseLinks, splitList, useAction, useLoad } from "../ui";

type Draft = {
  id?: string;
  kind: EntryKind;
  slug: string;
  title: string;
  subtitle: string;
  period: string;
  body: string;
  tags: string;
  links: string;
  visible: boolean;
  sort: number;
};

const blank = (kind: EntryKind): Draft => ({
  kind,
  slug: "",
  title: "",
  subtitle: "",
  period: "",
  body: "",
  tags: "",
  links: "",
  visible: true,
  sort: 0
});

const toDraft = (e: Entry): Draft => ({
  id: e.id,
  kind: e.kind,
  slug: e.slug,
  title: e.title,
  subtitle: e.subtitle,
  period: e.period,
  body: e.body,
  tags: e.tags.join(", "),
  links: formatLinks(e.links),
  visible: e.visible,
  sort: e.sort
});

const KIND_HINT: Record<EntryKind, string> = {
  experience: "Companies and roles",
  project: "Things you built: shown as panels",
  skill: "Groups of tools for the stack panel (tags = items)",
  education: "Schools, courses, certificates",
  award: "Recognition",
  faq: "Your own answers to questions visitors ask"
};

export default function Entries() {
  const { data, setData, error, loading } = useLoad(() => api<Entry[]>("/admin/entries"));
  const [kind, setKind] = useState<EntryKind>("project");
  const [draft, setDraft] = useState<Draft | null>(null);
  const { busy, run } = useAction();

  const list = useMemo(() => (data ?? []).filter((e) => e.kind === kind), [data, kind]);
  const counts = useMemo(
    () => Object.fromEntries(ENTRY_KINDS.map((k) => [k, (data ?? []).filter((e) => e.kind === k).length])),
    [data]
  );

  const save = () =>
    draft &&
    run(async () => {
      const body = {
        kind: draft.kind,
        slug: draft.slug,
        title: draft.title,
        subtitle: draft.subtitle,
        period: draft.period,
        body: draft.body,
        tags: splitList(draft.tags),
        links: parseLinks(draft.links),
        visible: draft.visible,
        sort: Number(draft.sort) || 0
      };
      const saved = draft.id
        ? await api<Entry>(`/admin/entries/${draft.id}`, { method: "PUT", body })
        : await api<Entry>("/admin/entries", { method: "POST", body });
      setData((cur) => {
        const rest = (cur ?? []).filter((e) => e.id !== saved.id);
        return [...rest, saved].sort((a, b) => a.sort - b.sort);
      });
      setKind(saved.kind);
      setDraft(toDraft(saved));
    }, "Saved and indexed");

  const remove = () =>
    draft?.id &&
    confirm(`Delete "${draft.title}"?`) &&
    run(async () => {
      await api(`/admin/entries/${draft.id}`, { method: "DELETE" });
      setData((cur) => (cur ?? []).filter((e) => e.id !== draft.id));
      setDraft(null);
    }, "Deleted");

  const d = draft;
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => d && setDraft({ ...d, [k]: v });

  return (
    <Page
      title="Entries"
      actions={
        <button className="btn btn-primary" onClick={() => setDraft(blank(kind))}>
          New {kind}
        </button>
      }
    >
      <div className="tabs">
        {ENTRY_KINDS.map((k) => (
          <button key={k} className={k === kind ? "is-on" : ""} onClick={() => setKind(k)}>
            {k} <span className="count">{counts[k]}</span>
          </button>
        ))}
      </div>
      <p className="muted small">{KIND_HINT[kind]}</p>
      <State loading={loading} error={error} />

      <div className="split">
        <ul className="list">
          {list.map((e) => (
            <li key={e.id}>
              <button className={d?.id === e.id ? "is-on" : ""} onClick={() => setDraft(toDraft(e))}>
                <span className="list-title">
                  {e.title}
                  {!e.visible && <span className="badge">hidden</span>}
                  {e.source === "github" && <span className="badge">github</span>}
                </span>
                <span className="list-sub">{e.subtitle || e.body.slice(0, 80)}</span>
              </button>
            </li>
          ))}
          {list.length === 0 && !loading && <li className="muted small">Nothing here yet.</li>}
        </ul>

        {d && (
          <div className="editor">
            <div className="grid-2">
              <Field label="Kind">
                <select value={d.kind} onChange={(e) => set("kind", e.target.value as EntryKind)}>
                  {ENTRY_KINDS.map((k) => (
                    <option key={k}>{k}</option>
                  ))}
                </select>
              </Field>
              <Field label="Slug" hint="Used by the assistant to open panels. Auto from title if empty.">
                <input value={d.slug} onChange={(e) => set("slug", e.target.value)} />
              </Field>
            </div>
            <Field label={d.kind === "faq" ? "Question" : "Title"}>
              <input value={d.title} onChange={(e) => set("title", e.target.value)} />
            </Field>
            {d.kind !== "faq" && (
              <div className="grid-2">
                <Field label="Subtitle">
                  <input value={d.subtitle} onChange={(e) => set("subtitle", e.target.value)} />
                </Field>
                <Field label="Period" hint="e.g. 2022.03 — present">
                  <input value={d.period} onChange={(e) => set("period", e.target.value)} />
                </Field>
              </div>
            )}
            <Field
              label={d.kind === "faq" ? "Answer" : "Details"}
              hint="Everything here is searchable by the assistant. Write freely, in any language."
            >
              <textarea rows={12} value={d.body} onChange={(e) => set("body", e.target.value)} />
            </Field>
            <div className="grid-2">
              <Field label="Tags" hint="Comma separated">
                <input value={d.tags} onChange={(e) => set("tags", e.target.value)} />
              </Field>
              <Field label="Links" hint="One per line: Label | https://…">
                <textarea rows={2} value={d.links} onChange={(e) => set("links", e.target.value)} />
              </Field>
            </div>
            <div className="row">
              <label className="check">
                <input type="checkbox" checked={d.visible} onChange={(e) => set("visible", e.target.checked)} />
                Visible on site
              </label>
              <Field label="Order">
                <input
                  type="number"
                  className="narrow"
                  value={d.sort}
                  onChange={(e) => set("sort", Number(e.target.value))}
                />
              </Field>
              <span className="spacer" />
              {d.id && (
                <button className="btn btn-danger" disabled={busy} onClick={remove}>
                  Delete
                </button>
              )}
              <button className="btn btn-primary" disabled={busy || !d.title.trim()} onClick={save}>
                {d.id ? "Save" : "Create"}
              </button>
            </div>
          </div>
        )}
      </div>
    </Page>
  );
}

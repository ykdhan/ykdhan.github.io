import { useState, type FormEvent } from "react";
import type { Memory as MemoryT, SearchHit } from "@yk/shared";
import { api } from "../api";
import { Field, Page, State, fmtDate, splitList, useAction, useLoad } from "../ui";

type Draft = { id?: string; title: string; content: string; tags: string };

/**
 * Free-form knowledge for the assistant: stories, opinions, context that
 * doesn't fit a structured entry. Searchable, never shown as a panel.
 */
export default function Memory() {
  const { data, setData, error, loading } = useLoad(() => api<MemoryT[]>("/admin/memories"));
  const [draft, setDraft] = useState<Draft | null>(null);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<SearchHit[] | null>(null);
  const { busy, run } = useAction();

  const save = () =>
    draft &&
    run(async () => {
      const body = { title: draft.title, content: draft.content, tags: splitList(draft.tags) };
      const saved = draft.id
        ? await api<MemoryT>(`/admin/memories/${draft.id}`, { method: "PUT", body })
        : await api<MemoryT>("/admin/memories", { method: "POST", body });
      setData((cur) => [saved, ...(cur ?? []).filter((m) => m.id !== saved.id)]);
      setDraft({ id: saved.id, title: saved.title, content: saved.content, tags: saved.tags.join(", ") });
    }, "Saved and indexed");

  const remove = () =>
    draft?.id &&
    confirm("Delete this memory?") &&
    run(async () => {
      await api(`/admin/memories/${draft.id}`, { method: "DELETE" });
      setData((cur) => (cur ?? []).filter((m) => m.id !== draft.id));
      setDraft(null);
    }, "Deleted");

  const search = (e: FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    run(async () => setHits(await api<SearchHit[]>(`/admin/search?q=${encodeURIComponent(q)}`)));
  };

  return (
    <Page
      title="Memory"
      actions={
        <button className="btn btn-primary" onClick={() => setDraft({ title: "", content: "", tags: "" })}>
          New memory
        </button>
      }
    >
      <form className="probe" onSubmit={search}>
        <span className="field-label">Retrieval test</span>
        <div className="row">
          <input
            placeholder="Ask what a visitor might ask, see what the assistant would read…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button className="btn" disabled={busy}>
            Search
          </button>
        </div>
        {hits && (
          <ol className="hits">
            {hits.length === 0 && <li className="muted">No matches: the assistant would say it can't answer.</li>}
            {hits.map((h, i) => (
              <li key={i}>
                <div className="hit-head">
                  <span className="badge">{h.ownerType}</span>
                  <strong>{h.title}</strong>
                  <span className="muted small">
                    {h.via} · {h.score}
                  </span>
                </div>
                <p className="hit-body">{h.content.slice(0, 300)}</p>
              </li>
            ))}
          </ol>
        )}
      </form>

      <State loading={loading} error={error} />
      <div className="split">
        <ul className="list">
          {(data ?? []).map((m) => (
            <li key={m.id}>
              <button
                className={draft?.id === m.id ? "is-on" : ""}
                onClick={() => setDraft({ id: m.id, title: m.title, content: m.content, tags: m.tags.join(", ") })}
              >
                <span className="list-title">
                  {m.title || "Untitled"}
                  {m.source !== "manual" && <span className="badge">{m.source}</span>}
                </span>
                <span className="list-sub">{fmtDate(m.updatedAt)}</span>
              </button>
            </li>
          ))}
          {data?.length === 0 && (
            <li className="muted small">
              Add anything you want the assistant to know: how you work, what you're looking for, stories behind
              projects.
            </li>
          )}
        </ul>

        {draft && (
          <div className="editor">
            <Field label="Title">
              <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            </Field>
            <Field label="Content" hint="Long text is split into chunks automatically.">
              <textarea
                rows={16}
                value={draft.content}
                onChange={(e) => setDraft({ ...draft, content: e.target.value })}
              />
            </Field>
            <Field label="Tags" hint="Comma separated">
              <input value={draft.tags} onChange={(e) => setDraft({ ...draft, tags: e.target.value })} />
            </Field>
            <div className="row">
              <span className="spacer" />
              {draft.id && (
                <button className="btn btn-danger" disabled={busy} onClick={remove}>
                  Delete
                </button>
              )}
              <button className="btn btn-primary" disabled={busy || !draft.content.trim()} onClick={save}>
                {draft.id ? "Save" : "Create"}
              </button>
            </div>
          </div>
        )}
      </div>
    </Page>
  );
}

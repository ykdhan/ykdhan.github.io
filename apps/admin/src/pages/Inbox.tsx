import { useState } from "react";
import type { InboxItem, InboxType } from "@yk/shared";
import { api } from "../api";
import { Page, State, fmtDate, useAction, useLoad } from "../ui";

const LABEL: Record<InboxType, string> = {
  unanswered: "❓ Unanswered",
  collaboration: "🤝 Collaboration",
  contact: "✉️ Contact"
};

function AnswerForm({ item, onDone }: { item: InboxItem; onDone(): void }) {
  const [question, setQuestion] = useState(item.message);
  const [answer, setAnswer] = useState("");
  const { busy, run } = useAction();
  return (
    <div className="answer">
      <p className="muted small">
        Save an answer as an FAQ entry. The assistant will use it the next time someone asks.
      </p>
      <input value={question} onChange={(e) => setQuestion(e.target.value)} />
      <textarea rows={3} placeholder="Your answer…" value={answer} onChange={(e) => setAnswer(e.target.value)} />
      <div className="row">
        <span className="spacer" />
        <button
          className="btn btn-primary"
          disabled={busy || !answer.trim()}
          onClick={() =>
            run(async () => {
              await api(`/admin/inbox/${item.id}/answer`, { method: "POST", body: { question, answer } });
              onDone();
            }, "Added to FAQ")
          }
        >
          Teach the assistant
        </button>
      </div>
    </div>
  );
}

export default function Inbox() {
  const { data, setData, error, loading } = useLoad(() => api<InboxItem[]>("/admin/inbox"));
  const [filter, setFilter] = useState<"new" | "all">("new");
  const [open, setOpen] = useState<string | null>(null);
  const { run } = useAction();

  const items = (data ?? []).filter((i) => filter === "all" || i.status === "new");

  const setStatus = (item: InboxItem, status: "new" | "done") =>
    run(async () => {
      await api(`/admin/inbox/${item.id}`, { method: "PATCH", body: { status } });
      setData((cur) => (cur ?? []).map((i) => (i.id === item.id ? { ...i, status } : i)));
    });

  const remove = (item: InboxItem) =>
    confirm("Delete this item?") &&
    run(async () => {
      await api(`/admin/inbox/${item.id}`, { method: "DELETE" });
      setData((cur) => (cur ?? []).filter((i) => i.id !== item.id));
    });

  return (
    <Page title="Inbox">
      <div className="tabs">
        <button className={filter === "new" ? "is-on" : ""} onClick={() => setFilter("new")}>
          New <span className="count">{(data ?? []).filter((i) => i.status === "new").length}</span>
        </button>
        <button className={filter === "all" ? "is-on" : ""} onClick={() => setFilter("all")}>
          All <span className="count">{data?.length ?? 0}</span>
        </button>
      </div>
      <State loading={loading} error={error} />
      {items.length === 0 && !loading && <p className="muted">Nothing new. Everything is answered.</p>}

      <ul className="inbox">
        {items.map((item) => (
          <li key={item.id} className={`inbox-item${item.status === "done" ? " is-done" : ""}`}>
            <div className="inbox-head">
              <span className={`badge badge-${item.type}`}>{LABEL[item.type]}</span>
              <span className="muted small">{fmtDate(item.createdAt)}</span>
              {!item.slackOk && <span className="badge badge-warn">Slack not delivered</span>}
              <span className="spacer" />
              <button className="link" onClick={() => setOpen(open === item.id ? null : item.id)}>
                {open === item.id ? "Hide" : item.type === "unanswered" ? "Answer" : "Conversation"}
              </button>
              <button className="link" onClick={() => setStatus(item, item.status === "new" ? "done" : "new")}>
                {item.status === "new" ? "Mark done" : "Reopen"}
              </button>
              <button className="link danger" onClick={() => remove(item)}>
                Delete
              </button>
            </div>
            <p className="inbox-msg">{item.message}</p>
            {(item.name || item.contact) && (
              <p className="small">
                {item.name && <strong>{item.name}</strong>} {item.contact && <span className="muted">· {item.contact}</span>}
              </p>
            )}
            {open === item.id && (
              <>
                {item.transcript.length > 0 && (
                  <ol className="transcript">
                    {item.transcript.map((m, i) => (
                      <li key={i} className={`msg msg-${m.role}`}>
                        {m.content}
                      </li>
                    ))}
                  </ol>
                )}
                {item.type === "unanswered" && (
                  <AnswerForm
                    item={item}
                    onDone={() => {
                      setData((cur) => (cur ?? []).map((i) => (i.id === item.id ? { ...i, status: "done" } : i)));
                      setOpen(null);
                    }}
                  />
                )}
              </>
            )}
          </li>
        ))}
      </ul>
    </Page>
  );
}

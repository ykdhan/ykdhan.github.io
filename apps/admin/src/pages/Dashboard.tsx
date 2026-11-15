import type { AdminStats } from "@yk/shared";
import { api } from "../api";
import { Page, State, useAction, useLoad } from "../ui";

// Claude Haiku 5.5 list prices per 1M tokens (prompts up to 100K). Cache reads
// are billed at roughly a tenth of the input price. Estimates only.
const PRICE = { input: 0.1, cached: 0.01, output: 0.5 };

const usd = (n: number) => `$${n.toFixed(n < 1 ? 4 : 2)}`;

export default function Dashboard() {
  const { data, error, loading, reload } = useLoad(() => api<AdminStats>("/admin/stats"));
  const { busy, run } = useAction();

  const usage = data?.usage ?? [];
  const cost = (u: AdminStats["usage"][number]) =>
    ((u.inputTokens * PRICE.input + u.cachedTokens * PRICE.cached + u.outputTokens * PRICE.output) / 1e6);
  const total = usage.reduce((s, u) => s + cost(u), 0);

  return (
    <Page
      title="Dashboard"
      actions={
        <>
          <button
            className="btn"
            disabled={busy}
            onClick={() =>
              run(async () => {
                const { ok } = await api<{ ok: boolean }>("/admin/slack/test", { method: "POST" });
                if (!ok) throw new Error("Slack rejected the message (check SLACK_WEBHOOK_URL)");
              }, "Slack test sent")
            }
          >
            Test Slack
          </button>
          <button
            className="btn"
            disabled={busy}
            onClick={() =>
              run(async () => {
                const { chunks } = await api<{ chunks: number }>("/admin/reindex", { method: "POST" });
                await reload();
                return chunks;
              }, "Memory reindexed")
            }
          >
            Reindex memory
          </button>
        </>
      }
    >
      <State loading={loading} error={error} />
      {data && (
        <>
          <div className="cards">
            <a className="card" href="#/inbox">
              <span className="card-label">New in inbox</span>
              <span className="card-value">{data.inboxNew}</span>
            </a>
            <a className="card" href="#/entries">
              <span className="card-label">Entries</span>
              <span className="card-value">{data.entries}</span>
            </a>
            <a className="card" href="#/memory">
              <span className="card-label">Memories</span>
              <span className="card-value">{data.memories}</span>
            </a>
            <div className="card">
              <span className="card-label">Indexed chunks</span>
              <span className="card-value">
                {data.embeddedChunks}/{data.chunks}
              </span>
              <span className="card-foot">embedded · {data.embedder}</span>
            </div>
            <div className="card">
              <span className="card-label">AI cost · 30 days (est.)</span>
              <span className="card-value">{usd(total)}</span>
              <span className="card-foot">{usage.reduce((s, u) => s + u.requests, 0)} questions</span>
            </div>
          </div>

          <h2 className="section-title">Daily usage</h2>
          {usage.length === 0 ? (
            <p className="muted">No conversations yet.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Questions</th>
                  <th>Input</th>
                  <th>Cached</th>
                  <th>Output</th>
                  <th>Est. cost</th>
                </tr>
              </thead>
              <tbody>
                {[...usage].reverse().map((u) => (
                  <tr key={u.day}>
                    <td>{u.day}</td>
                    <td>{u.requests}</td>
                    <td>{u.inputTokens.toLocaleString()}</td>
                    <td>{u.cachedTokens.toLocaleString()}</td>
                    <td>{u.outputTokens.toLocaleString()}</td>
                    <td>{usd(cost(u))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </Page>
  );
}

import { useEffect, useState } from "react";
import type { GithubRepo } from "@yk/shared";
import { api } from "../api";
import { Field, Page, State, useAction, useLoad } from "../ui";

export default function Github() {
  const settings = useLoad(() => api<{ username: string }>("/admin/github"));
  const [username, setUsername] = useState("");
  const [repos, setRepos] = useState<GithubRepo[] | null>(null);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [hideForks, setHideForks] = useState(true);
  const { busy, run } = useAction();

  useEffect(() => {
    if (settings.data) setUsername(settings.data.username);
  }, [settings.data]);

  const load = () =>
    run(async () => {
      await api("/admin/github", { method: "PUT", body: { username } });
      setRepos(await api<GithubRepo[]>("/admin/github/repos"));
      setPicked(new Set());
    });

  const importAs = (as: "project" | "memory") =>
    run(async () => {
      const res = await api<{ fullName: string; created: boolean }[]>("/admin/github/import", {
        method: "POST",
        body: { repos: [...picked], as }
      });
      setRepos(await api<GithubRepo[]>("/admin/github/repos"));
      setPicked(new Set());
      return res;
    }, as === "project" ? "Imported as hidden projects. Publish them in Entries." : "Imported into memory");

  const toggle = (name: string) =>
    setPicked((cur) => {
      const next = new Set(cur);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

  const shown = (repos ?? []).filter((r) => !hideForks || !r.fork);

  return (
    <Page
      title="GitHub"
      actions={
        picked.size > 0 && (
          <>
            <button className="btn" disabled={busy} onClick={() => importAs("memory")}>
              Import {picked.size} as memory
            </button>
            <button className="btn btn-primary" disabled={busy} onClick={() => importAs("project")}>
              Import {picked.size} as projects
            </button>
          </>
        )
      }
    >
      <p className="muted small">
        Repository descriptions, topics and READMEs become knowledge for the assistant. Importing again re-syncs
        the latest README. Projects arrive hidden so you can review them first.
      </p>
      <div className="row">
        <Field label="GitHub username">
          <input value={username} onChange={(e) => setUsername(e.target.value)} />
        </Field>
        <button className="btn" disabled={busy || !username.trim()} onClick={load}>
          Load repositories
        </button>
        <label className="check">
          <input type="checkbox" checked={hideForks} onChange={(e) => setHideForks(e.target.checked)} />
          Hide forks
        </label>
      </div>
      <State loading={settings.loading} error={settings.error} />

      {repos && (
        <table className="table">
          <thead>
            <tr>
              <th />
              <th>Repository</th>
              <th>Language</th>
              <th>★</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <tr key={r.fullName} onClick={() => toggle(r.fullName)} className="clickable">
                <td>
                  <input type="checkbox" readOnly checked={picked.has(r.fullName)} />
                </td>
                <td>
                  <strong>{r.name}</strong>
                  {r.imported && <span className="badge">imported</span>}
                  {r.fork && <span className="badge">fork</span>}
                  <div className="muted small">{r.description}</div>
                </td>
                <td>{r.language}</td>
                <td>{r.stars}</td>
                <td className="muted small">{r.pushedAt.slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Page>
  );
}

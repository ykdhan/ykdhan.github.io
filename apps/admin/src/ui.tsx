import { useCallback, useEffect, useState, type ReactNode } from "react";

/** Loads data once (and on demand) with loading/error state. */
export function useLoad<T>(load: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await load());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, deps);
  useEffect(() => {
    reload();
  }, [reload]);
  return { data, setData, error, loading, reload };
}

/** Wraps an async action with busy + toast feedback. */
export function useAction() {
  const [busy, setBusy] = useState(false);
  const run = async <T,>(fn: () => Promise<T>, success?: string): Promise<T | undefined> => {
    setBusy(true);
    try {
      const out = await fn();
      if (success) toast(success);
      return out;
    } catch (e) {
      toast((e as Error).message, true);
    } finally {
      setBusy(false);
    }
  };
  return { busy, run };
}

/* ---------- toast ---------- */

type Toast = { id: number; text: string; error: boolean };
let push: (t: Toast) => void = () => {};
export const toast = (text: string, error = false) => push({ id: Date.now() + Math.random(), text, error });

export function Toaster() {
  const [items, setItems] = useState<Toast[]>([]);
  useEffect(() => {
    push = (t) => {
      setItems((cur) => [...cur, t]);
      setTimeout(() => setItems((cur) => cur.filter((x) => x.id !== t.id)), 3500);
    };
  }, []);
  return (
    <div className="toaster">
      {items.map((t) => (
        <div key={t.id} className={`toast${t.error ? " toast-error" : ""}`}>
          {t.text}
        </div>
      ))}
    </div>
  );
}

/* ---------- small building blocks ---------- */

export function Page({ title, actions, children }: { title: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <section className="page">
      <header className="page-head">
        <h1>{title}</h1>
        <div className="page-actions">{actions}</div>
      </header>
      {children}
    </section>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}

export const State = ({ loading, error }: { loading: boolean; error: string | null }) =>
  error ? <p className="muted error">{error}</p> : loading ? <p className="muted">Loading…</p> : null;

/** "a, b, c" <-> ["a","b","c"] */
export const splitList = (s: string) =>
  s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

/** "Label | https://…" per line <-> Link[] */
export const parseLinks = (s: string) =>
  s
    .split("\n")
    .map((line) => line.split("|").map((x) => x.trim()))
    .filter(([label, url]) => label && url)
    .map(([label, url]) => ({ label, url }));

export const formatLinks = (links: { label: string; url: string }[]) =>
  links.map((l) => `${l.label} | ${l.url}`).join("\n");

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("ko-KR", { dateStyle: "short", timeStyle: "short" });

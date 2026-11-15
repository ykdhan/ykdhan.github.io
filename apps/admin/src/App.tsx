import { useEffect, useState, type FormEvent } from "react";
import { api, auth, setUnauthorizedHandler } from "./api";
import { Toaster, toast } from "./ui";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Entries from "./pages/Entries";
import Memory from "./pages/Memory";
import Github from "./pages/Github";
import Inbox from "./pages/Inbox";

const PAGES = {
  dashboard: { label: "Dashboard", el: Dashboard },
  inbox: { label: "Inbox", el: Inbox },
  profile: { label: "Profile", el: Profile },
  entries: { label: "Entries", el: Entries },
  memory: { label: "Memory", el: Memory },
  github: { label: "GitHub", el: Github }
} as const;
type PageKey = keyof typeof PAGES;

const fromHash = (): PageKey => {
  const key = window.location.hash.replace(/^#\/?/, "") as PageKey;
  return key in PAGES ? key : "dashboard";
};

function Login({ onDone }: { onDone(): void }) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { token } = await api<{ token: string }>("/admin/login", { method: "POST", body: { password } });
      auth.set(token);
      onDone();
    } catch (err) {
      toast((err as Error).message, true);
    } finally {
      setBusy(false);
    }
  };
  return (
    <form className="login" onSubmit={submit}>
      <div className="login-orb" />
      <h1>K.A.I. Admin</h1>
      <input
        type="password"
        autoFocus
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="btn btn-primary" disabled={busy || !password}>
        {busy ? "…" : "Sign in"}
      </button>
    </form>
  );
}

export default function App() {
  const [authed, setAuthed] = useState(!!auth.get());
  const [page, setPage] = useState<PageKey>(fromHash);

  useEffect(() => {
    setUnauthorizedHandler(() => setAuthed(false));
    const onHash = () => setPage(fromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  if (!authed)
    return (
      <>
        <Login onDone={() => setAuthed(true)} />
        <Toaster />
      </>
    );

  const Current = PAGES[page].el;
  return (
    <div className="shell">
      <nav className="side">
        <div className="brand">
          <span className="brand-dot" />
          K.A.I.
        </div>
        {(Object.keys(PAGES) as PageKey[]).map((key) => (
          <a key={key} href={`#/${key}`} className={page === key ? "is-on" : ""}>
            {PAGES[key].label}
          </a>
        ))}
        <button
          className="side-logout"
          onClick={() => {
            auth.clear();
            setAuthed(false);
          }}
        >
          Sign out
        </button>
      </nav>
      <main className="main">
        <Current />
      </main>
      <Toaster />
    </div>
  );
}

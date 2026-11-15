import { useEffect, useState } from "react";
import type { L10n, Profile as ProfileT } from "@yk/shared";
import { api } from "../api";
import { Field, Page, State, formatLinks, parseLinks, useAction, useLoad } from "../ui";

function L10nField({
  label,
  value,
  onChange,
  multiline
}: {
  label: string;
  value: L10n;
  onChange(v: L10n): void;
  multiline?: boolean;
}) {
  const Input = multiline ? "textarea" : "input";
  return (
    <div className="grid-2">
      <Field label={`${label} · EN`}>
        <Input value={value.en} rows={3} onChange={(e) => onChange({ ...value, en: e.target.value })} />
      </Field>
      <Field label={`${label} · KO`}>
        <Input value={value.ko} rows={3} onChange={(e) => onChange({ ...value, ko: e.target.value })} />
      </Field>
    </div>
  );
}

export default function Profile() {
  const { data, error, loading } = useLoad(() => api<ProfileT>("/admin/profile"));
  const [p, setP] = useState<ProfileT | null>(null);
  const [links, setLinks] = useState("");
  const { busy, run } = useAction();

  useEffect(() => {
    if (data) {
      setP(data);
      setLinks(formatLinks(data.links));
    }
  }, [data]);

  if (!p) return <Page title="Profile"><State loading={loading} error={error} /></Page>;

  const set = <K extends keyof ProfileT>(k: K, v: ProfileT[K]) => setP({ ...p, [k]: v });
  const save = () =>
    run(async () => {
      const saved = await api<ProfileT>("/admin/profile", { method: "PUT", body: { ...p, links: parseLinks(links) } });
      setP(saved);
    }, "Profile saved");

  return (
    <Page
      title="Profile"
      actions={
        <button className="btn btn-primary" disabled={busy} onClick={save}>
          Save
        </button>
      }
    >
      <div className="form">
        <h2 className="section-title">Identity</h2>
        <div className="grid-2">
          <Field label="Name">
            <input value={p.name} onChange={(e) => set("name", e.target.value)} />
          </Field>
          <Field label="Alias">
            <input value={p.alias} onChange={(e) => set("alias", e.target.value)} />
          </Field>
        </div>
        <L10nField label="Role" value={p.role} onChange={(v) => set("role", v)} />
        <L10nField label="Location" value={p.location} onChange={(v) => set("location", v)} />
        <L10nField label="Summary" value={p.summary} onChange={(v) => set("summary", v)} multiline />
        <div className="grid-2">
          <Field label="Email">
            <input value={p.email} onChange={(e) => set("email", e.target.value)} />
          </Field>
          <Field label="Links" hint="One per line: Label | https://…">
            <textarea rows={3} value={links} onChange={(e) => setLinks(e.target.value)} />
          </Field>
        </div>

        <h2 className="section-title">Assistant</h2>
        <Field label="Assistant name">
          <input value={p.assistantName} onChange={(e) => set("assistantName", e.target.value)} />
        </Field>
        <L10nField label="Greeting" value={p.greeting} onChange={(v) => set("greeting", v)} multiline />
        <div className="grid-2">
          {(["en", "ko"] as const).map((lang) => (
            <Field key={lang} label={`Suggested questions · ${lang.toUpperCase()}`} hint="One per line, up to 6">
              <textarea
                rows={4}
                value={p.suggestions[lang].join("\n")}
                onChange={(e) =>
                  set("suggestions", {
                    ...p.suggestions,
                    [lang]: e.target.value.split("\n").filter((s) => s.trim()).slice(0, 6)
                  })
                }
              />
            </Field>
          ))}
        </div>
        <Field
          label="Private notes for the assistant"
          hint="Tone, what to emphasise, what to avoid. Never shown to visitors."
        >
          <textarea rows={6} value={p.persona} onChange={(e) => set("persona", e.target.value)} />
        </Field>
      </div>
    </Page>
  );
}

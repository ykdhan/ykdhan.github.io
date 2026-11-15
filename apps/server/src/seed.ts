import { readFileSync } from "node:fs";
import type { EntryInput, Profile } from "@yk/shared";
import { slugify } from "@yk/shared";
import { one } from "./db.ts";
import { reindexAll } from "./memory.ts";
import { createEntry, setSetting } from "./repo.ts";

/**
 * First-boot content, migrated from the previous static site so the assistant
 * has something to work with. Everything here is editable in the admin panel.
 */

const PROFILE: Profile = {
  name: "Youngkwang Han",
  alias: "YK",
  role: { en: "Fullstack Developer", ko: "풀스택 개발자" },
  location: { en: "Seoul, South Korea", ko: "대한민국 서울" },
  summary: {
    en: "Fullstack developer who designs systems across web, mobile, and backend, keeps the details tight, and uses an AI-native workflow to deliver fast without cutting quality.",
    ko: "웹·모바일·백엔드를 아우르는 설계부터 꼼꼼한 구현까지, AI 네이티브 워크플로우로 품질을 지키면서 빠르게 결과를 만드는 풀스택 개발자입니다."
  },
  email: "ykdhan@gmail.com",
  links: [
    { label: "GitHub", url: "https://github.com/ykdhan" },
    { label: "LinkedIn", url: "https://www.linkedin.com/in/ykdhan" }
  ],
  assistantName: "Ralph",
  greeting: {
    en: "Ralph online. I'm YK's assistant. Ask me anything about YK, or pick a number below.",
    ko: "Ralph 접속 완료. YK의 비서 랄프입니다. YK에 대해 무엇이든 물어보시거나, 아래 번호를 골라주세요."
  },
  suggestions: {
    en: ["What does YK do?", "Show me the projects", "Has YK built mobile apps?", "I'd like to collaborate"],
    ko: ["YK는 어떤 개발자야?", "프로젝트 보여줘", "모바일 앱 만들어봤어?", "협업 제안하고 싶어"]
  },
  persona: ""
};

const EXPERIENCE: [string, string, string, string[]][] = [
  ["Outschool", "Online learning platform for kids", "Fullstack developer", ["React", "TypeScript", "GraphQL", "PostgreSQL", "Express"]],
  ["Plang", "AI-driven English conversation app", "Mobile & backend developer", ["React Native", "TypeScript", "Redux-Saga", "Ruby on Rails"]],
  ["feel.D", "Markhub — design collaboration tool (freelance)", "Freelance developer", ["Flutter", "GraphQL", "Firebase"]],
  ["FLFI", "OG.xyz · OG — crypto community & NFT curation", "Frontend & mobile developer", ["Vue", "Nuxt", "Flutter", "Web3"]],
  ["Fave", "Interactive campaign sites (Galaxy Unpacked, Fave.kr)", "Creative developer", ["Three.js", "JavaScript", "SASS"]],
  ["Secureflare", "Zabbix-based web monitoring for LG U+", "Developer", ["PHP", "Docker", "Linux"]]
];

const STACK: [string, string[]][] = [
  ["AI Workflow", ["Claude Code", "Agentic Coding", "LLM APIs", "Prompt Engineering"]],
  ["Frontend", ["TypeScript", "React", "Vue", "Nuxt", "Three.js"]],
  ["Mobile", ["React Native", "Flutter", "iOS", "Android"]],
  ["Backend", ["Node.js", "GraphQL", "PostgreSQL", "Ruby on Rails", "Docker"]]
];

type SeedProject = {
  title: { en: string };
  company: { en: string };
  description: { en: string; ko: string };
  languages: string[];
  contribution: { en: string[]; ko: string[] };
  link?: string;
};

export async function seedIfEmpty() {
  const hasAny = await one("SELECT 1 FROM entries LIMIT 1");
  const hasProfile = await one("SELECT 1 FROM settings WHERE key = 'profile'");
  if (hasAny || hasProfile) return false;

  console.info("[seed] empty database: importing starter content");
  await setSetting("profile", PROFILE);
  await setSetting("github", { username: "ykdhan" });

  const entries: EntryInput[] = [];
  EXPERIENCE.forEach(([company, subtitle, role, tags], i) =>
    entries.push({
      kind: "experience",
      slug: `exp-${slugify(company)}`,
      title: company,
      subtitle,
      period: "",
      body: `Role: ${role}`,
      tags,
      links: [],
      visible: true,
      sort: i,
      source: "seed"
    })
  );

  const data = JSON.parse(
    readFileSync(new URL("../seed-data.json", import.meta.url), "utf8")
  ) as { projects: SeedProject[] };
  data.projects.forEach((p, i) =>
    entries.push({
      kind: "project",
      slug: slugify(p.title.en),
      title: p.title.en,
      subtitle: `${p.company.en} — ${p.description.en}`,
      period: "",
      body: [
        p.description.ko,
        "",
        ...p.contribution.en.map((c) => `- ${c}`),
        "",
        ...p.contribution.ko.map((c) => `- ${c}`)
      ].join("\n"),
      tags: p.languages,
      links: p.link ? [{ label: "Link", url: p.link }] : [],
      visible: true,
      sort: i,
      source: "seed"
    })
  );

  STACK.forEach(([group, items], i) =>
    entries.push({
      kind: "skill",
      slug: `stack-${slugify(group)}`,
      title: group,
      subtitle: "",
      period: "",
      body: items.join(", "),
      tags: items,
      links: [],
      visible: true,
      sort: i,
      source: "seed"
    })
  );

  entries.push(
    {
      kind: "education",
      slug: "taylor-university",
      title: "Taylor University",
      subtitle: "",
      period: "",
      body: "",
      tags: [],
      links: [],
      visible: true,
      sort: 0,
      source: "seed"
    },
    {
      kind: "award",
      slug: "awwwards-honorable-mention",
      title: "Awwwards Honorable Mention",
      subtitle: "Fave.kr",
      period: "",
      body: "",
      tags: ["Three.js"],
      links: [],
      visible: true,
      sort: 0,
      source: "seed"
    },
    {
      kind: "award",
      slug: "gsap-site-of-the-day",
      title: "GSAP Site of the Day",
      subtitle: "",
      period: "",
      body: "",
      tags: [],
      links: [],
      visible: true,
      sort: 1,
      source: "seed"
    }
  );

  for (const e of entries) await createEntry(e);
  await reindexAll();
  return true;
}

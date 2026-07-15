import type { Locale } from "../i18n/LocaleContext";

export const SITE = {
  name: "YK",
  hex: "0x594B", // "YK" in ASCII hex — the brand motif
  email: "ykdhan@gmail.com",
  github: "https://github.com/ykdhan",
  linkedin: "https://www.linkedin.com/in/ykdhan"
};

export interface WorkEntry {
  company: Record<Locale, string>;
  project: Record<Locale, string>;
  description: Record<Locale, string>;
  stack: string[];
  link?: string;
  tag?: Record<Locale, string>;
}

export const WORK: WorkEntry[] = [
  {
    company: { en: "Outschool", ko: "아웃스쿨" },
    project: { en: "Outschool", ko: "아웃스쿨" },
    description: {
      en: "Online learning platform for kids",
      ko: "어린이 온라인 학습 플랫폼"
    },
    stack: ["React", "TypeScript", "GraphQL", "PostgreSQL"],
    link: "https://outschool.com/"
  },
  {
    company: { en: "Plang", ko: "플랭" },
    project: { en: "Plang", ko: "플랭" },
    description: {
      en: "AI-driven English conversation app",
      ko: "AI 맞춤형 영어회화 앱"
    },
    stack: ["React Native", "TypeScript", "Ruby on Rails"],
    link: "https://apps.apple.com/us/app/id1384279650"
  },
  {
    company: { en: "feel.D", ko: "필디" },
    project: { en: "Markhub", ko: "마크헙" },
    description: {
      en: "Design collaboration & communication tool",
      ko: "디자인 협업 커뮤니케이션 툴"
    },
    stack: ["Flutter", "GraphQL", "Firebase"],
    link: "https://markhub.info/",
    tag: { en: "Freelance", ko: "프리랜스" }
  },
  {
    company: { en: "FLFI", ko: "플피" },
    project: { en: "OG.xyz · OG", ko: "OG.xyz · OG" },
    description: {
      en: "Crypto community & NFT curation app",
      ko: "암호화폐 커뮤니티 · NFT 큐레이션 앱"
    },
    stack: ["Vue", "Nuxt", "Flutter", "Web3"]
  },
  {
    company: { en: "Fave", ko: "페이브" },
    project: { en: "Galaxy Unpacked · Fave.kr", ko: "갤럭시 언팩 · Fave.kr" },
    description: {
      en: "Interactive campaign sites — AWWWARDS Honorable Mention",
      ko: "인터랙티브 캠페인 웹사이트 — AWWWARDS Honorable Mention"
    },
    stack: ["Three.js", "JavaScript", "SASS"],
    link: "https://fave.kr"
  },
  {
    company: { en: "Secureflare", ko: "시큐어플레어" },
    project: { en: "Web Monitoring", ko: "웹 모니터링" },
    description: {
      en: "Zabbix-based network monitoring for LG U+",
      ko: "Zabbix 기반 LG U+ 네트워크 모니터링"
    },
    stack: ["PHP", "Docker", "Linux"]
  }
];

export interface StackGroup {
  label: Record<Locale, string>;
  items: string[];
}

export const STACK_GROUPS: StackGroup[] = [
  {
    label: { en: "AI Workflow", ko: "AI 워크플로우" },
    items: ["Claude Code", "Agentic Coding", "LLM APIs", "Prompt Engineering"]
  },
  {
    label: { en: "Frontend", ko: "프론트엔드" },
    items: ["TypeScript", "React", "Vue · Nuxt", "Three.js"]
  },
  {
    label: { en: "Mobile", ko: "모바일" },
    items: ["React Native", "Flutter", "iOS · Android"]
  },
  {
    label: { en: "Backend", ko: "백엔드" },
    items: ["Node.js", "GraphQL", "PostgreSQL", "Ruby on Rails", "Docker"]
  }
];

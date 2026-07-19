import type { Locale } from "./LocaleContext";

type Dict = Record<Locale, string>;

export const SEO: Record<Locale, { title: string; description: string }> = {
  en: {
    title: "YK — AI-Native Fullstack Developer",
    description:
      "YK (Youngkwang Han) is a Seoul-based fullstack developer who maximizes AI to ship web, mobile, and backend products."
  },
  ko: {
    title: "YK — 풀스택 개발자",
    description:
      "YK(한영광)는 AI 활용을 극대화해 웹, 모바일, 백엔드 제품을 만드는 서울 기반 풀스택 개발자입니다."
  }
};

export const STRINGS: Record<string, Dict> = {
  // nav
  navAbout: { en: "About", ko: "소개" },
  navWork: { en: "Work", ko: "작업" },
  navStack: { en: "Stack", ko: "기술" },
  navContact: { en: "Contact", ko: "연락" },

  // hero
  heroKicker: { en: "FULLSTACK DEVELOPER", ko: "풀스택 개발자" },
  heroLine1: { en: "Human judgment,", ko: "사람의 판단," },
  heroLine2: { en: "machine speed.", ko: "기계의 속도." },
  heroSub: {
    en: "I'm YK — an AI-native fullstack developer shipping everything from pixels to infrastructure.",
    ko: "AI를 지렛대 삼아 화면부터 인프라까지 전부 만드는 풀스택 개발자 YK입니다."
  },
  heroCta: { en: "Get in touch", ko: "연락하기" },
  heroCta2: { en: "View work", ko: "작업 보기" },
  heroMeta1: {
    en: "FULLSTACK ENGINEER @ OUTSCHOOL",
    ko: "아웃스쿨 풀스택 엔지니어"
  },
  heroMeta2: { en: "BASED IN SEOUL", ko: "서울 베이스" },
  heroMeta3: {
    en: "AI-NATIVE · 10+ PROJECTS",
    ko: "AI 네이티브 · 10+ 프로젝트"
  },

  // about
  aboutLabel: { en: "ABOUT", ko: "소개" },
  aboutTitle: { en: "AI is my force multiplier.", ko: "AI는 가장 강력한 지렛대입니다." },
  aboutBody: {
    en: "My workflow runs on AI. Agents take the repetitive work; my time goes to architecture, tradeoffs, and the last 1% of polish.",
    ko: "업무는 AI 위에서 돌아갑니다. 반복 작업은 에이전트에게 맡기고, 저는 아키텍처와 트레이드오프, 마지막 1%의 완성도에 집중합니다."
  },
  aboutCard1Title: { en: "AI-Native Workflow", ko: "AI 네이티브 워크플로우" },
  aboutCard1Body: {
    en: "Agentic coding, automated review, generated tests — AI in every step of the loop.",
    ko: "에이전틱 코딩, 자동 리뷰, 테스트 생성 — 모든 단계에 AI를 녹입니다."
  },
  aboutCard2Title: { en: "Fullstack, End to End", ko: "풀스택, 처음부터 끝까지" },
  aboutCard2Body: {
    en: "Web, mobile, APIs, databases, deployment — one person, the whole product.",
    ko: "웹, 모바일, API, DB, 배포 — 혼자서도 제품 전체를 만듭니다."
  },
  aboutCard3Title: { en: "Craft & Detail", ko: "디테일에 진심" },
  aboutCard3Body: {
    en: "Obsessed with UX detail and performance. Users remember the details.",
    ko: "UX 디테일과 퍼포먼스에 집착합니다. 결국 기억에 남는 건 디테일이니까요."
  },
  aboutFact1: { en: "TAYLOR UNIVERSITY", ko: "테일러대학교" },
  aboutFact2: {
    en: "AWWWARDS HONORABLE MENTION",
    ko: "AWWWARDS HONORABLE MENTION"
  },
  aboutFact3: { en: "GSAP SITE OF THE DAY", ko: "GSAP SITE OF THE DAY" },

  // work
  workLabel: { en: "WORK", ko: "작업" },
  workTitle: { en: "Where I've shipped.", ko: "만들어 온 것들." },

  // stack
  stackLabel: { en: "STACK", ko: "기술" },
  stackTitle: { en: "Tools of choice.", ko: "쓰는 도구들." },

  // contact
  contactLabel: { en: "CONTACT", ko: "연락" },
  contactTitle: { en: "Let's build something.", ko: "같이 만들어요." },
  contactBody: {
    en: "Collabs, roles, or just a hello — my inbox is open.",
    ko: "협업이든 채용이든, 가벼운 인사도 좋습니다."
  },
  contactFormNote: {
    en: "Or leave a message here — it lands in my Slack right away.",
    ko: "여기에 메시지를 남기면 제 슬랙으로 바로 도착해요."
  },

  // contact form
  contactPlaceholder: { en: "Leave a quick message…", ko: "메시지를 남겨주세요…" },
  contactSend: { en: "Send", ko: "전송" },
  contactSending: { en: "Sending…", ko: "보내는 중…" },
  contactSent: { en: "Sent — I'll get back to you soon.", ko: "보냈어요! 곧 답장드릴게요." },
  contactError: {
    en: "Couldn't send — email me at ykdhan@gmail.com instead.",
    ko: "전송이 안 됐어요. ykdhan@gmail.com 으로 보내주세요."
  },

  // footer
  footerBuilt: { en: "Designed & built by YK × AI", ko: "YK × AI" },
  backTop: { en: "Back to top", ko: "맨 위로" }
};

export const useT = (locale: Locale) => (key: keyof typeof STRINGS) =>
  STRINGS[key]?.[locale] ?? key;

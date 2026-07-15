import type { Locale } from "./LocaleContext";

type Dict = Record<Locale, string>;

export const SEO: Record<Locale, { title: string; description: string }> = {
  en: {
    title: "YK — AI-Native Fullstack Developer",
    description:
      "YK (Youngkwang Han) is a fullstack developer who maximizes AI to ship web, mobile, and backend products effectively and efficiently."
  },
  ko: {
    title: "YK — AI 네이티브 풀스택 개발자",
    description:
      "YK(한영광)는 AI 활용을 극대화해 웹, 모바일, 백엔드 제품을 효과적이고 효율적으로 만드는 풀스택 개발자입니다."
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
    en: "I'm YK — a fullstack developer who maximizes AI to work effectively and efficiently, shipping everything from pixels to infrastructure.",
    ko: "AI 활용을 극대화해 효과적이고 효율적으로 일하는 풀스택 개발자 YK입니다. 화면부터 인프라까지 전부 직접 만듭니다."
  },
  heroCta: { en: "Get in touch", ko: "연락하기" },
  heroCta2: { en: "View work", ko: "작업 보기" },
  heroMeta1: { en: "10+ PROJECTS SHIPPED", ko: "10+ 프로젝트" },
  heroMeta2: { en: "WEB · MOBILE · BACKEND", ko: "웹 · 모바일 · 백엔드" },
  heroMeta3: { en: "AI-NATIVE WORKFLOW", ko: "AI 네이티브 워크플로우" },

  // about
  aboutLabel: { en: "ABOUT", ko: "소개" },
  aboutTitle: { en: "AI is my force multiplier.", ko: "AI는 가장 강력한 지렛대입니다." },
  aboutBody: {
    en: "I build my entire workflow around AI. Agentic tools take the repetitive work, so my time goes where humans matter most — architecture, tradeoffs, and the last 1% of polish.",
    ko: "업무 전체를 AI 중심으로 설계합니다. 반복적인 일은 에이전트에게 맡기고, 저는 사람의 판단이 가장 중요한 아키텍처, 트레이드오프, 그리고 마지막 1%의 완성도에 시간을 씁니다."
  },
  aboutCard1Title: { en: "AI-Native Workflow", ko: "AI 네이티브 워크플로우" },
  aboutCard1Body: {
    en: "Agentic coding, automated review, generated tests — AI runs through every step of my loop, multiplying output without cutting quality.",
    ko: "에이전틱 코딩, 자동 리뷰, 테스트 생성까지 — 업무의 모든 단계에 AI를 녹여 품질을 지키면서 생산성을 극대화합니다."
  },
  aboutCard2Title: { en: "Fullstack, End to End", ko: "풀스택, 처음부터 끝까지" },
  aboutCard2Body: {
    en: "Interface to infrastructure — web, mobile, APIs, databases, deployment. One person, the whole product.",
    ko: "화면부터 인프라까지 — 웹, 모바일, API, 데이터베이스, 배포. 혼자서도 제품 전체를 만듭니다."
  },
  aboutCard3Title: { en: "Craft & Detail", ko: "디테일에 진심" },
  aboutCard3Body: {
    en: "Obsessed with UX/UI detail and performance. The details users can't name are the ones they remember.",
    ko: "UX·UI 디테일과 퍼포먼스에 집착합니다. 사용자가 말로 설명하지 못하는 디테일이 가장 오래 기억에 남습니다."
  },

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
  footerBuilt: { en: "Designed & built by YK × AI", ko: "YK × AI가 만들었습니다" },
  backTop: { en: "Back to top", ko: "맨 위로" }
};

export const useT = (locale: Locale) => (key: keyof typeof STRINGS) =>
  STRINGS[key]?.[locale] ?? key;

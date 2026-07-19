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
  heroLine1: { en: "Broad architecture,", ko: "폭넓은 아키텍처," },
  heroLine2: { en: "fast, precise execution.", ko: "빠르고 정확한 실행." },
  heroSub: {
    en: "I'm YK, a fullstack developer. From system design across web, mobile, and backend to meticulous implementation — I deliver solutions fast.",
    ko: "풀스택 개발자 YK입니다. 웹·모바일·백엔드를 아우르는 설계부터 꼼꼼한 구현까지, 솔루션을 빠르게 제공합니다."
  },
  heroCta: { en: "Get in touch", ko: "연락하기" },
  heroCta2: { en: "View work", ko: "작업 보기" },
  heroMeta1: { en: "WEB · MOBILE · BACKEND", ko: "웹 · 모바일 · 백엔드" },
  heroMeta2: { en: "BASED IN THE UNIVERSE", ko: "우주 베이스" },
  heroMeta3: { en: "AI-NATIVE WORKFLOW", ko: "AI 네이티브 워크플로우" },

  // about
  aboutLabel: { en: "ABOUT", ko: "소개" },
  aboutTitle: { en: "How I work.", ko: "일하는 방식." },
  aboutBody: {
    en: "I start from architecture, keep the details tight, and use AI tooling to deliver fast without cutting quality.",
    ko: "아키텍처 설계에서 출발해 디테일을 놓치지 않고, AI 툴링으로 품질을 지키면서 빠르게 결과를 만듭니다."
  },
  aboutCard1Title: { en: "Architecture", ko: "아키텍처" },
  aboutCard1Body: {
    en: "System design across web, mobile, and backend — structures that scale and adapt.",
    ko: "웹·모바일·백엔드를 아우르는 시스템 설계. 확장과 변화에 강한 구조를 만듭니다."
  },
  aboutCard2Title: { en: "Precision", ko: "꼼꼼함" },
  aboutCard2Body: {
    en: "Reviews, tests, edge cases — problems caught before they ship.",
    ko: "리뷰, 테스트, 엣지 케이스까지. 문제는 배포 전에 잡습니다."
  },
  aboutCard3Title: { en: "Speed", ko: "속도" },
  aboutCard3Body: {
    en: "An AI-native workflow that turns requirements into working solutions, fast.",
    ko: "요구사항을 동작하는 솔루션으로 빠르게 구현합니다. AI 네이티브 워크플로우가 속도를 만듭니다."
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

import { Locale } from "./LocaleContext";

type Dict = Record<Locale, string>;

export const STRINGS: Record<string, Dict> = {
  role: { ko: "풀스택 개발자", en: "Fullstack Developer" },
  nameFull: { ko: "한영광", en: "Youngkwang Han" },

  // hero
  heroKicker: { ko: "포트폴리오 · 2024", en: "Portfolio · 2024" },
  heroLede: {
    ko: "사람들에게 *즐거움*을 주고 오래 *기억에 남는* 서비스를 만듭니다. 보이는 화면부터 보이지 않는 서버까지, 끝에서 끝까지 직접 짓습니다.",
    en: "I build products people *enjoy* and *remember* — from the pixels on screen to the servers behind them, end to end."
  },
  heroBased: { ko: "거점 / 서울 · 원격", en: "Based / Seoul · Remote" },
  heroOpen: { ko: "상태 / 협업 가능", en: "Status / Open to work" },
  scrollCue: { ko: "스크롤", en: "Scroll" },

  // about
  aboutEyebrow: { ko: "소개 / 누구냐면", en: "About / who's this" },
  aboutTitle: { ko: "코드로\n분위기를\n만든다", en: "Building\nthe vibe\nwith code" },
  aboutCardTitle: { ko: "// 기본 정보", en: "// the basics" },
  factRole: { ko: "역할", en: "Role" },
  factFocus: { ko: "관심", en: "Focus" },
  factFocusVal: { ko: "UX · UI · 퍼포먼스", en: "UX · UI · Performance" },
  factStack: { ko: "주력", en: "Stack" },
  factStackVal: { ko: "React · TS · Node", en: "React · TS · Node" },
  factMail: { ko: "연락", en: "Contact" },

  // skills
  skillsEyebrow: { ko: "기술 / 연장통", en: "Stack / the toolbox" },
  skillsTitle: { ko: "쓰는 도구들", en: "Tools of\nthe trade" },
  skillsNote: {
    ko: "새로운 기술이라도 *빠르게 익혀* 현업에 적용합니다. 노트북에 붙은 스티커처럼 늘어나는 중.",
    en: "I pick up new tools *fast* and ship with them. The sticker collection keeps growing."
  },

  // projects
  worksEyebrow: { ko: "작업 / 골목 전시", en: "Selected work / the wall" },
  worksTitle: { ko: "만든 것들", en: "Things\nI've shipped" },
  featured: { ko: "추천작", en: "Featured" },
  viewLive: { ko: "보러가기", en: "View live" },
  file: { ko: "파일", en: "File" },

  // footer
  footerEyebrow: { ko: "연락 / 한 잔 하면서", en: "Contact / let's talk" },
  footerCta: { ko: "재밌는 거\n같이\n만들어요", en: "Let's make\nsomething\nloud" },
  footerNote: {
    ko: "협업, 채용, 그냥 인사도 환영이에요. *메일 주세요.*",
    en: "Collabs, gigs, or just a hello — *drop me a line.*"
  },
  backTop: { ko: "맨 위로", en: "Back to top" },
  rights: { ko: "전부 직접 만듦", en: "Handmade, all of it" },

  // contact form
  contactPlaceholder: { ko: "메시지를 남겨주세요…", en: "Leave a quick message…" },
  contactSend: { ko: "전송", en: "Send" },
  contactSending: { ko: "보내는 중…", en: "Sending…" },
  contactSent: { ko: "보냈어요! 곧 답장할게요 ✦", en: "Sent! I'll get back to you ✦" },
  contactError: {
    ko: "전송이 안 됐어요. ykdhan@gmail.com 으로 부탁드려요.",
    en: "Couldn't send — email me at ykdhan@gmail.com instead."
  }
};

export const useT = (locale: Locale) => (key: keyof typeof STRINGS) =>
  STRINGS[key]?.[locale] ?? key;

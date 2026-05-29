import { Locale } from "./LocaleContext";

type Dict = Record<Locale, string>;

export const STRINGS: Record<string, Dict> = {
  role: { ko: "풀스택 개발자", en: "Fullstack Developer" },
  nameFull: { ko: "한영광", en: "Youngkwang Han" },

  // hero  (year is injected at runtime, name is appended in the component)
  heroKicker: { ko: "포트폴리오", en: "Portfolio" },
  heroLede: {
    ko: "쓰는 사람이 *즐겁고*, 오래 *기억에 남는* 서비스를 만듭니다. 눈에 보이는 화면부터 뒤에서 돌아가는 서버까지, 처음부터 끝까지 직접 만듭니다.",
    en: "I build products people *enjoy* and *remember* — from the pixels on screen to the servers behind them, end to end."
  },
  heroBased: { ko: "거점 / 원격", en: "Based / Remote" },
  scrollCue: { ko: "스크롤", en: "Scroll" },

  // about
  aboutEyebrow: { ko: "소개 / 누구냐면", en: "About / who's this" },
  aboutTitle: { ko: "코드로\n분위기를\n만든다", en: "Building\nthe vibe\nwith code" },
  aboutCardTitle: { ko: "// 기본 정보", en: "// the basics" },
  factRole: { ko: "역할", en: "Role" },
  factFocus: { ko: "관심사", en: "Focus" },
  factFocusVal: { ko: "UX · UI · 퍼포먼스", en: "UX · UI · Performance" },
  factStack: { ko: "주력", en: "Stack" },
  factStackVal: { ko: "React · TS · Node", en: "React · TS · Node" },
  factMail: { ko: "연락처", en: "Contact" },

  // skills
  skillsEyebrow: { ko: "기술 / 연장통", en: "Stack / the toolbox" },
  skillsTitle: { ko: "쓰는 도구들", en: "Tools of\nthe trade" },
  skillsNote: {
    ko: "처음 보는 기술도 *빠르게 익혀서* 바로 실무에 씁니다. 노트북에 붙는 스티커처럼 계속 늘어나는 중.",
    en: "I pick up new tools *fast* and ship with them. The sticker collection keeps growing."
  },

  // projects
  worksEyebrow: { ko: "작업 / 골목 전시", en: "Selected work / the wall" },
  worksTitle: { ko: "만든 것들", en: "Things\nI've shipped" },
  featured: { ko: "대표작", en: "Featured" },
  viewLive: { ko: "보러가기", en: "View live" },
  file: { ko: "프로젝트", en: "PROJECT" },

  // footer
  footerEyebrow: { ko: "연락 / 한 잔 하면서", en: "Contact / let's talk" },
  footerCta: { ko: "재밌는 거\n같이\n만들어요", en: "Let's make\nsomething\nloud" },
  footerNote: {
    ko: "협업이든 채용이든, 그냥 인사라도 좋아요. 아래에 *한 줄 남겨주세요.*",
    en: "Collabs, gigs, or just a hello — *drop me a line.*"
  },
  backTop: { ko: "맨 위로", en: "Back to top" },

  // contact form
  contactPlaceholder: { ko: "메시지를 남겨주세요…", en: "Leave a quick message…" },
  contactSend: { ko: "전송", en: "Send" },
  contactSending: { ko: "보내는 중…", en: "Sending…" },
  contactSent: { ko: "보냈어요! 곧 답장드릴게요 ✦", en: "Sent! I'll get back to you ✦" },
  contactError: {
    ko: "전송이 안 됐어요. ykdhan@gmail.com 으로 보내주세요.",
    en: "Couldn't send — email me at ykdhan@gmail.com instead."
  }
};

export const useT = (locale: Locale) => (key: keyof typeof STRINGS) =>
  STRINGS[key]?.[locale] ?? key;

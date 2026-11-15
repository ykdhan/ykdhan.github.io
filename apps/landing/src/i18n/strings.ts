import type { Locale } from "./LocaleContext";

export const SEO: Record<Locale, { title: string; description: string }> = {
  en: {
    title: "YK — Ralph",
    description:
      "Ask Ralph, the AI assistant of YK (Youngkwang Han), a Seoul-based fullstack developer shipping web, mobile, and backend products."
  },
  ko: {
    title: "YK — Ralph",
    description: "서울 기반 풀스택 개발자 YK(한영광)의 AI 비서 Ralph에게 무엇이든 물어보세요."
  }
};

const S = {
  placeholder: { en: "type a question, or a number", ko: "질문을 입력하거나 번호를 누르세요" },
  voiceOn: { en: "VOICE:ON", ko: "음성:켬" },
  voiceOff: { en: "VOICE:OFF", ko: "음성:끔" },
  contact: { en: "Contact", ko: "연락처" },
  stack: { en: "Stack", ko: "기술 스택" },
  forwarded: { en: "*** QUESTION FORWARDED TO YK ***", ko: "*** 질문을 YK에게 전달했습니다 ***" },
  sent: { en: "*** MESSAGE DELIVERED TO YK ***", ko: "*** 메시지를 YK에게 전달했습니다 ***" },
  rateLimited: {
    en: "Too many questions at once. Give me a minute to cool down.",
    ko: "질문이 너무 많았어요. 1분만 식히고 다시 물어봐 주세요."
  },
  offline: {
    en: "My link to the server is down. You can still reach YK directly:",
    ko: "지금은 서버와 연결이 끊겼어요. YK에게 직접 연락하실 수 있어요:"
  },
  menu: { en: "QUICK MENU", ko: "빠른 메뉴" },
  help: {
    en: "Ask anything about YK in plain words. Commands: HELP, CLS (clear), LANG KO|EN, VOICE.",
    ko: "YK에 대해 편하게 물어보세요. 명령어: HELP, CLS(화면 지우기), LANG KO|EN, VOICE."
  },
  bootMemory: { en: "MEMORY TEST ........... 640K OK", ko: "메모리 검사 ........... 640K OK" },
  bootProfile: { en: "LOADING PROFILE: YK ...", ko: "프로필 불러오는 중: YK ..." },
  bootOk: { en: "OK", ko: "OK" },
  bootFail: { en: "OFFLINE (local mode)", ko: "오프라인 (로컬 모드)" }
} satisfies Record<string, Record<Locale, string>>;

export type StringKey = keyof typeof S;
export const t = (locale: Locale, key: StringKey) => S[key][locale];

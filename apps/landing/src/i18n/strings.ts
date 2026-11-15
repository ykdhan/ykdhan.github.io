import type { Locale } from "./LocaleContext";

export const SEO: Record<Locale, { title: string; description: string }> = {
  en: {
    title: "YK — AI-Native Fullstack Developer",
    description:
      "Talk to K.A.I., the AI assistant of YK (Youngkwang Han), a Seoul-based fullstack developer shipping web, mobile, and backend products."
  },
  ko: {
    title: "YK — 풀스택 개발자",
    description:
      "서울 기반 풀스택 개발자 YK(한영광)의 AI 비서 K.A.I.에게 무엇이든 물어보세요."
  }
};

const S = {
  placeholder: { en: "Ask anything about YK…", ko: "YK에 대해 무엇이든 물어보세요…" },
  send: { en: "Send", ko: "전송" },
  voiceOn: { en: "Voice on", ko: "음성 켜짐" },
  voiceOff: { en: "Voice off", ko: "음성 꺼짐" },
  close: { en: "Close", ko: "닫기" },
  contact: { en: "Contact", ko: "연락처" },
  stack: { en: "Stack", ko: "기술 스택" },
  forwarded: { en: "Question forwarded to YK", ko: "질문을 YK에게 전달했어요" },
  sent: { en: "Message delivered to YK", ko: "메시지를 YK에게 전달했어요" },
  rateLimited: {
    en: "I need a short break. Too many questions at once. Try again in a minute.",
    ko: "잠시 숨 좀 돌릴게요. 질문이 너무 많았어요. 1분 뒤에 다시 물어봐 주세요."
  },
  offline: {
    en: "My main core is offline right now. You can still reach YK directly. The details are beside me.",
    ko: "지금은 메인 코어가 잠시 오프라인이에요. 옆의 연락처로 YK에게 직접 연락하실 수 있어요."
  },
  skip: { en: "Skip", ko: "건너뛰기" }
} satisfies Record<string, Record<Locale, string>>;

export type StringKey = keyof typeof S;
export const t = (locale: Locale, key: StringKey) => S[key][locale];

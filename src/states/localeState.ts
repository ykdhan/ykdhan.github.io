import { atom } from "recoil";

export enum Locale {
  KO = "ko",
  EN = "en"
}

export const localeState = atom<Locale>({
  key: "locale",
  default: Locale.EN
});

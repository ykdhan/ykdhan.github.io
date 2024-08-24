import { atom } from "recoil";

export interface AppState {
  width: number;
  height: number;
  isMobile: boolean;
  darkmode: boolean;
}

export const appState = atom<AppState>({
  key: "app",
  default: {
    width: 0,
    height: 0,
    isMobile: false,
    darkmode: false
  }
});

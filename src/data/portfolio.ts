import RAW from "../../DATA.json";
import type { Locale } from "../i18n/LocaleContext";

export interface MediaItem {
  type: "image" | "video";
  source: string;
}

export interface Project {
  company: Record<Locale, string>;
  title: Record<Locale, string>;
  description: Record<Locale, string>;
  languages: string[];
  contribution: Record<Locale, string[]>;
  link?: string;
  color?: string;
  popular?: boolean;
  tags?: string[];
  mediaDirection?: "horizontal" | "vertical";
  media: MediaItem[];
}

export interface Introduction {
  ko: string[];
  en: string[];
}

export const introduction = RAW.introduction as Introduction;
export const projects = RAW.projects as unknown as Project[];

// every distinct tech, in first-appearance order
export const allTech: string[] = Array.from(
  new Set(projects.flatMap((p) => p.languages))
);

export const SITE = {
  email: "ykdhan@gmail.com",
  github: "https://github.com/ykdhan",
  name: { ko: "한영광", en: "YK" } as Record<Locale, string>
};

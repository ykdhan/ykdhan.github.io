import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { SEO } from "./strings";

export type Locale = "en" | "ko";

interface LocaleCtx {
  locale: Locale;
  setLocale: (l: Locale) => void;
  toggle: () => void;
}

const Ctx = createContext<LocaleCtx | null>(null);

const STORAGE_KEY = "yk.locale";

function detectInitial(): Locale {
  if (typeof window === "undefined") return "en";
  // ?lang= wins so the hreflang-alternate URLs render the right language.
  const param = new URLSearchParams(window.location.search).get("lang");
  if (param === "ko" || param === "en") return param;
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === "ko" || saved === "en") return saved;
  return "en";
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(detectInitial);

  useEffect(() => {
    document.documentElement.lang = locale;
    window.localStorage.setItem(STORAGE_KEY, locale);

    document.title = SEO[locale].title;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", SEO[locale].description);

    // Keep the URL in sync with the hreflang alternates (en is the bare URL).
    const url = new URL(window.location.href);
    if (locale === "ko") url.searchParams.set("lang", "ko");
    else url.searchParams.delete("lang");
    window.history.replaceState(null, "", url);
  }, [locale]);

  const value = useMemo<LocaleCtx>(
    () => ({
      locale,
      setLocale: setLocaleState,
      toggle: () => setLocaleState((p) => (p === "ko" ? "en" : "ko"))
    }),
    [locale]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLocale(): LocaleCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}

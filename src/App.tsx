import { useSmoothScroll } from "./hooks/useSmoothScroll";
import { useLocale } from "./i18n/LocaleContext";
import Grain from "./components/Grain";
import ScrollProgress from "./components/ScrollProgress";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Marquee from "./components/Marquee";
import About from "./components/About";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import Footer from "./components/Footer";

export default function App() {
  useSmoothScroll();
  const { locale } = useLocale();

  const ticker =
    locale === "ko"
      ? ["풀스택 개발자", "웹", "모바일", "UX · UI", "React", "TypeScript", "끝까지 책임지는"]
      : ["Fullstack Developer", "Web", "Mobile", "UX · UI", "React", "TypeScript", "End to end"];

  return (
    <>
      <Grain />
      <ScrollProgress />
      <Nav />
      <div className="app">
        <Hero />
        <Marquee items={ticker} duration="30s" />
        <About />
        <Skills />
        <Projects />
        <Footer />
      </div>
    </>
  );
}

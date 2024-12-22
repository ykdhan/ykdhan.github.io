import "./assets/scss/common.scss";
import { useEffect, useRef } from "react";
import Header from "./components/Header";
import Project from "./components/Project";
import DATA from "../DATA.json";
import { appState } from "./states/appState";
import { localeState } from "./states/localeState";
import { useRecoilState } from "recoil";
import Page from "./components/general/Page";
import Text from "./components/general/Text";
import Section from "./components/Section";
import Cover from "./components/Cover";
import Footer from "./components/Footer";

function App() {
  const [app, setApp] = useRecoilState(appState);
  const [locale] = useRecoilState(localeState);
  const resizeTimeout = useRef(0);

  useEffect(() => {
    onResize();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const onScroll = () => {};

  const onResize = () => {
    clearTimeout(resizeTimeout.current);
    resizeTimeout.current = setTimeout(
      () =>
        setApp((prev) => ({
          ...prev,
          width: window.innerWidth,
          height: window.innerHeight,
          isMobile: window.innerWidth < 800
        })),
      200
    );
  };

  return (
    <Page>
      <Header />
      <Section
        innerStyle={{ display: "flex", flexDirection: "column", gap: 8 }}
      >
        {DATA.introduction[locale].map((item, i) => (
          <Text key={i} style={{ fontSize: app.isMobile ? 16 : 18 }}>
            {item}
          </Text>
        ))}
      </Section>
      <Section
        style={{
          paddingTop: app.isMobile ? 64 : 80,
          paddingBottom: app.isMobile ? 64 : 80
        }}
        innerStyle={{
          display: "flex",
          flexDirection: "column",
          gap: app.isMobile ? 64 : 80,
          listStyle: "none"
        }}
      >
        {DATA.projects.map((project, index) => (
          <Project
            key={index}
            company={project.company[locale]}
            title={project.title[locale]}
            description={project.description[locale]}
            languages={project.languages}
            contribution={project.contribution[locale]}
            link={project.link}
            media={project.media}
            mediaDirection={project.mediaDirection}
          />
        ))}
      </Section>
      <Footer />
      <Cover />
    </Page>
  );
}

export default App;

import "./assets/scss/common.scss";
import Header from "./components/Header.tsx";
import Project from "./components/Project.tsx";
import DATA from "../DATA.json";
import {Fragment, useEffect, useRef, useState} from "react";
import { appState } from "./states/appState";
import { useRecoilState } from "recoil";
import Cover from "./components/Cover.tsx";

const OFFSET = 24;

function App() {
  const [_, setApp] = useRecoilState(appState);
  const [show, setShow] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const resizeTimeout = useRef(0);

  useEffect(() => {
    onResize();
    setTimeout(() => setShow(true), 1000);
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
    }
  }, []);

  const onResize = () => {
    clearTimeout(resizeTimeout.current);
    resizeTimeout.current = setTimeout(
      () =>
        setApp((prev) => ({
          ...prev,
          width: window.innerWidth,
          height: window.innerHeight,
          isMobile: window.innerWidth < 800,
        })),
      200,
    );
  };

  const onScroll = (e: Event) => {
    const scrollTop = (e.target as Document).documentElement.scrollTop;
    setScrolled(scrollTop > OFFSET);
  }

  return (
    <>
      {!show && <Cover />}
      <Header size={scrolled ? 'small' : 'normal'} />
      <main
        style={{
          padding: "24px 0",
        }}
      >
        <ul
          id="projects"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 24,
            listStyle: "none",
          }}
        >
          {DATA.projects.map((project, index) => (
            <Fragment key={index}>
              <Project
                key={index}
                company={project.company}
                title={project.title}
                description={project.description}
                languages={project.languages}
                link={project.link}
                media={project.media}
                mediaDirection={project.mediaDirection}
              />
            </Fragment>
          ))}
        </ul>
      </main>
    </>
  );
}

export default App;

import "./assets/scss/common.scss";
import Header from "./features/header/components/Header";
import Project from "./features/project/components/Project";
import DATA from "../DATA.json";
import { FONT } from "./features/app/fonts";
import { useEffect, useRef, useState } from "react";
import { appState } from "./features/app/states/appState";
import { useRecoilState } from "recoil";
import Cover from "./features/cover/components/Cover";

function App() {
  const [app, setApp] = useRecoilState(appState);
  const [show, setShow] = useState(false);
  const resizeTimeout = useRef(0);

  useEffect(() => {
    onResize();
    setTimeout(() => setShow(true), 1000);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const onResize = () => {
    clearTimeout(resizeTimeout.current);
    resizeTimeout.current = setTimeout(
      () =>
        setApp((app) => ({
          ...app,
          width: window.innerWidth,
          height: window.innerHeight,
          isMobile: window.innerWidth < 800,
        })),
      200,
    );
  };

  return (
    <>
      {!show && <Cover />}
      <Header />
      <main
        style={{
          padding: "24px 0",
        }}
      >
        <h2
          style={{
            fontFamily: FONT.Regular,
            fontSize: 16,
            marginBottom: 16,
          }}
        >
          Projects
        </h2>
        <ul
          id="projects"
          style={{
            display: "grid",
            gridTemplateColumns: app.isMobile ? "1fr" : "1fr 1fr",
            columnGap: 10,
            rowGap: 12,
            listStyle: "none",
          }}
        >
          {DATA.projects.map((project, index) => (
            <Project
              key={index}
              title={project.company + "/" + project.title}
              description={project.description}
              languages={project.languages}
              tags={project.tags}
              link={project.link}
            />
          ))}
        </ul>
      </main>
    </>
  );
}

export default App;

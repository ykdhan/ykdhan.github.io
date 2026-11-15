import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import CoreDemo from "./hud/CoreDemo";
import { LocaleProvider } from "./i18n/LocaleContext";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {new URLSearchParams(window.location.search).has("core") ? (
      <CoreDemo />
    ) : (
      <LocaleProvider>
        <App />
      </LocaleProvider>
    )}
  </React.StrictMode>
);

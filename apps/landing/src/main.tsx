import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import AvatarDemo from "./hud/AvatarDemo";
import { LocaleProvider } from "./i18n/LocaleContext";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {new URLSearchParams(window.location.search).has("avatar") ? (
      <AvatarDemo />
    ) : (
      <LocaleProvider>
        <App />
      </LocaleProvider>
    )}
  </React.StrictMode>
);

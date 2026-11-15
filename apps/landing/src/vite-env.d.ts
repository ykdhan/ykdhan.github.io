/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the API server, e.g. https://api.example.com */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Slack incoming webhook URL used by the footer contact form. */
  readonly VITE_SLACK_WEBHOOK_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

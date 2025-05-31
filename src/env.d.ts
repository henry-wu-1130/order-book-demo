/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WS_BASE_URL: string;
  readonly VITE_WS_FUTURES_PATH: string;
  readonly VITE_WS_OSS_FUTURES_PATH: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

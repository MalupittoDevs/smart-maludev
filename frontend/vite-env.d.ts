/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string; // opcional si no siempre la defines
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

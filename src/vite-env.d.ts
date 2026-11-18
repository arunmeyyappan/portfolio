/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Backend base URL ending in /api, e.g. https://your-portfolio-api.onrender.com/api */
  readonly VITE_API_URL?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

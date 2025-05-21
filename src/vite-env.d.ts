/// <reference types="vite/client" />


interface ImportMetaEnv {
  VITE_APP_NAME: string
  VITE_APP_URL: string
  VITE_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE_URL: string
  // más variables de entorno pueden agregarse aquí
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

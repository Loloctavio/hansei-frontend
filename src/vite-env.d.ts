/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MODO_DATOS?: 'local' | 'api'
  readonly VITE_API_URL?: string
  readonly VITE_TOKEN_ALMACEN?: 'local' | 'sesion' | 'memoria'
  readonly VITE_AUTH_COOKIES?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

/* config.ts — un solo lugar donde se leen las variables de entorno.
 *
 * Ningun otro modulo toca import.meta.env. Asi el dia que cambie el nombre de
 * una variable, o que el backend cambie de contrato, se ajusta aqui.
 */

export type ModoDatos = 'local' | 'api'
export type AlmacenToken = 'local' | 'sesion' | 'memoria'

function texto(valor: string | undefined, porDefecto: string): string {
  const limpio = (valor ?? '').trim()
  return limpio.length > 0 ? limpio : porDefecto
}

function booleano(valor: string | undefined, porDefecto: boolean): boolean {
  const limpio = (valor ?? '').trim().toLowerCase()
  if (limpio === '') return porDefecto
  return limpio === 'true' || limpio === '1' || limpio === 'si'
}

const modoCrudo = texto(import.meta.env.VITE_MODO_DATOS, 'local')
const almacenCrudo = texto(import.meta.env.VITE_TOKEN_ALMACEN, 'local')

export const config = {
  /** De donde salen los datos: localStorage o el backend HTTP. */
  modo: (modoCrudo === 'api' ? 'api' : 'local') as ModoDatos,

  /** URL base del backend, siempre sin diagonal final. */
  apiUrl: texto(import.meta.env.VITE_API_URL, 'http://localhost:8080').replace(/\/+$/, ''),

  /** Donde persiste el token de sesion. */
  almacenToken: (['local', 'sesion', 'memoria'].includes(almacenCrudo)
    ? almacenCrudo
    : 'local') as AlmacenToken,

  /** El backend maneja la sesion con cookies httpOnly en vez de un token. */
  authCookies: booleano(import.meta.env.VITE_AUTH_COOKIES, false),

  /** true cuando corre `vite build`. Util para no loguear ruido en produccion. */
  produccion: import.meta.env.PROD,
} as const

/** Atajo legible: la app habla con un backend real. */
export const usaApi = config.modo === 'api'

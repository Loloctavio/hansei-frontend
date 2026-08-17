/* almacenToken.ts — dónde vive el token de sesión.
 *
 * El modo se elige con VITE_TOKEN_ALMACEN. 'memoria' es el más seguro frente a
 * XSS pero obliga a volver a entrar en cada recarga; 'local' es el más cómodo.
 * Si el backend usa cookies httpOnly no hay token que guardar y esto queda
 * inerte: `leer()` siempre devuelve null.
 */

import { config } from '@/config'

const CLAVE = 'kaizen:token'

let enMemoria: string | null = null

function almacen(): Storage | null {
  if (config.almacenToken === 'memoria' || config.authCookies) return null
  try {
    const s = config.almacenToken === 'sesion' ? window.sessionStorage : window.localStorage
    // Navegar en modo privado puede lanzar al escribir, no al leer.
    s.setItem('kaizen:prueba', '1')
    s.removeItem('kaizen:prueba')
    return s
  } catch {
    return null
  }
}

function leer(): string | null {
  if (config.authCookies) return null
  const s = almacen()
  if (!s) return enMemoria
  return s.getItem(CLAVE)
}

function guardar(token: string | null): void {
  if (config.authCookies) return
  enMemoria = token
  const s = almacen()
  if (!s) return
  if (token) s.setItem(CLAVE, token)
  else s.removeItem(CLAVE)
}

export const almacenToken = {
  leer,
  guardar,
  limpiar: () => guardar(null),
}

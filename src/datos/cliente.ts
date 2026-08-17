/* cliente.ts — el único punto por donde el frontend habla HTTP.
 *
 * Centraliza URL base, cabecera de autorización, parseo de errores y el manejo
 * del 401. Ningún componente llama a fetch directamente: así el día que el
 * backend cambie el formato de sus errores se ajusta un solo archivo.
 */

import { config } from '@/config'
import { almacenToken } from './almacenToken'

/** Error de API con la información que la interfaz necesita para reaccionar. */
export class ErrorApi extends Error {
  /** Código HTTP. 0 cuando ni siquiera se pudo alcanzar el servidor. */
  readonly status: number
  /** Código de negocio que manda el backend, si lo manda. */
  readonly codigo: string | null
  /** Errores por campo, para pintarlos junto al input que los causó. */
  readonly campos: Record<string, string> | null

  constructor(
    mensaje: string,
    status: number,
    codigo: string | null = null,
    campos: Record<string, string> | null = null,
  ) {
    super(mensaje)
    this.name = 'ErrorApi'
    this.status = status
    this.codigo = codigo
    this.campos = campos
  }

  get esRed(): boolean {
    return this.status === 0
  }

  get esAuth(): boolean {
    return this.status === 401 || this.status === 403
  }
}

/* ---------- aviso de sesión vencida ---------- */

type Escucha = () => void
const alPerderSesion = new Set<Escucha>()

/** El contexto de auth se suscribe aquí para cerrar sesión cuando el backend
 *  responde 401 en cualquier llamada, no solo en las de login. */
export function suscribirSesionVencida(fn: Escucha): () => void {
  alPerderSesion.add(fn)
  return () => alPerderSesion.delete(fn)
}

/* ---------- parseo de la respuesta ---------- */

interface CuerpoError {
  error?: string | { codigo?: string; mensaje?: string; campos?: Record<string, string> }
  mensaje?: string
  message?: string
  codigo?: string
  campos?: Record<string, string>
}

function mensajePorDefecto(status: number): string {
  if (status === 400) return 'Los datos enviados no son válidos.'
  if (status === 401) return 'Tu sesión expiró. Vuelve a entrar.'
  if (status === 403) return 'No tienes permiso para hacer eso.'
  if (status === 404) return 'Eso ya no existe.'
  if (status === 409) return 'Ese registro ya existe.'
  if (status === 429) return 'Demasiados intentos. Espera un momento.'
  if (status >= 500) return 'El servidor tuvo un problema. Intenta de nuevo.'
  return 'La petición no se pudo completar.'
}

async function comoError(res: Response): Promise<ErrorApi> {
  let cuerpo: CuerpoError | null = null
  try {
    cuerpo = (await res.json()) as CuerpoError
  } catch {
    // Respuesta sin JSON: nos quedamos con el mensaje genérico.
  }

  const anidado = typeof cuerpo?.error === 'object' ? cuerpo.error : null
  const mensaje =
    anidado?.mensaje ??
    (typeof cuerpo?.error === 'string' ? cuerpo.error : undefined) ??
    cuerpo?.mensaje ??
    cuerpo?.message ??
    mensajePorDefecto(res.status)

  return new ErrorApi(
    mensaje,
    res.status,
    anidado?.codigo ?? cuerpo?.codigo ?? null,
    anidado?.campos ?? cuerpo?.campos ?? null,
  )
}

/* ---------- la petición ---------- */

type Metodo = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'

interface Opciones {
  /** No adjuntar el token. Solo para login y registro. */
  publico?: boolean
  abortar?: AbortSignal
}

async function peticion<T>(
  metodo: Metodo,
  ruta: string,
  cuerpo?: unknown,
  opciones: Opciones = {},
): Promise<T> {
  const cabeceras: Record<string, string> = { Accept: 'application/json' }
  if (cuerpo !== undefined) cabeceras['Content-Type'] = 'application/json'

  if (!opciones.publico) {
    const token = almacenToken.leer()
    if (token) cabeceras.Authorization = `Bearer ${token}`
  }

  let res: Response
  try {
    res = await fetch(`${config.apiUrl}${ruta}`, {
      method: metodo,
      headers: cabeceras,
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
      // Necesario cuando el backend maneja la sesión con cookies httpOnly.
      credentials: config.authCookies ? 'include' : 'same-origin',
      signal: opciones.abortar,
    })
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') throw e
    throw new ErrorApi(
      `No se pudo conectar con el servidor en ${config.apiUrl}. ` +
        'Revisa que el backend esté corriendo y que VITE_API_URL apunte a él.',
      0,
    )
  }

  if (res.status === 401 && !opciones.publico) {
    almacenToken.limpiar()
    alPerderSesion.forEach((fn) => fn())
  }

  if (!res.ok) throw await comoError(res)

  if (res.status === 204) return undefined as T
  const texto = await res.text()
  if (!texto) return undefined as T
  return JSON.parse(texto) as T
}

export const cliente = {
  get: <T>(ruta: string, opciones?: Opciones) => peticion<T>('GET', ruta, undefined, opciones),
  post: <T>(ruta: string, cuerpo?: unknown, opciones?: Opciones) =>
    peticion<T>('POST', ruta, cuerpo, opciones),
  patch: <T>(ruta: string, cuerpo?: unknown, opciones?: Opciones) =>
    peticion<T>('PATCH', ruta, cuerpo, opciones),
  put: <T>(ruta: string, cuerpo?: unknown, opciones?: Opciones) =>
    peticion<T>('PUT', ruta, cuerpo, opciones),
  delete: <T>(ruta: string, opciones?: Opciones) =>
    peticion<T>('DELETE', ruta, undefined, opciones),
}

/** Traduce cualquier excepción a un mensaje que se le puede mostrar al usuario. */
export function mensajeDeError(e: unknown): string {
  if (e instanceof ErrorApi) return e.message
  if (e instanceof Error) return e.message
  return 'Algo salió mal.'
}

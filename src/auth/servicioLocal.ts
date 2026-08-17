/* servicioLocal.ts — "cuenta" local, para poder usar la app sin backend.
 *
 * Deliberadamente no guarda contraseñas. Cualquier cosa en localStorage la lee
 * quien tenga la máquina, así que una contraseña ahí no protegería nada y sería
 * un patrón malo de heredar. En este modo el perfil solo sirve para personalizar
 * la app; la autenticación de verdad empieza cuando entra el backend.
 *
 * Cumple `ServicioAuth` igual que la versión remota, así que las pantallas no
 * cambian: solo dejan de pedir contraseña cuando `remoto` es false.
 */

import type {
  CredencialesAcceso,
  CredencialesRegistro,
  ServicioAuth,
  Sesion,
  Usuario,
} from '@/tipos/auth'
import { nuevoId } from '@/lib/ids'

const CLAVE = 'kaizen:perfil'

function leer(): Usuario | null {
  try {
    const crudo = window.localStorage.getItem(CLAVE)
    if (!crudo) return null
    const u = JSON.parse(crudo) as Partial<Usuario>
    if (!u || typeof u.id !== 'string' || typeof u.nombre !== 'string') return null
    return { id: u.id, nombre: u.nombre, email: u.email ?? '', creado: u.creado }
  } catch {
    return null
  }
}

function escribir(u: Usuario | null): void {
  try {
    if (u) window.localStorage.setItem(CLAVE, JSON.stringify(u))
    else window.localStorage.removeItem(CLAVE)
  } catch {
    // Modo privado: el perfil vive lo que dure la pestaña.
  }
}

function comoSesion(usuario: Usuario): Sesion {
  return { usuario, token: null }
}

export function crearAuthLocal(): ServicioAuth {
  let enMemoria: Usuario | null = null

  async function registrar(datos: CredencialesRegistro): Promise<Sesion> {
    const nombre = datos.nombre.trim()
    if (!nombre) throw new Error('Escribe un nombre para empezar.')
    const usuario: Usuario = {
      id: nuevoId('u'),
      nombre,
      email: datos.email.trim(),
      creado: new Date().toISOString(),
    }
    enMemoria = usuario
    escribir(usuario)
    return comoSesion(usuario)
  }

  return {
    remoto: false,

    async sesionActual() {
      enMemoria ??= leer()
      return enMemoria ? comoSesion(enMemoria) : null
    },

    registrar,

    /** Sin backend no hay nada que verificar: se recupera el perfil guardado, o
     *  se crea uno con lo que haya escrito el usuario. */
    async iniciarSesion(datos: CredencialesAcceso) {
      const existente = leer()
      if (existente) {
        enMemoria = existente
        return comoSesion(existente)
      }
      return registrar({
        nombre: datos.email.split('@')[0] || 'Tú',
        email: datos.email,
        password: '',
      })
    },

    async cerrarSesion() {
      enMemoria = null
      escribir(null)
    },
  }
}

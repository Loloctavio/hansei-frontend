/* servicioApi.ts — cuentas reales contra el backend.
 *
 * El frontend nunca valida ni transforma la contraseña: la manda por HTTPS tal
 * como la escribió el usuario y el backend la hashea. Cualquier hash del lado
 * del cliente sería teatro.
 *
 * Soporta los dos esquemas de sesión: token en el cuerpo (se guarda con
 * `almacenToken`) o cookie httpOnly (VITE_AUTH_COOKIES=true, y entonces no hay
 * token que guardar).
 */

import type {
  CredencialesAcceso,
  CredencialesRegistro,
  ServicioAuth,
  Sesion,
  Usuario,
} from '@/tipos/auth'
import { config } from '@/config'
import { cliente, ErrorApi } from '@/datos/cliente'
import { almacenToken } from '@/datos/almacenToken'

/** Lo que responden /auth/acceso y /auth/registro. */
interface RespuestaSesion {
  usuario: Usuario
  token?: string | null
  expira?: string | null
}

function guardar(res: RespuestaSesion): Sesion {
  const token = res.token ?? null
  if (token) almacenToken.guardar(token)
  return { usuario: res.usuario, token, expira: res.expira ?? null }
}

export function crearAuthApi(): ServicioAuth {
  return {
    remoto: true,

    /** Con token guardado (o cookie) se pregunta quién es. Un 401 aquí es
     *  normal: significa que nadie ha entrado.
     *
     *  Sin token y sin cookies no se pregunta nada. Si no, una visita nueva
     *  arrancaría con un error de red en pantalla antes de que el usuario haya
     *  intentado siquiera entrar. */
    async sesionActual() {
      if (!config.authCookies && !almacenToken.leer()) return null
      try {
        const usuario = await cliente.get<Usuario>('/auth/yo')
        return { usuario, token: almacenToken.leer() }
      } catch (e) {
        if (e instanceof ErrorApi && e.esAuth) {
          almacenToken.limpiar()
          return null
        }
        throw e
      }
    },

    async registrar(datos: CredencialesRegistro) {
      const res = await cliente.post<RespuestaSesion>(
        '/auth/registro',
        { nombre: datos.nombre.trim(), email: datos.email.trim(), password: datos.password },
        { publico: true },
      )
      return guardar(res)
    },

    async iniciarSesion(datos: CredencialesAcceso) {
      const res = await cliente.post<RespuestaSesion>(
        '/auth/acceso',
        { email: datos.email.trim(), password: datos.password },
        { publico: true },
      )
      return guardar(res)
    },

    /** Se avisa al backend para que invalide el refresh token o la cookie, pero
     *  el token local se borra pase lo que pase: si el servidor no responde, el
     *  usuario igual espera haber salido. */
    async cerrarSesion() {
      try {
        await cliente.post<void>('/auth/salir')
      } catch {
        // Sin conexión no hay nada que invalidar del otro lado.
      } finally {
        almacenToken.limpiar()
      }
    },
  }
}

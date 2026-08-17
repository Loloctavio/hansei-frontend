/* auth.ts — tipos de cuentas y sesion.
 *
 * El frontend no valida contrasenas ni firma tokens: eso es del backend. Aqui
 * solo se describe la forma de lo que se manda y lo que se recibe.
 */

export interface Usuario {
  id: string
  email: string
  nombre: string
  /** ISO 8601. Opcional porque el modo local no lo necesita. */
  creado?: string
}

export interface Sesion {
  usuario: Usuario
  /** JWT o token opaco. null cuando el backend usa cookies httpOnly. */
  token: string | null
  /** ISO 8601 de expiracion, si el backend la informa. */
  expira?: string | null
}

export interface CredencialesAcceso {
  email: string
  password: string
}

export interface CredencialesRegistro extends CredencialesAcceso {
  nombre: string
}

/** Contrato que cumplen tanto el modo local como el modo api. Cambiar de uno
 *  a otro es cambiar la implementacion, nunca las pantallas. */
export interface ServicioAuth {
  /** Sesion guardada, o null si nadie ha entrado. Se llama al arrancar. */
  sesionActual(): Promise<Sesion | null>
  registrar(datos: CredencialesRegistro): Promise<Sesion>
  iniciarSesion(datos: CredencialesAcceso): Promise<Sesion>
  cerrarSesion(): Promise<void>
  /** true si las cuentas son reales; false en el modo local de un solo usuario. */
  readonly remoto: boolean
}

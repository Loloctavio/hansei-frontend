/* contexto.ts — el contexto de auth y su hook.
 *
 * Separado del componente proveedor a propósito: un archivo que exporta hooks y
 * componentes a la vez rompe el hot reload de React Refresh.
 */

import { createContext, useContext } from 'react'
import type { CredencialesAcceso, CredencialesRegistro, Usuario } from '@/tipos/auth'

export interface EstadoAuth {
  /** null mientras se resuelve la sesión inicial. */
  usuario: Usuario | null
  /** true durante la comprobación de arranque. */
  cargando: boolean
  /** true mientras hay un login o registro en vuelo. */
  enviando: boolean
  error: string | null
  /** false en modo local: las pantallas ocultan la contraseña. */
  remoto: boolean
  entrar(datos: CredencialesAcceso): Promise<void>
  registrar(datos: CredencialesRegistro): Promise<void>
  salir(): Promise<void>
  limpiarError(): void
}

export const ContextoAuth = createContext<EstadoAuth | null>(null)

export function useAuth(): EstadoAuth {
  const ctx = useContext(ContextoAuth)
  if (!ctx) throw new Error('useAuth requiere que el árbol esté dentro de <ProveedorAuth>.')
  return ctx
}

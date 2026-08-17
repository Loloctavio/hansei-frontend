/* servicio.ts — elige la implementación de auth según el modo. */

import { usaApi } from '@/config'
import type { ServicioAuth } from '@/tipos/auth'
import { crearAuthLocal } from './servicioLocal'
import { crearAuthApi } from './servicioApi'

let instancia: ServicioAuth | null = null

export function servicioAuth(): ServicioAuth {
  instancia ??= usaApi ? crearAuthApi() : crearAuthLocal()
  return instancia
}

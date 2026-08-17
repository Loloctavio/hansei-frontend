/* index.ts — decide qué implementación se usa.
 *
 * Único lugar del frontend donde se ramifica por modo. Todo lo demás recibe un
 * `Repositorio` y no pregunta de dónde salió.
 */

import { usaApi } from '@/config'
import type { Repositorio } from './repositorio'
import { crearRepositorioLocal } from './repositorioLocal'
import { crearRepositorioApi } from './repositorioApi'

let instancia: Repositorio | null = null

export function repositorio(): Repositorio {
  instancia ??= usaApi ? crearRepositorioApi() : crearRepositorioLocal()
  return instancia
}

/** Fuerza que el próximo `repositorio()` construya uno nuevo. Se usa al cerrar
 *  sesión, para que el estado del usuario anterior no quede en memoria. */
export function reiniciarRepositorio(): void {
  instancia = null
}

export type { Repositorio, CambiosObjetivo } from './repositorio'
export { ErrorApi, mensajeDeError, suscribirSesionVencida } from './cliente'

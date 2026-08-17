/* repositorioApi.ts — la misma interfaz, contra el backend HTTP.
 *
 * Está escrito y tipado, listo para usarse: en cuanto el backend responda las
 * rutas de API.md, basta poner VITE_MODO_DATOS=api. No hay TODOs aquí a
 * propósito — si algo no cuadra con el backend real, el ajuste va en este
 * archivo y en ningún otro.
 *
 * El servidor deduce el usuario del token; ninguna ruta lleva el id del usuario.
 */

import type {
  ClaveFecha,
  Datos,
  EntradaObjetivo,
  Nota,
  Objetivo,
} from '@/tipos/dominio'
import { datosVacios, VERSION_DATOS } from '@/tipos/dominio'
import { cliente } from './cliente'
import type { CambiosObjetivo, Repositorio } from './repositorio'

/** Lo que devuelve GET /datos. Se acepta que falte cualquier parte. */
interface RespuestaDatos {
  version?: number
  objetivos?: Objetivo[]
  registros?: Datos['registros']
  bitacora?: Datos['bitacora']
}

function normalizar(res: RespuestaDatos | null): Datos {
  if (!res) return datosVacios()
  return {
    version: res.version ?? VERSION_DATOS,
    objetivos: res.objetivos ?? [],
    registros: res.registros ?? {},
    bitacora: res.bitacora ?? {},
  }
}

function ruta(fecha: ClaveFecha): string {
  return encodeURIComponent(fecha)
}

export function crearRepositorioApi(): Repositorio {
  return {
    etiqueta: 'Sincronizado con tu cuenta',

    async cargar() {
      return normalizar(await cliente.get<RespuestaDatos>('/datos'))
    },

    async crearObjetivo(entrada: EntradaObjetivo) {
      return cliente.post<Objetivo>('/objetivos', entrada)
    },

    async actualizarObjetivo(id: string, cambios: CambiosObjetivo) {
      return cliente.patch<Objetivo>(`/objetivos/${encodeURIComponent(id)}`, cambios)
    },

    async borrarObjetivo(id: string) {
      await cliente.delete<void>(`/objetivos/${encodeURIComponent(id)}`)
    },

    async marcar(objetivoId: string, fecha: ClaveFecha, hecho: boolean) {
      await cliente.put<void>(
        `/objetivos/${encodeURIComponent(objetivoId)}/registros/${ruta(fecha)}`,
        { hecho },
      )
    },

    async guardarNota(fecha: ClaveFecha, nota: Nota) {
      await cliente.put<void>(`/bitacora/${ruta(fecha)}`, nota)
    },

    async reemplazarTodo(datos: Datos) {
      return normalizar(await cliente.put<RespuestaDatos>('/datos', datos))
    },
  }
}

/* contexto.ts — contexto de datos y su hook.
 *
 * Separado del proveedor por la misma razón que en auth: no mezclar exports de
 * hooks y de componentes en un archivo.
 */

import { createContext, useContext } from 'react'
import type { ClaveFecha, Datos, EntradaObjetivo, Nota } from '@/tipos/dominio'
import type { CambiosObjetivo } from '@/datos'

export interface EstadoKaizen {
  /** Siempre presente. Vacío mientras `cargando` es true. */
  datos: Datos
  cargando: boolean
  /** Error de carga o de la última mutación. */
  error: string | null
  /** Mensaje efímero para el pie de página. */
  aviso: string | null
  /** Texto que le dice al usuario dónde viven sus datos. */
  etiquetaAlmacen: string

  crearObjetivo(entrada: EntradaObjetivo): Promise<void>
  actualizarObjetivo(id: string, cambios: CambiosObjetivo): Promise<void>
  archivarObjetivo(id: string, archivado: boolean): Promise<void>
  borrarObjetivo(id: string): Promise<void>
  alternarMarca(objetivoId: string, fecha: ClaveFecha): Promise<void>
  guardarNota(fecha: ClaveFecha, nota: Nota): Promise<void>

  exportar(): string
  importar(json: string): Promise<void>
  recargar(): Promise<void>
  avisar(texto: string): void
}

export const ContextoKaizen = createContext<EstadoKaizen | null>(null)

export function useKaizen(): EstadoKaizen {
  const ctx = useContext(ContextoKaizen)
  if (!ctx) throw new Error('useKaizen requiere que el árbol esté dentro de <ProveedorKaizen>.')
  return ctx
}

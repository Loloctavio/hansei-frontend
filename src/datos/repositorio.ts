/* repositorio.ts — la costura entre la app y donde viven los datos.
 *
 * Este archivo es el contrato. Hay dos implementaciones que lo cumplen
 * (`repositorioLocal` y `repositorioApi`) y la app no sabe cuál está usando.
 * Cuando el backend esté listo, no se toca ni un componente: se cambia
 * VITE_MODO_DATOS a `api`.
 *
 * Las mutaciones devuelven solo la entidad afectada, no el estado completo.
 * Sobre HTTP eso significa una respuesta chica en vez de volver a bajar todo
 * el historial en cada clic.
 */

import type {
  ClaveFecha,
  Datos,
  EntradaObjetivo,
  Nota,
  Objetivo,
} from '@/tipos/dominio'

/** Campos que se pueden editar de un objetivo ya creado. */
export type CambiosObjetivo = Partial<EntradaObjetivo> & { archivado?: boolean }

export interface Repositorio {
  /** Texto para el pie de página: le dice al usuario dónde están sus datos. */
  readonly etiqueta: string

  /** Trae todo el estado del usuario. Se llama una vez al arrancar. */
  cargar(): Promise<Datos>

  crearObjetivo(entrada: EntradaObjetivo): Promise<Objetivo>
  actualizarObjetivo(id: string, cambios: CambiosObjetivo): Promise<Objetivo>
  borrarObjetivo(id: string): Promise<void>

  /** Sella o desella un día. Idempotente: mandar `true` dos veces no duplica. */
  marcar(objetivoId: string, fecha: ClaveFecha, hecho: boolean): Promise<void>

  /** Guarda la nota del día. Una nota con ambos campos vacíos se borra. */
  guardarNota(fecha: ClaveFecha, nota: Nota): Promise<void>

  /** Reemplaza todo el historial. Es lo que usa Importar datos. */
  reemplazarTodo(datos: Datos): Promise<Datos>
}

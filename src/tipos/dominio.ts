/* dominio.ts — el vocabulario de la app.
 *
 * Estos tipos son el contrato que el backend tendra que respetar. Si cambian
 * aqui, cambian en API.md y en el otro repo. Es el unico archivo que ambos
 * lados necesitan leer para entenderse.
 */

/** Fecha en formato 'AAAA-MM-DD', siempre en horario local. */
export type ClaveFecha = string

export type CategoriaId = 'salud' | 'aprendizaje' | 'trabajo' | 'personal'

export interface Categoria {
  id: CategoriaId
  nombre: string
}

export const CATEGORIAS: readonly Categoria[] = [
  { id: 'salud', nombre: 'Salud' },
  { id: 'aprendizaje', nombre: 'Aprendizaje' },
  { id: 'trabajo', nombre: 'Trabajo' },
  { id: 'personal', nombre: 'Personal' },
] as const

/** Veces por semana que toca dar el paso. 7 = todos los días. */
export type Frecuencia = 1 | 2 | 3 | 4 | 5 | 6 | 7

export interface OpcionFrecuencia {
  valor: Frecuencia
  etiqueta: string
}

export const FRECUENCIAS: readonly OpcionFrecuencia[] = [
  { valor: 7, etiqueta: 'Todos los días' },
  { valor: 6, etiqueta: '6 veces por semana' },
  { valor: 5, etiqueta: '5 veces por semana' },
  { valor: 4, etiqueta: '4 veces por semana' },
  { valor: 3, etiqueta: '3 veces por semana' },
  { valor: 2, etiqueta: '2 veces por semana' },
  { valor: 1, etiqueta: '1 vez por semana' },
] as const

export interface Objetivo {
  id: string
  nombre: string
  categoria: CategoriaId
  /** La versión de un minuto: lo que harías incluso en tu peor día. */
  pasoMinimo: string
  frecuencia: Frecuencia
  creado: ClaveFecha
  archivado: boolean
}

/** Lo que el formulario manda para crear o editar. El id y la fecha de
 *  creación los pone quien persiste, no la interfaz. */
export interface EntradaObjetivo {
  nombre: string
  categoria: CategoriaId
  pasoMinimo: string
  frecuencia: Frecuencia
}

export interface Nota {
  mejora: string
  obstaculo: string
}

/** Nota con su fecha, para listarlas ordenadas. */
export interface NotaFechada extends Nota {
  fecha: ClaveFecha
}

/** { objetivoId: { 'AAAA-MM-DD': true } }. Solo se guardan los días marcados. */
export type Registros = Record<string, Record<ClaveFecha, boolean>>

export type Bitacora = Record<ClaveFecha, Nota>

/** El estado completo del usuario. Es lo que viaja en export/import. */
export interface Datos {
  version: number
  objetivos: Objetivo[]
  registros: Registros
  bitacora: Bitacora
}

export const VERSION_DATOS = 1

export function datosVacios(): Datos {
  return { version: VERSION_DATOS, objetivos: [], registros: {}, bitacora: {} }
}

/* ---------- resultados de cálculo ---------- */

export interface Racha {
  valor: number
  /** 'días' para objetivos diarios, 'semanas' para los de N veces por semana. */
  unidad: string
}

export type Tono = 'reducir' | 'ampliar'

export interface Ajuste {
  objetivo: Objetivo
  tono: Tono
  texto: string
}

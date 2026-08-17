/* fechas.ts — utilidades de fecha en horario local, sin desfases UTC.
 *
 * Nada aquí pasa por toISOString(): marcar un día a las 11 de la noche en
 * México no debe registrarse en el día siguiente. Las claves son 'AAAA-MM-DD'
 * construidas con los getters locales.
 */

import type { ClaveFecha } from '@/tipos/dominio'

export const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'] as const
export const INICIALES = ['L', 'M', 'X', 'J', 'V', 'S', 'D'] as const
export const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
] as const

export const MS_POR_DIA = 86_400_000

/** Date -> 'AAAA-MM-DD' usando el huso local. */
export function clave(fecha: Date): ClaveFecha {
  const a = fecha.getFullYear()
  const m = String(fecha.getMonth() + 1).padStart(2, '0')
  const d = String(fecha.getDate()).padStart(2, '0')
  return `${a}-${m}-${d}`
}

/** 'AAAA-MM-DD' -> Date a medianoche local. */
export function desdeClave(txt: ClaveFecha): Date {
  const [a, m, d] = txt.split('-').map(Number)
  return new Date(a, m - 1, d)
}

/** Hoy a medianoche local, para comparar días sin que estorbe la hora. */
export function hoy(): Date {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

export function claveHoy(): ClaveFecha {
  return clave(hoy())
}

export function sumarDias(fecha: Date, n: number): Date {
  const d = new Date(fecha.getTime())
  d.setDate(d.getDate() + n)
  return d
}

/** Días completos entre dos fechas. Positivo si `b` es posterior. */
export function diasEntre(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / MS_POR_DIA)
}

/** Índice de día con la semana empezando en lunes: 0 = lunes ... 6 = domingo. */
export function indiceDia(fecha: Date): number {
  return (fecha.getDay() + 6) % 7
}

/** Lunes de la semana a la que pertenece la fecha. */
export function inicioSemana(fecha: Date): Date {
  return sumarDias(fecha, -indiceDia(fecha))
}

/** Arreglo de 7 fechas, de lunes a domingo. */
export function semanaDe(fecha: Date): Date[] {
  const lunes = inicioSemana(fecha)
  return Array.from({ length: 7 }, (_, i) => sumarDias(lunes, i))
}

/** Todas las fechas del mes indicado (mes 0-11). */
export function diasDelMes(anio: number, mes: number): Date[] {
  const salida: Date[] = []
  const d = new Date(anio, mes, 1)
  while (d.getMonth() === mes) {
    salida.push(new Date(d.getTime()))
    d.setDate(d.getDate() + 1)
  }
  return salida
}

/** Últimos n días incluyendo hoy, del más antiguo al más reciente. */
export function ultimosDias(n: number): Date[] {
  const base = hoy()
  return Array.from({ length: n }, (_, i) => sumarDias(base, -(n - 1 - i)))
}

export function esFuturo(fecha: Date): boolean {
  return fecha.getTime() > hoy().getTime()
}

export function mismoDia(a: Date, b: Date): boolean {
  return clave(a) === clave(b)
}

/** '17 de agosto de 2026' */
export function largo(fecha: Date): string {
  return `${fecha.getDate()} de ${MESES[fecha.getMonth()].toLowerCase()} de ${fecha.getFullYear()}`
}

/** 'Lun 17 ago' */
export function corto(fecha: Date): string {
  const mes = MESES[fecha.getMonth()].slice(0, 3).toLowerCase()
  return `${DIAS[indiceDia(fecha)]} ${fecha.getDate()} ${mes}`
}

/* metricas.ts — todo el cálculo derivado, como funciones puras.
 *
 * Ninguna de estas funciones sabe de dónde vinieron los datos ni cómo se
 * guardan: reciben `Datos` y devuelven un número. Eso las hace testeables sin
 * navegador, y el día que el backend quiera calcular rachas del lado del
 * servidor puede portar este archivo tal cual.
 */

import type {
  Ajuste,
  ClaveFecha,
  Datos,
  Nota,
  NotaFechada,
  Objetivo,
  Racha,
} from '@/tipos/dominio'
import * as f from '@/lib/fechas'

/* ---------- consultas simples ---------- */

export function objetivos(datos: Datos, incluirArchivados = false): Objetivo[] {
  return datos.objetivos.filter((o) => (incluirArchivados ? true : !o.archivado))
}

export function archivados(datos: Datos): Objetivo[] {
  return datos.objetivos.filter((o) => o.archivado)
}

export function objetivoPorId(datos: Datos, id: string): Objetivo | null {
  return datos.objetivos.find((o) => o.id === id) ?? null
}

export function estaMarcado(datos: Datos, oid: string, fecha: ClaveFecha): boolean {
  return datos.registros[oid]?.[fecha] === true
}

/** Cuántos objetivos activos se marcaron ese día. */
export function marcasDelDia(datos: Datos, fecha: ClaveFecha): number {
  return objetivos(datos).filter((o) => estaMarcado(datos, o.id, fecha)).length
}

/** Marcas del objetivo dentro del conjunto de días indicado. */
export function cumplidosEn(datos: Datos, oid: string, dias: Date[]): number {
  return dias.filter((d) => estaMarcado(datos, oid, f.clave(d))).length
}

/** Marcas del objetivo en la semana en curso. */
export function cumplidosEstaSemana(datos: Datos, oid: string): number {
  return cumplidosEn(datos, oid, f.semanaDe(f.hoy()))
}

/** El objetivo ya no necesita atención hoy: se marcó, o su cuota semanal
 *  está cubierta. Un objetivo de 3 veces por semana que ya lleva 3 no debe
 *  seguir pidiendo atención el jueves. */
export function resueltoHoy(datos: Datos, o: Objetivo, fecha: ClaveFecha): boolean {
  if (estaMarcado(datos, o.id, fecha)) return true
  return o.frecuencia < 7 && cumplidosEstaSemana(datos, o.id) >= o.frecuencia
}

/* ---------- rachas ---------- */

/** Objetivos diarios: días consecutivos hasta hoy.
 *  Objetivos de N veces por semana: semanas consecutivas que alcanzaron la cuota.
 *  En ambos casos la unidad en curso no rompe la racha: todavía puede cerrarse. */
export function racha(datos: Datos, oid: string): Racha {
  const o = objetivoPorId(datos, oid)
  if (!o) return { valor: 0, unidad: 'días' }

  const marcas = datos.registros[oid]
  if (!marcas || Object.keys(marcas).length === 0) {
    return { valor: 0, unidad: o.frecuencia >= 7 ? 'días' : 'semanas' }
  }

  if (o.frecuencia >= 7) {
    let cursor = f.hoy()
    // Si hoy todavía no está marcado, la racha se cuenta desde ayer: el día
    // en curso no ha terminado y no debería romperla.
    if (!estaMarcado(datos, oid, f.clave(cursor))) cursor = f.sumarDias(cursor, -1)
    let dias = 0
    while (estaMarcado(datos, oid, f.clave(cursor))) {
      dias++
      cursor = f.sumarDias(cursor, -1)
    }
    return { valor: dias, unidad: dias === 1 ? 'día' : 'días' }
  }

  const primera = f.desdeClave(Object.keys(marcas).sort()[0])
  const limite = f.inicioSemana(primera).getTime()
  let lunes = f.inicioSemana(f.hoy())
  let semanas = 0
  let enCurso = true

  while (lunes.getTime() >= limite) {
    const cumplidos = cumplidosEn(datos, oid, f.semanaDe(lunes))
    if (cumplidos >= o.frecuencia) {
      semanas++
    } else if (!enCurso) {
      break
    }
    // La semana en curso todavía puede completarse: no rompe la racha.
    enCurso = false
    lunes = f.sumarDias(lunes, -7)
    if (semanas > 260) break
  }

  return { valor: semanas, unidad: semanas === 1 ? 'semana' : 'semanas' }
}

/** La corrida más larga de días consecutivos que haya existido. */
export function rachaMaxima(datos: Datos, oid: string): number {
  const claves = Object.keys(datos.registros[oid] ?? {}).sort()
  if (claves.length === 0) return 0

  let mejor = 1
  let corrida = 1
  for (let i = 1; i < claves.length; i++) {
    const brecha = f.diasEntre(f.desdeClave(claves[i - 1]), f.desdeClave(claves[i]))
    corrida = brecha === 1 ? corrida + 1 : 1
    if (corrida > mejor) mejor = corrida
  }
  return mejor
}

/** Días con al menos una marca, consecutivos hasta hoy. */
export function rachaGlobal(datos: Datos): number {
  let cursor = f.hoy()
  if (marcasDelDia(datos, f.clave(cursor)) === 0) cursor = f.sumarDias(cursor, -1)
  let dias = 0
  while (marcasDelDia(datos, f.clave(cursor)) > 0) {
    dias++
    cursor = f.sumarDias(cursor, -1)
  }
  return dias
}

/* ---------- consistencia ---------- */

/** Marcas logradas contra marcas esperadas en los últimos n días, ajustada a
 *  la frecuencia del objetivo.
 *
 *  Devuelve null cuando el objetivo tiene menos de 7 días de vida: antes de
 *  eso el porcentaje es ruido y la interfaz muestra un guión. */
export function consistencia(datos: Datos, oid: string, dias = 30): number | null {
  const o = objetivoPorId(datos, oid)
  if (!o) return null

  const creado = o.creado || f.claveHoy()
  const edad = f.diasEntre(f.desdeClave(creado), f.hoy()) + 1
  if (edad < 7) return null

  const ventana = Math.max(1, Math.min(dias, edad))
  const esperados = Math.max(1, Math.round(ventana * (o.frecuencia / 7)))
  const logrados = cumplidosEn(datos, oid, f.ultimosDias(ventana))

  return Math.min(100, Math.round((logrados / esperados) * 100))
}

/** Días de vida del objetivo, contando el día de creación. */
export function edadEnDias(o: Objetivo): number {
  return f.diasEntre(f.desdeClave(o.creado || f.claveHoy()), f.hoy())
}

/* ---------- totales ---------- */

export function totalDiasActivos(datos: Datos): number {
  const vistos = new Set<string>()
  for (const marcas of Object.values(datos.registros)) {
    for (const dia of Object.keys(marcas)) vistos.add(dia)
  }
  return vistos.size
}

export function totalMarcas(datos: Datos): number {
  return Object.values(datos.registros).reduce(
    (total, marcas) => total + Object.keys(marcas).length,
    0,
  )
}

/* ---------- bitácora ---------- */

export function notaDe(datos: Datos, fecha: ClaveFecha): Nota {
  return datos.bitacora[fecha] ?? { mejora: '', obstaculo: '' }
}

/** Notas del conjunto de días indicado, sin las vacías. Revisión la usa para
 *  mostrar la bitácora dentro de la semana que explica. */
export function notasDe(datos: Datos, dias: Date[]): NotaFechada[] {
  return dias
    .map((d) => ({ fecha: f.clave(d), ...notaDe(datos, f.clave(d)) }))
    .filter((n) => n.mejora !== '' || n.obstaculo !== '')
}

/* ---------- ajuste propuesto ---------- */

/** La lógica kaizen: si fallas seguido, el paso es demasiado grande — no tu
 *  voluntad. Bajo 50% propone achicar; sobre 90% sostenido propone subir el
 *  listón. No opina sobre objetivos con menos de una semana de historial. */
export function ajustes(datos: Datos, activos: Objetivo[], dias: Date[]): Ajuste[] {
  const salida: Ajuste[] = []

  for (const o of activos) {
    const c30 = consistencia(datos, o.id, 30)
    const edad = edadEnDias(o)
    if (edad < 7 || c30 === null) continue

    const hechos = cumplidosEn(datos, o.id, dias)

    if (c30 < 50) {
      const menor = Math.max(1, o.frecuencia - 2)
      salida.push({
        objetivo: o,
        tono: 'reducir',
        texto:
          `Consistencia de ${c30}% en 30 días. Achica el paso mínimo a algo que ` +
          `puedas hacer en un minuto, o baja la frecuencia a ${menor} veces por semana.`,
      })
    } else if (c30 >= 90 && o.frecuencia >= 7 && edad >= 21) {
      salida.push({
        objetivo: o,
        tono: 'ampliar',
        texto:
          `Consistencia de ${c30}%. El hábito está firme: es buen momento para ` +
          'subir un poco el paso mínimo.',
      })
    } else if (hechos === 0 && !f.esFuturo(dias[0])) {
      salida.push({
        objetivo: o,
        tono: 'reducir',
        texto:
          'Cero marcas esta semana. Antes de abandonarlo, prueba una semana con ' +
          'la versión más pequeña posible.',
      })
    }
  }

  return salida
}

/** Etiqueta legible de una frecuencia, para cuando no hay un select a la mano. */
export function etiquetaFrecuencia(n: number): string {
  if (n >= 7) return 'Todos los días'
  return n === 1 ? '1 vez por semana' : `${n} veces por semana`
}

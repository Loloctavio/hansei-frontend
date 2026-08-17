/* repositorioLocal.ts — persistencia en el navegador.
 *
 * Mantiene el estado completo en memoria y escribe el blob entero en
 * localStorage tras cada mutación. Es la implementación que permite usar la app
 * hoy, sin backend y sin cuenta remota.
 *
 * Si localStorage no está disponible (modo privado, permisos), degrada a
 * memoria: la app sigue funcionando y el pie de página lo advierte.
 */

import type {
  ClaveFecha,
  Datos,
  EntradaObjetivo,
  Nota,
  Objetivo,
} from '@/tipos/dominio'
import { datosVacios, VERSION_DATOS } from '@/tipos/dominio'
import { nuevoId } from '@/lib/ids'
import { claveHoy } from '@/lib/fechas'
import type { CambiosObjetivo, Repositorio } from './repositorio'

/** Clave del rediseño. La app anterior usaba 'kaizen:estado' y se migra sola. */
const CLAVE = 'kaizen:datos'
const CLAVE_LEGADA = 'kaizen:estado'

function disponible(): boolean {
  try {
    window.localStorage.setItem('kaizen:prueba', '1')
    window.localStorage.removeItem('kaizen:prueba')
    return true
  } catch {
    return false
  }
}

/** Acepta cualquier JSON y devuelve algo que cumple `Datos`. Un archivo
 *  importado a mano o un estado viejo no deben poder romper la app. */
function normalizar(crudo: unknown): Datos {
  const base = datosVacios()
  if (!crudo || typeof crudo !== 'object') return base

  const d = crudo as Partial<Datos>
  return {
    version: typeof d.version === 'number' ? d.version : VERSION_DATOS,
    objetivos: Array.isArray(d.objetivos) ? d.objetivos : [],
    registros: d.registros && typeof d.registros === 'object' ? d.registros : {},
    bitacora: d.bitacora && typeof d.bitacora === 'object' ? d.bitacora : {},
  }
}

export function crearRepositorioLocal(): Repositorio {
  const hayAlmacen = disponible()
  let datos: Datos = datosVacios()

  function escribir(): void {
    if (!hayAlmacen) return
    try {
      window.localStorage.setItem(CLAVE, JSON.stringify(datos))
    } catch {
      // Cuota llena. No hay mucho que hacer salvo no tirar la app.
    }
  }

  function buscar(id: string): Objetivo {
    const o = datos.objetivos.find((x) => x.id === id)
    if (!o) throw new Error('Ese objetivo ya no existe.')
    return o
  }

  return {
    etiqueta: hayAlmacen
      ? 'Guardado en este navegador'
      : 'Sin almacenamiento: los datos se pierden al cerrar',

    async cargar() {
      if (!hayAlmacen) {
        datos = datosVacios()
        return datos
      }
      const crudo =
        window.localStorage.getItem(CLAVE) ?? window.localStorage.getItem(CLAVE_LEGADA)
      if (!crudo) {
        datos = datosVacios()
        return datos
      }
      try {
        datos = normalizar(JSON.parse(crudo))
      } catch {
        datos = datosVacios()
      }
      // Si venía de la versión anterior, queda guardado con la clave nueva.
      escribir()
      return datos
    },

    async crearObjetivo(entrada: EntradaObjetivo) {
      const objetivo: Objetivo = {
        id: nuevoId(),
        nombre: entrada.nombre.trim(),
        categoria: entrada.categoria,
        pasoMinimo: entrada.pasoMinimo.trim(),
        frecuencia: entrada.frecuencia,
        creado: claveHoy(),
        archivado: false,
      }
      datos.objetivos.push(objetivo)
      datos.registros[objetivo.id] ??= {}
      escribir()
      return objetivo
    },

    async actualizarObjetivo(id: string, cambios: CambiosObjetivo) {
      const o = buscar(id)
      if (cambios.nombre !== undefined) o.nombre = cambios.nombre.trim()
      if (cambios.pasoMinimo !== undefined) o.pasoMinimo = cambios.pasoMinimo.trim()
      if (cambios.categoria !== undefined) o.categoria = cambios.categoria
      if (cambios.frecuencia !== undefined) o.frecuencia = cambios.frecuencia
      if (cambios.archivado !== undefined) o.archivado = cambios.archivado
      escribir()
      return o
    },

    async borrarObjetivo(id: string) {
      datos.objetivos = datos.objetivos.filter((o) => o.id !== id)
      delete datos.registros[id]
      escribir()
    },

    async marcar(objetivoId: string, fecha: ClaveFecha, hecho: boolean) {
      datos.registros[objetivoId] ??= {}
      if (hecho) datos.registros[objetivoId][fecha] = true
      else delete datos.registros[objetivoId][fecha]
      escribir()
    },

    async guardarNota(fecha: ClaveFecha, nota: Nota) {
      const limpia: Nota = {
        mejora: nota.mejora.trim(),
        obstaculo: nota.obstaculo.trim(),
      }
      if (!limpia.mejora && !limpia.obstaculo) delete datos.bitacora[fecha]
      else datos.bitacora[fecha] = limpia
      escribir()
    },

    async reemplazarTodo(nuevos: Datos) {
      datos = normalizar(nuevos)
      escribir()
      return datos
    },
  }
}

/* ProveedorKaizen.tsx — el estado de la app, encima del repositorio.
 *
 * Regla que sostiene todo esto: React es el dueño exclusivo del estado. Todo lo
 * que devuelve el repositorio se clona antes de entrar aquí, porque la
 * implementación local guarda sus propios objetos y los muta al editar. Sin el
 * clon compartiríamos referencias, y una mutación de fuera podría cambiar el
 * estado sin que React se enterara.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { ClaveFecha, Datos, EntradaObjetivo, Nota } from '@/tipos/dominio'
import { datosVacios } from '@/tipos/dominio'
import type { CambiosObjetivo } from '@/datos'
import { mensajeDeError, repositorio } from '@/datos'
import { ContextoKaizen } from './contexto'
import type { EstadoKaizen } from './contexto'

function copia<T>(valor: T): T {
  return structuredClone(valor)
}

export function ProveedorKaizen({ children }: { children: ReactNode }) {
  const repo = useMemo(() => repositorio(), [])
  const [datos, setDatos] = useState<Datos>(datosVacios)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const temporizador = useRef<number | null>(null)

  const avisar = useCallback((texto: string) => {
    setAviso(texto)
    if (temporizador.current) window.clearTimeout(temporizador.current)
    temporizador.current = window.setTimeout(() => setAviso(null), 3000)
  }, [])

  useEffect(() => {
    return () => {
      if (temporizador.current) window.clearTimeout(temporizador.current)
    }
  }, [])

  const cargar = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      setDatos(copia(await repo.cargar()))
    } catch (e) {
      setError(mensajeDeError(e))
    } finally {
      setCargando(false)
    }
  }, [repo])

  useEffect(() => {
    void cargar()
  }, [cargar])

  /** Envoltura común: ejecuta la mutación y deja el error a la vista si falla.
   *  Se relanza para que el formulario que la disparó pueda no cerrarse. */
  const mutar = useCallback(async (accion: () => Promise<void>) => {
    setError(null)
    try {
      await accion()
    } catch (e) {
      setError(mensajeDeError(e))
      throw e
    }
  }, [])

  const crearObjetivo = useCallback(
    (entrada: EntradaObjetivo) =>
      mutar(async () => {
        const creado = copia(await repo.crearObjetivo(entrada))
        setDatos((d) => ({
          ...d,
          objetivos: [...d.objetivos, creado],
          registros: { ...d.registros, [creado.id]: d.registros[creado.id] ?? {} },
        }))
      }),
    [mutar, repo],
  )

  const actualizarObjetivo = useCallback(
    (id: string, cambios: CambiosObjetivo) =>
      mutar(async () => {
        const nuevo = copia(await repo.actualizarObjetivo(id, cambios))
        setDatos((d) => ({
          ...d,
          objetivos: d.objetivos.map((o) => (o.id === id ? nuevo : o)),
        }))
      }),
    [mutar, repo],
  )

  const archivarObjetivo = useCallback(
    (id: string, archivado: boolean) => actualizarObjetivo(id, { archivado }),
    [actualizarObjetivo],
  )

  const borrarObjetivo = useCallback(
    (id: string) =>
      mutar(async () => {
        await repo.borrarObjetivo(id)
        setDatos((d) => {
          const registros = { ...d.registros }
          delete registros[id]
          return { ...d, objetivos: d.objetivos.filter((o) => o.id !== id), registros }
        })
      }),
    [mutar, repo],
  )

  /** Sella o desella. Se calcula el nuevo valor desde el estado actual y se
   *  manda explícito, en vez de un toggle: así dos clics rápidos no se pisan. */
  const alternarMarca = useCallback(
    (objetivoId: string, fecha: ClaveFecha) =>
      mutar(async () => {
        const hecho = datos.registros[objetivoId]?.[fecha] !== true
        await repo.marcar(objetivoId, fecha, hecho)
        setDatos((d) => {
          const delObjetivo = { ...(d.registros[objetivoId] ?? {}) }
          if (hecho) delObjetivo[fecha] = true
          else delete delObjetivo[fecha]
          return { ...d, registros: { ...d.registros, [objetivoId]: delObjetivo } }
        })
      }),
    [datos, mutar, repo],
  )

  const guardarNota = useCallback(
    (fecha: ClaveFecha, nota: Nota) =>
      mutar(async () => {
        await repo.guardarNota(fecha, nota)
        const limpia: Nota = { mejora: nota.mejora.trim(), obstaculo: nota.obstaculo.trim() }
        setDatos((d) => {
          const bitacora = { ...d.bitacora }
          if (!limpia.mejora && !limpia.obstaculo) delete bitacora[fecha]
          else bitacora[fecha] = limpia
          return { ...d, bitacora }
        })
      }),
    [mutar, repo],
  )

  const exportar = useCallback(() => JSON.stringify(datos, null, 2), [datos])

  const importar = useCallback(
    (json: string) =>
      mutar(async () => {
        let crudo: unknown
        try {
          crudo = JSON.parse(json)
        } catch {
          throw new Error('Ese archivo no es JSON válido.')
        }
        if (!crudo || typeof crudo !== 'object' || !Array.isArray((crudo as Datos).objetivos)) {
          throw new Error('El archivo no tiene el formato de Hansei.')
        }
        setDatos(copia(await repo.reemplazarTodo(crudo as Datos)))
      }),
    [mutar, repo],
  )

  const valor: EstadoKaizen = useMemo(
    () => ({
      datos,
      cargando,
      error,
      aviso,
      etiquetaAlmacen: repo.etiqueta,
      crearObjetivo,
      actualizarObjetivo,
      archivarObjetivo,
      borrarObjetivo,
      alternarMarca,
      guardarNota,
      exportar,
      importar,
      recargar: cargar,
      avisar,
    }),
    [
      datos,
      cargando,
      error,
      aviso,
      repo.etiqueta,
      crearObjetivo,
      actualizarObjetivo,
      archivarObjetivo,
      borrarObjetivo,
      alternarMarca,
      guardarNota,
      exportar,
      importar,
      cargar,
      avisar,
    ],
  )

  return <ContextoKaizen.Provider value={valor}>{children}</ContextoKaizen.Provider>
}

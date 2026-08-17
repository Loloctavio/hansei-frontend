/* rutas.ts — enrutado por hash, sin dependencias.
 *
 * Cuatro secciones no justifican react-router, y el hash tiene una ventaja
 * concreta para este proyecto: el build estático se puede servir desde
 * cualquier lado sin reglas de rewrite en el servidor. Si más adelante hacen
 * falta rutas anidadas o profundas (un objetivo por URL), este es el archivo
 * que se reemplaza.
 */

import { useCallback, useEffect, useState } from 'react'

export const SECCIONES = ['hoy', 'objetivos', 'progreso', 'revision'] as const

export type Seccion = (typeof SECCIONES)[number]

export const TITULOS: Record<Seccion, string> = {
  hoy: 'Hoy',
  objetivos: 'Objetivos',
  progreso: 'Progreso',
  revision: 'Revisión',
}

function esSeccion(valor: string): valor is Seccion {
  return (SECCIONES as readonly string[]).includes(valor)
}

function leerHash(): Seccion {
  const crudo = window.location.hash.replace(/^#\/?/, '')
  return esSeccion(crudo) ? crudo : 'hoy'
}

export function useRuta(): { seccion: Seccion; ir: (destino: Seccion) => void } {
  const [seccion, setSeccion] = useState<Seccion>(leerHash)

  useEffect(() => {
    const alCambiar = () => setSeccion(leerHash())
    window.addEventListener('hashchange', alCambiar)
    return () => window.removeEventListener('hashchange', alCambiar)
  }, [])

  const ir = useCallback((destino: Seccion) => {
    if (window.location.hash.replace(/^#\/?/, '') === destino) {
      setSeccion(destino)
    } else {
      window.location.hash = destino
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return { seccion, ir }
}

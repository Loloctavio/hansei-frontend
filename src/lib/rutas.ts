/* rutas.ts — enrutado por hash, sin dependencias.
 *
 * Hay dos familias de rutas:
 *   · secciones — la app en sí, solo con sesión iniciada
 *   · públicas  — landing, acceso y los documentos legales
 *
 * Los legales son públicos pero también se alcanzan desde dentro de la app: un
 * usuario con sesión debe poder releer los términos sin cerrarla.
 *
 * Sigue sin usar react-router a propósito: el build estático se sirve desde
 * cualquier lado sin reglas de rewrite. Si aparecen rutas profundas (un
 * objetivo por URL), este es el archivo que se reemplaza.
 */

import { useCallback, useEffect, useState } from 'react'

export const SECCIONES = ['hoy', 'objetivos', 'progreso', 'revision'] as const
export type Seccion = (typeof SECCIONES)[number]

export const LEGALES = ['terminos', 'privacidad'] as const
export type Legal = (typeof LEGALES)[number]

export const PUBLICAS = ['landing', 'acceso', ...LEGALES] as const
export type Publica = (typeof PUBLICAS)[number]

export type Ruta = Seccion | Publica

/** Rótulos para el rail y para el <title> del documento. */
export const TITULOS: Record<Ruta, string> = {
  hoy: 'Hoy',
  objetivos: 'Objetivos',
  progreso: 'Progreso',
  revision: 'Revisión',
  landing: 'Inicio',
  acceso: 'Entrar',
  terminos: 'Términos y condiciones',
  privacidad: 'Aviso de privacidad',
}

export function esSeccion(ruta: Ruta): ruta is Seccion {
  return (SECCIONES as readonly string[]).includes(ruta)
}

export function esLegal(ruta: Ruta): ruta is Legal {
  return (LEGALES as readonly string[]).includes(ruta)
}

const TODAS: readonly string[] = [...SECCIONES, ...PUBLICAS]

function leerHash(): Ruta {
  const crudo = window.location.hash.replace(/^#\/?/, '')
  if (crudo === '') return 'landing'
  return TODAS.includes(crudo) ? (crudo as Ruta) : 'landing'
}

export function useRuta(): { ruta: Ruta; ir: (destino: Ruta) => void } {
  const [ruta, setRuta] = useState<Ruta>(leerHash)

  useEffect(() => {
    const alCambiar = () => setRuta(leerHash())
    window.addEventListener('hashchange', alCambiar)
    return () => window.removeEventListener('hashchange', alCambiar)
  }, [])

  const ir = useCallback((destino: Ruta) => {
    if (window.location.hash.replace(/^#\/?/, '') === destino) {
      setRuta(destino)
    } else {
      window.location.hash = destino
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return { ruta, ir }
}

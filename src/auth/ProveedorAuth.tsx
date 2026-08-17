/* ProveedorAuth.tsx — resuelve la sesión y la ofrece al resto del árbol.
 *
 * Es el componente más alto de la app: hasta que no sabe si hay usuario, no se
 * monta nada que dependa de datos.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { CredencialesAcceso, CredencialesRegistro, Usuario } from '@/tipos/auth'
import { mensajeDeError, reiniciarRepositorio, suscribirSesionVencida } from '@/datos'
import { servicioAuth } from './servicio'
import { ContextoAuth } from './contexto'
import type { EstadoAuth } from './contexto'

export function ProveedorAuth({ children }: { children: ReactNode }) {
  const servicio = useMemo(() => servicioAuth(), [])
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [cargando, setCargando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Sesión de arranque: token guardado, cookie o perfil local.
  useEffect(() => {
    let vivo = true
    servicio
      .sesionActual()
      .then((sesion) => {
        if (vivo) setUsuario(sesion?.usuario ?? null)
      })
      .catch((e) => {
        if (vivo) setError(mensajeDeError(e))
      })
      .finally(() => {
        if (vivo) setCargando(false)
      })
    return () => {
      vivo = false
    }
  }, [servicio])

  // Un 401 en cualquier petición, no solo en el login, tira la sesión.
  useEffect(
    () =>
      suscribirSesionVencida(() => {
        reiniciarRepositorio()
        setUsuario(null)
        setError('Tu sesión expiró. Vuelve a entrar.')
      }),
    [],
  )

  const entrar = useCallback(
    async (datos: CredencialesAcceso) => {
      setEnviando(true)
      setError(null)
      try {
        const sesion = await servicio.iniciarSesion(datos)
        reiniciarRepositorio()
        setUsuario(sesion.usuario)
      } catch (e) {
        setError(mensajeDeError(e))
        throw e
      } finally {
        setEnviando(false)
      }
    },
    [servicio],
  )

  const registrar = useCallback(
    async (datos: CredencialesRegistro) => {
      setEnviando(true)
      setError(null)
      try {
        const sesion = await servicio.registrar(datos)
        reiniciarRepositorio()
        setUsuario(sesion.usuario)
      } catch (e) {
        setError(mensajeDeError(e))
        throw e
      } finally {
        setEnviando(false)
      }
    },
    [servicio],
  )

  const salir = useCallback(async () => {
    await servicio.cerrarSesion()
    reiniciarRepositorio()
    setUsuario(null)
    setError(null)
  }, [servicio])

  const limpiarError = useCallback(() => setError(null), [])

  const valor: EstadoAuth = useMemo(
    () => ({
      usuario,
      cargando,
      enviando,
      error,
      remoto: servicio.remoto,
      entrar,
      registrar,
      salir,
      limpiarError,
    }),
    [usuario, cargando, enviando, error, servicio.remoto, entrar, registrar, salir, limpiarError],
  )

  return <ContextoAuth.Provider value={valor}>{children}</ContextoAuth.Provider>
}

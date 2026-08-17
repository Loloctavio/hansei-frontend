/* App.tsx — armazón y decisión de qué se muestra.
 *
 * Cuatro estados: resolviendo la sesión, documento legal (accesible con y sin
 * sesión), zona pública (landing o acceso), o la app.
 *
 * Los legales van primero en el orden de decisión a propósito: un usuario con
 * sesión debe poder releer los términos sin cerrarla, y uno sin sesión debe
 * poder leerlos sin crear cuenta.
 */

import { useEffect } from 'react'
import { MARCA } from '@/marca'
import { useAuth } from '@/auth/contexto'
import { PantallaAcceso } from '@/auth/PantallaAcceso'
import { ProveedorKaizen } from '@/estado/ProveedorKaizen'
import { useKaizen } from '@/estado/contexto'
import { Rail } from '@/componentes/Rail'
import { Pie } from '@/componentes/Pie'
import { Hoy } from '@/secciones/Hoy'
import { Objetivos } from '@/secciones/Objetivos'
import { Progreso } from '@/secciones/Progreso'
import { Revision } from '@/secciones/Revision'
import { Landing } from '@/publico/Landing'
import { Terminos } from '@/publico/Terminos'
import { Privacidad } from '@/publico/Privacidad'
import { esLegal, esSeccion, TITULOS, useRuta } from '@/lib/rutas'
import type { Ruta, Seccion } from '@/lib/rutas'

function Cargando({ texto }: { texto: string }) {
  return (
    <div className="cargando" role="status">
      <span className="cargando__kanji" aria-hidden="true">
        改
      </span>
      <p className="cargando__texto">{texto}</p>
    </div>
  )
}

/** El interior de la app: rail, sección activa y pie. */
function Sesion({ seccion, ir }: { seccion: Seccion; ir: (destino: Ruta) => void }) {
  const { cargando, error, recargar } = useKaizen()

  return (
    <div className="armazon">
      <Rail seccion={seccion} ir={ir} />
      <main className="lienzo">
        <div className="vista">
          {cargando ? (
            <Cargando texto="Abriendo tu registro…" />
          ) : (
            <div className="seccion" data-seccion={seccion}>
              {error && (
                <div className="alerta" role="alert">
                  <p className="alerta__texto">{error}</p>
                  <button
                    type="button"
                    className="boton boton--texto"
                    onClick={() => void recargar()}
                  >
                    Reintentar
                  </button>
                </div>
              )}
              {seccion === 'hoy' && <Hoy ir={ir} />}
              {seccion === 'objetivos' && <Objetivos />}
              {seccion === 'progreso' && <Progreso ir={ir} />}
              {seccion === 'revision' && <Revision ir={ir} />}
            </div>
          )}
        </div>
        <Pie ir={ir} />
      </main>
    </div>
  )
}

export function App() {
  const { usuario, cargando } = useAuth()
  const { ruta, ir } = useRuta()

  useEffect(() => {
    document.title =
      ruta === 'landing' ? `${MARCA.nombre} — ${MARCA.lema}` : `${TITULOS[ruta]} · ${MARCA.nombre}`
  }, [ruta])

  // Con sesión abierta, la landing y el acceso ya no tienen nada que ofrecer.
  useEffect(() => {
    if (usuario && (ruta === 'landing' || ruta === 'acceso')) ir('hoy')
  }, [usuario, ruta, ir])

  if (cargando) return <Cargando texto="Comprobando tu sesión…" />

  if (esLegal(ruta)) {
    const volverA: Ruta = usuario ? 'hoy' : 'landing'
    const volverTexto = usuario ? 'Volver a la app' : 'Volver'
    return ruta === 'terminos' ? (
      <Terminos ir={ir} volverA={volverA} volverTexto={volverTexto} />
    ) : (
      <Privacidad ir={ir} volverA={volverA} volverTexto={volverTexto} />
    )
  }

  if (!usuario) {
    return ruta === 'acceso' ? <PantallaAcceso ir={ir} /> : <Landing ir={ir} />
  }

  return (
    <ProveedorKaizen>
      <Sesion seccion={esSeccion(ruta) ? ruta : 'hoy'} ir={ir} />
    </ProveedorKaizen>
  )
}

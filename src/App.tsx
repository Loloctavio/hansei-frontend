/* App.tsx — armazón y decisión de qué se muestra.
 *
 * Tres estados posibles: resolviendo la sesión, sin sesión (puerta), o dentro.
 * El proveedor de datos solo se monta cuando hay usuario, así que en modo api
 * nunca se dispara una petición sin token.
 */

import { useEffect } from 'react'
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
import { useRuta } from '@/lib/rutas'
import { TITULOS } from '@/lib/rutas'

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
function Sesion() {
  const { seccion, ir } = useRuta()
  const { cargando, error, recargar } = useKaizen()

  useEffect(() => {
    document.title = `${TITULOS[seccion]} · Hansei`
  }, [seccion])

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
        <Pie />
      </main>
    </div>
  )
}

export function App() {
  const { usuario, cargando } = useAuth()

  if (cargando) return <Cargando texto="Comprobando tu sesión…" />
  if (!usuario) return <PantallaAcceso />

  return (
    <ProveedorKaizen>
      <Sesion />
    </ProveedorKaizen>
  )
}

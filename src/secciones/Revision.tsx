/* Revision.tsx — el hansei: mirar la semana sin castigarse.
 *
 * Aquí se relee la bitácora. Antes había una lista plana de todas las entradas;
 * ahora las notas aparecen dentro de la semana que explican, y se llega a las
 * viejas navegando hacia atrás. La nota junto a sus marcas dice más que la nota
 * sola en una lista.
 */

import { useState } from 'react'
import { useKaizen } from '@/estado/contexto'
import * as metricas from '@/dominio/metricas'
import * as f from '@/lib/fechas'
import { CabeceraSeccion } from '@/componentes/CabeceraSeccion'
import { Vacio } from '@/componentes/Vacio'
import type { Seccion } from '@/lib/rutas'

export function Revision({ ir }: { ir: (destino: Seccion) => void }) {
  const { datos } = useKaizen()
  // 0 = semana en curso, -1 = la anterior, ...
  const [desplazamiento, setDesplazamiento] = useState(0)

  const dias = f.semanaDe(f.sumarDias(f.hoy(), desplazamiento * 7))
  const activos = metricas.objetivos(datos)
  const rotulo = `${f.corto(dias[0])} – ${f.corto(dias[6])}`

  const cabecera = (
    <CabeceraSeccion
      eyebrow="Revisión"
      titulo="Cierre de semana"
      subtitulo="El hansei: mirar la semana sin castigarse y decidir un solo ajuste para la siguiente."
    />
  )

  if (activos.length === 0) {
    return (
      <>
        {cabecera}
        <Vacio
          titulo="No hay semana que revisar"
          detalle="La revisión aparece en cuanto tengas objetivos activos con historial."
          accion={
            <button
              type="button"
              className="boton boton--primario"
              onClick={() => ir('objetivos')}
            >
              Crear un objetivo
            </button>
          }
        />
      </>
    )
  }

  const totalHechos = activos.reduce(
    (acc, o) => acc + metricas.cumplidosEn(datos, o.id, dias),
    0,
  )
  const totalMeta = activos.reduce((acc, o) => acc + o.frecuencia, 0)
  const propuestas = metricas.ajustes(datos, activos, dias)

  const notas = metricas.notasDe(datos, dias)

  const resumen =
    `${totalHechos} de ${totalMeta} pasos previstos` +
    (totalMeta ? ` · ${Math.round((totalHechos / totalMeta) * 100)}%` : '') +
    (desplazamiento === 0 ? ' · semana en curso' : '')

  return (
    <>
      {cabecera}

      <section className="tarjeta">
        <div className="mes__nav">
          <button
            type="button"
            className="boton boton--icono"
            aria-label="Semana anterior"
            onClick={() => setDesplazamiento((d) => d - 1)}
          >
            ←
          </button>
          <h3 className="mes__titulo">{rotulo}</h3>
          <button
            type="button"
            className="boton boton--icono"
            aria-label="Semana siguiente"
            disabled={desplazamiento >= 0}
            onClick={() => setDesplazamiento((d) => Math.min(0, d + 1))}
          >
            →
          </button>
        </div>

        <p className="revision__resumen">{resumen}</p>

        <div className="revision__lista">
          {activos.map((o) => {
            const hechos = metricas.cumplidosEn(datos, o.id, dias)
            const alcanzada = hechos >= o.frecuencia
            return (
              <div key={o.id} className="revision__fila">
                <div className="revision__info">
                  <span className="revision__nombre">{o.nombre}</span>
                  <span
                    className={`revision__marcador${alcanzada ? ' revision__marcador--ok' : ''}`}
                  >
                    {hechos} / {o.frecuencia}
                  </span>
                </div>
                <div className="revision__puntos">
                  {dias.map((d) => {
                    const clave = f.clave(d)
                    const marcado = metricas.estaMarcado(datos, o.id, clave)
                    const clases = [
                      'revision__punto',
                      marcado ? 'revision__punto--lleno' : '',
                      f.esFuturo(d) ? 'revision__punto--futuro' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')
                    return <span key={clave} className={clases} title={f.corto(d)} />
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="tarjeta">
        <h3 className="subseccion">Ajuste para la próxima semana</h3>
        {propuestas.length === 0 ? (
          <p className="ajuste__texto">
            Todo está dentro de rango. Deja los pasos como están y repite la semana.
          </p>
        ) : (
          <div className="ajustes">
            {propuestas.map((p) => (
              <div key={p.objetivo.id} className={`ajuste ajuste--${p.tono}`}>
                <p className="ajuste__objetivo">{p.objetivo.nombre}</p>
                <p className="ajuste__texto">{p.texto}</p>
                <button
                  type="button"
                  className="boton boton--texto"
                  onClick={() => ir('objetivos')}
                >
                  Editar este objetivo
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {notas.length > 0 && (
        <section className="tarjeta">
          <h3 className="subseccion">Bitácora de la semana</h3>
          <div className="lista">
            {notas.map((n) => (
              <article key={n.fecha} className="entrada">
                <p className="entrada__fecha">{f.largo(f.desdeClave(n.fecha))}</p>
                {n.mejora && <p className="entrada__mejora">{n.mejora}</p>}
                {n.obstaculo && (
                  <p className="entrada__obstaculo">
                    <span className="entrada__marca">Freno</span>
                    {n.obstaculo}
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>
      )}
    </>
  )
}

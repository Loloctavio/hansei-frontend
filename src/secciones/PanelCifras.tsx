/* PanelCifras.tsx — cómo va la acumulación.
 *
 * Kaizen no se mide por intensidad sino por continuidad, así que la pieza
 * grande no es un número sino el mapa de 53 semanas: la forma de la constancia.
 */

import type { CSSProperties, ReactNode } from 'react'
import { CATEGORIAS } from '@/tipos/dominio'
import type { Objetivo } from '@/tipos/dominio'
import { useKaizen } from '@/estado/contexto'
import * as metricas from '@/dominio/metricas'
import * as f from '@/lib/fechas'
import { Vacio } from '@/componentes/Vacio'
import type { Seccion } from '@/lib/rutas'

type EstiloConCarga = CSSProperties & Record<'--carga', string>

function nombreCategoria(id: Objetivo['categoria']): string {
  return CATEGORIAS.find((c) => c.id === id)?.nombre ?? 'Personal'
}

function Metrica({
  valor,
  etiqueta,
  sufijo,
}: {
  valor: ReactNode
  etiqueta: string
  sufijo?: string
}) {
  return (
    <div className="metrica">
      <p className="metrica__valor">
        {valor}
        {sufijo && <span className="metrica__sufijo">{sufijo}</span>}
      </p>
      <p className="metrica__etiqueta">{etiqueta}</p>
    </div>
  )
}

/** 53 columnas de 7 días, con la intensidad de cada día. */
function MapaAnual() {
  const { datos } = useKaizen()
  const activos = metricas.objetivos(datos).length || 1
  const ahora = f.hoy()

  const fin = f.sumarDias(ahora, 6 - f.indiceDia(ahora)) // domingo de esta semana
  const inicio = f.sumarDias(fin, -(53 * 7) + 1) // lunes, 53 semanas atrás

  const columnas: Date[][] = []
  let cursor = inicio
  for (let s = 0; s < 53; s++) {
    const celdas: Date[] = []
    for (let d = 0; d < 7; d++) {
      celdas.push(cursor)
      cursor = f.sumarDias(cursor, 1)
    }
    columnas.push(celdas)
  }

  return (
    <div className="mapa__marco">
      <div className="mapa">
        {columnas.map((semana, i) => (
          <div key={i} className="mapa__columna">
            {semana.map((fecha) => {
              const clave = f.clave(fecha)
              const marcas = metricas.marcasDelDia(datos, clave)
              const carga = Math.min(1, marcas / activos)
              const clases = [
                'mapa__celda',
                f.esFuturo(fecha) ? 'mapa__celda--futuro' : '',
                f.mismoDia(fecha, ahora) ? 'mapa__celda--hoy' : '',
              ]
                .filter(Boolean)
                .join(' ')

              return (
                <div
                  key={clave}
                  className={clases}
                  style={{ '--carga': carga.toFixed(2) } as EstiloConCarga}
                  title={`${f.largo(fecha)} · ${marcas} ${marcas === 1 ? 'marca' : 'marcas'}`}
                />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

export function PanelCifras({ ir }: { ir: (destino: Seccion) => void }) {
  const { datos } = useKaizen()
  const activos = metricas.objetivos(datos)

  return (
    <>
      <section className="tarjeta metricas">
        <Metrica valor={metricas.rachaGlobal(datos)} etiqueta="Racha actual" sufijo=" d" />
        <Metrica valor={metricas.totalDiasActivos(datos)} etiqueta="Días con actividad" />
        <Metrica valor={metricas.totalMarcas(datos)} etiqueta="Pasos dados" />
        <Metrica valor={activos.length} etiqueta="Objetivos activos" />
      </section>

      {activos.length === 0 ? (
        <Vacio
          titulo="Sin datos que graficar"
          detalle="Crea un objetivo y marca tu primer día; el panel se llena solo."
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
      ) : (
        <>
          <section className="tarjeta">
            <h3 className="subseccion">Consistencia por objetivo</h3>
            <div className="barras">
              {activos.map((o) => {
                const pct = metricas.consistencia(datos, o.id, 30)
                return (
                  <div key={o.id} className="barra">
                    <div className="barra__cabecera">
                      <span className="barra__nombre">{o.nombre}</span>
                      <span className="barra__valor">
                        {pct === null ? 'primera semana' : `${pct}%`}
                      </span>
                    </div>
                    <div className="barra__pista">
                      <div className="barra__relleno" style={{ width: `${pct ?? 0}%` }} />
                    </div>
                    <p className="barra__nota">
                      {nombreCategoria(o.categoria)} ·{' '}
                      {metricas.etiquetaFrecuencia(o.frecuencia)}
                    </p>
                  </div>
                )
              })}
            </div>
          </section>

          <section className="tarjeta">
            <h3 className="subseccion">Últimas 53 semanas</h3>
            <MapaAnual />
            <div className="mapa__leyenda">
              <span>Menos</span>
              <span className="mapa__muestra" data-carga="0" />
              <span className="mapa__muestra" data-carga="0.33" />
              <span className="mapa__muestra" data-carga="0.66" />
              <span className="mapa__muestra" data-carga="1" />
              <span>Más</span>
            </div>
          </section>
        </>
      )}
    </>
  )
}

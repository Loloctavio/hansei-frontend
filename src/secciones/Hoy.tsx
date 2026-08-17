/* Hoy.tsx — marcar los pasos del día y cerrar el sello. */

import type { CSSProperties } from 'react'
import type { Objetivo } from '@/tipos/dominio'
import { CATEGORIAS } from '@/tipos/dominio'
import { useKaizen } from '@/estado/contexto'
import * as metricas from '@/dominio/metricas'
import * as f from '@/lib/fechas'
import { Sello } from '@/componentes/Sello'
import { Vacio } from '@/componentes/Vacio'
import { NotaDelDia } from './NotaDelDia'
import type { Seccion } from '@/lib/rutas'

type EstiloConCarga = CSSProperties & Record<'--carga', string>

function nombreCategoria(id: Objetivo['categoria']): string {
  return CATEGORIAS.find((c) => c.id === id)?.nombre ?? 'Personal'
}

export function Hoy({ ir }: { ir: (destino: Seccion) => void }) {
  const { datos, alternarMarca } = useKaizen()
  const fecha = f.claveHoy()
  const activos = metricas.objetivos(datos)

  const pendientes = activos.filter((o) => !metricas.resueltoHoy(datos, o, fecha))
  const completo = activos.length > 0 && pendientes.length === 0

  let nota: string
  if (activos.length === 0) nota = 'Sin objetivos activos todavía.'
  else if (completo) nota = 'Día cerrado. Mañana otro uno por ciento.'
  else if (pendientes.length === 1) nota = `Queda un paso: ${pendientes[0].nombre.toLowerCase()}.`
  else nota = `Quedan ${pendientes.length} pasos por dar.`

  const semana = f.semanaDe(f.hoy())

  return (
    <>
      <div className="hero">
        <div className="hero__texto">
          <p className="eyebrow">{f.corto(f.hoy()).toUpperCase()}</p>
          <h2 className="hero__titulo">{completo ? 'Día completo' : 'Hoy'}</h2>
          <p className="hero__nota">{nota}</p>
        </div>
        <div className={`sello-dia${completo ? ' sello-dia--tinta' : ''}`} aria-hidden="true">
          <span className="sello-dia__glifo">改</span>
        </div>
      </div>

      {activos.length === 0 ? (
        <Vacio
          titulo="Nada que marcar todavía"
          detalle="Define tu primer objetivo y su paso mínimo para empezar a acumular sellos."
          accion={
            <button
              type="button"
              className="boton boton--primario"
              onClick={() => ir('objetivos')}
            >
              Ir a objetivos
            </button>
          }
        />
      ) : (
        <>
          <div className="lista">
            {activos.map((o) => {
              const marcado = metricas.estaMarcado(datos, o.id, fecha)
              const r = metricas.racha(datos, o.id)
              const cuota =
                o.frecuencia < 7
                  ? `${metricas.cumplidosEstaSemana(datos, o.id)} de ${o.frecuencia} esta semana`
                  : null

              return (
                <article key={o.id} className={`tarjeta paso${marcado ? ' paso--hecho' : ''}`}>
                  <div className="paso__cuerpo">
                    <p className="paso__area">{nombreCategoria(o.categoria)}</p>
                    <h3 className="paso__nombre">{o.nombre}</h3>
                    {o.pasoMinimo && <p className="paso__minimo">{o.pasoMinimo}</p>}
                    <p className="paso__pie">
                      <span>
                        Racha {r.valor} {r.unidad}
                      </span>
                      {cuota && <span className="paso__cuota">{cuota}</span>}
                    </p>
                  </div>
                  <Sello
                    marcado={marcado}
                    semilla={o.id + fecha}
                    tamano="grande"
                    etiqueta={marcado ? 'Quitar la marca de hoy' : 'Marcar como hecho hoy'}
                    onAlternar={() => void alternarMarca(o.id, fecha)}
                  />
                </article>
              )
            })}
          </div>

          {/* Repaso corto de la semana, para dar contexto sin salir de la vista. */}
          <section className="tarjeta semana">
            <h3 className="subseccion">Esta semana</h3>
            <div className="semana__rejilla">
              {semana.map((d) => {
                const clave = f.clave(d)
                const marcas = metricas.marcasDelDia(datos, clave)
                const carga = activos.length ? Math.min(1, marcas / activos.length) : 0
                const clases = [
                  'semana__dia',
                  f.mismoDia(d, f.hoy()) ? 'semana__dia--hoy' : '',
                  f.esFuturo(d) ? 'semana__dia--futuro' : '',
                ]
                  .filter(Boolean)
                  .join(' ')

                return (
                  <div
                    key={clave}
                    className={clases}
                    style={{ '--carga': carga.toFixed(2) } as EstiloConCarga}
                    title={`${f.corto(d)} · ${marcas} de ${activos.length}`}
                  >
                    <span className="semana__inicial">{f.INICIALES[f.indiceDia(d)]}</span>
                    <span className="semana__punto" />
                  </div>
                )
              })}
            </div>
          </section>

          <NotaDelDia />
        </>
      )}
    </>
  )
}

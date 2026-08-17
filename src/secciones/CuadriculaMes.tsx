/* CuadriculaMes.tsx — el registro completo, mes por mes y editable.
 *
 * Sirve para corregir olvidos, no para inventar historia: los días futuros
 * quedan deshabilitados.
 */

import { useState } from 'react'
import { useKaizen } from '@/estado/contexto'
import * as metricas from '@/dominio/metricas'
import * as f from '@/lib/fechas'
import { Sello } from '@/componentes/Sello'
import { Vacio } from '@/componentes/Vacio'
import type { Seccion } from '@/lib/rutas'

interface MesVisible {
  anio: number
  mes: number
}

export function CuadriculaMes({ ir }: { ir: (destino: Seccion) => void }) {
  const { datos, alternarMarca } = useKaizen()
  const ahora = f.hoy()
  const [visible, setVisible] = useState<MesVisible>({
    anio: ahora.getFullYear(),
    mes: ahora.getMonth(),
  })

  const activos = metricas.objetivos(datos)

  if (activos.length === 0) {
    return (
      <Vacio
        titulo="La cuadrícula está vacía"
        detalle="Necesitas al menos un objetivo activo para llevar registro."
        accion={
          <button type="button" className="boton boton--primario" onClick={() => ir('objetivos')}>
            Crear un objetivo
          </button>
        }
      />
    )
  }

  const dias = f.diasDelMes(visible.anio, visible.mes)
  const enMesActual =
    visible.anio === ahora.getFullYear() && visible.mes === ahora.getMonth()

  function mover(delta: number) {
    const d = new Date(visible.anio, visible.mes + delta, 1)
    // No se navega al futuro: no hay nada que registrar ahí.
    if (
      d.getFullYear() > ahora.getFullYear() ||
      (d.getFullYear() === ahora.getFullYear() && d.getMonth() > ahora.getMonth())
    ) {
      return
    }
    setVisible({ anio: d.getFullYear(), mes: d.getMonth() })
  }

  return (
    <section className="tarjeta mes">
      <div className="mes__nav">
        <button
          type="button"
          className="boton boton--icono"
          aria-label="Mes anterior"
          onClick={() => mover(-1)}
        >
          ←
        </button>
        <h3 className="mes__titulo">
          {f.MESES[visible.mes]} {visible.anio}
        </h3>
        <button
          type="button"
          className="boton boton--icono"
          aria-label="Mes siguiente"
          disabled={enMesActual}
          onClick={() => mover(1)}
        >
          →
        </button>
      </div>

      <div className="rejilla__marco">
        <div className="rejilla">
          <div className="rejilla__fila rejilla__fila--encabezado">
            <div className="rejilla__etiqueta" />
            {dias.map((d) => (
              <div
                key={f.clave(d)}
                className={`rejilla__dia${f.mismoDia(d, ahora) ? ' rejilla__dia--hoy' : ''}`}
              >
                {d.getDate()}
              </div>
            ))}
          </div>

          {activos.map((o) => {
            const hechos = metricas.cumplidosEn(datos, o.id, dias)
            return (
              <div key={o.id} className="rejilla__fila">
                <div className="rejilla__etiqueta">
                  <span className="rejilla__nombre">{o.nombre}</span>
                  <span className="rejilla__conteo">
                    {hechos} / {dias.length}
                  </span>
                </div>
                {dias.map((d) => {
                  const clave = f.clave(d)
                  const marcado = metricas.estaMarcado(datos, o.id, clave)
                  const futuro = f.esFuturo(d)
                  return (
                    <div key={clave} className="rejilla__celda">
                      <Sello
                        marcado={marcado}
                        semilla={o.id + clave}
                        tamano="mini"
                        deshabilitado={futuro}
                        etiqueta={`${o.nombre} · ${f.largo(d)}${marcado ? ' · hecho' : ' · sin marcar'}`}
                        onAlternar={() => void alternarMarca(o.id, clave)}
                      />
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>

      <p className="mes__pie">Desliza en horizontal si el mes no cabe en la pantalla.</p>
    </section>
  )
}

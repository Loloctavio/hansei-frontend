/* Progreso.tsx — antes eran dos secciones del rail.
 *
 * Consistencia (el registro editable) y Panel (las cifras) responden a la misma
 * pregunta: cómo voy. Estaban compitiendo por atención en la navegación y ahora
 * son dos vistas de una sola sección: la cuadrícula para corregir, las cifras
 * para leer la tendencia.
 */

import { useState } from 'react'
import { CabeceraSeccion } from '@/componentes/CabeceraSeccion'
import { CuadriculaMes } from './CuadriculaMes'
import { PanelCifras } from './PanelCifras'
import type { Seccion } from '@/lib/rutas'

type Vista = 'registro' | 'cifras'

const VISTAS: { id: Vista; etiqueta: string }[] = [
  { id: 'registro', etiqueta: 'Registro' },
  { id: 'cifras', etiqueta: 'Cifras' },
]

export function Progreso({ ir }: { ir: (destino: Seccion) => void }) {
  const [vista, setVista] = useState<Vista>('registro')

  return (
    <>
      <CabeceraSeccion
        eyebrow="Progreso"
        titulo="Cómo va la acumulación"
        subtitulo="El registro es para corregir olvidos; las cifras, para leer la tendencia de los últimos 30 días."
      />

      <div className="subtabs" role="tablist" aria-label="Vistas de progreso">
        {VISTAS.map((v) => (
          <button
            key={v.id}
            type="button"
            role="tab"
            id={`subtab-${v.id}`}
            aria-selected={vista === v.id}
            aria-controls={`panel-${v.id}`}
            className={`subtabs__boton${vista === v.id ? ' subtabs__boton--activo' : ''}`}
            onClick={() => setVista(v.id)}
          >
            {v.etiqueta}
          </button>
        ))}
      </div>

      <div
        className="subtabs__panel"
        role="tabpanel"
        id={`panel-${vista}`}
        aria-labelledby={`subtab-${vista}`}
      >
        {vista === 'registro' ? <CuadriculaMes ir={ir} /> : <PanelCifras ir={ir} />}
      </div>
    </>
  )
}

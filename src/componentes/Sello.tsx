/* Sello.tsx — el sello hanko. La pieza firma del producto.
 *
 * Marcar un día es estampar un sello 改, no palomear una casilla. El giro sale
 * del id más la fecha para que sea estable entre redibujados.
 */

import type { CSSProperties } from 'react'
import { inclinacion } from '@/lib/inclinacion'

/** CSSProperties no admite variables propias sin ensanchar el tipo. */
type EstiloConVar = CSSProperties & Record<'--giro', string>

interface Props {
  marcado: boolean
  /** Semilla del giro: normalmente `objetivoId + claveFecha`. */
  semilla: string
  tamano: 'grande' | 'mini'
  /** Texto para lectores de pantalla y tooltip. */
  etiqueta: string
  deshabilitado?: boolean
  onAlternar: () => void
}

export function Sello({ marcado, semilla, tamano, etiqueta, deshabilitado, onAlternar }: Props) {
  const clases = [
    'sello',
    `sello--${tamano}`,
    marcado ? 'sello--tinta' : '',
    deshabilitado ? 'sello--futuro' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type="button"
      className={clases}
      style={{ '--giro': inclinacion(semilla) } as EstiloConVar}
      disabled={deshabilitado}
      aria-pressed={marcado}
      aria-label={etiqueta}
      title={etiqueta}
      onClick={onAlternar}
    >
      <span className="sello__glifo" aria-hidden="true">
        改
      </span>
    </button>
  )
}

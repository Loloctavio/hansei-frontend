/* Vacio.tsx — estado vacío con una invitación a actuar, nunca un mensaje neutro. */

import type { ReactNode } from 'react'

interface Props {
  titulo: string
  detalle: string
  accion?: ReactNode
}

export function Vacio({ titulo, detalle, accion }: Props) {
  return (
    <div className="vacio">
      <p className="vacio__titulo">{titulo}</p>
      <p className="vacio__detalle">{detalle}</p>
      {accion}
    </div>
  )
}

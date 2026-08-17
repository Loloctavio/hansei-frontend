/* DocumentoLegal.tsx — el armazón compartido de términos y privacidad.
 *
 * Lleva pestañas entre los dos documentos porque casi nunca se lee uno solo, y
 * un botón de volver que respeta de dónde vino el usuario: desde la app se
 * regresa a la app, desde fuera a la landing.
 */

import type { ReactNode } from 'react'
import { MARCA } from '@/marca'
import { LEGALES, TITULOS } from '@/lib/rutas'
import type { Legal, Ruta } from '@/lib/rutas'
import { PiePublico } from './PiePublico'

interface Props {
  activo: Legal
  ir: (destino: Ruta) => void
  /** A dónde regresa el botón de volver. */
  volverA: Ruta
  volverTexto: string
  children: ReactNode
}

export function DocumentoLegal({ activo, ir, volverA, volverTexto, children }: Props) {
  return (
    <div className="publico">
      <header className="publico__barra">
        <div className="publico__logo">
          <span className="publico__logo-kanji" aria-hidden="true">
            反省
          </span>
          <span className="publico__logo-texto">{MARCA.nombre}</span>
        </div>
        <button type="button" className="boton" onClick={() => ir(volverA)}>
          {volverTexto}
        </button>
      </header>

      <main className="publico__cuerpo">
        <div className="documento">
          <div className="subtabs" role="tablist" aria-label="Documentos legales">
            {LEGALES.map((l) => (
              <button
                key={l}
                type="button"
                role="tab"
                aria-selected={l === activo}
                className={`subtabs__boton${l === activo ? ' subtabs__boton--activo' : ''}`}
                onClick={() => ir(l)}
              >
                {TITULOS[l]}
              </button>
            ))}
          </div>

          <article className="documento__cuerpo">
            <h1 className="documento__titulo">{TITULOS[activo]}</h1>
            <p className="documento__fecha">
              {MARCA.empresa} · Última actualización: {MARCA.actualizado}
            </p>
            {children}
          </article>
        </div>
      </main>

      <PiePublico ir={ir} />
    </div>
  )
}

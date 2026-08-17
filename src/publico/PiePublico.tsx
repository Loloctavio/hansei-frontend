/* PiePublico.tsx — el pie de la parte pública: autoría y enlaces legales. */

import { MARCA } from '@/marca'
import type { Ruta } from '@/lib/rutas'

export function PiePublico({ ir }: { ir: (destino: Ruta) => void }) {
  return (
    <footer className="publico__pie">
      <div className="publico__pie-marca">
        <p className="publico__pie-empresa">{MARCA.empresa}</p>
        <p className="publico__pie-credito">
          Desarrollado por {MARCA.desarrollador}
        </p>
      </div>

      <nav className="publico__pie-enlaces" aria-label="Documentos legales">
        <button type="button" className="boton boton--texto" onClick={() => ir('terminos')}>
          Términos y condiciones
        </button>
        <button type="button" className="boton boton--texto" onClick={() => ir('privacidad')}>
          Aviso de privacidad
        </button>
      </nav>
    </footer>
  )
}

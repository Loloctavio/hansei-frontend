/* Rail.tsx — navegación lateral y sesión.
 *
 * Cuatro secciones. Antes eran seis: Consistencia y Panel se fusionaron en
 * Progreso, y la nota diaria de Bitácora se movió a Hoy, donde se escribe, con
 * su relectura en Revisión, donde se piensa.
 */

import { SECCIONES, TITULOS } from '@/lib/rutas'
import type { Seccion } from '@/lib/rutas'
import { useAuth } from '@/auth/contexto'

interface Props {
  seccion: Seccion
  ir: (destino: Seccion) => void
}

export function Rail({ seccion, ir }: Props) {
  const { usuario, salir, remoto } = useAuth()

  return (
    <nav className="rail" aria-label="Secciones">
      <div className="marca">
        <span className="marca__kanji" aria-hidden="true">
          改善
        </span>
        <h1 className="marca__texto">
          Kaizen Tracker
          <span className="marca__pie">Un 1% al día</span>
        </h1>
      </div>

      <ul className="rail__lista">
        {SECCIONES.map((s) => (
          <li key={s}>
            <button
              type="button"
              className={`rail__enlace${s === seccion ? ' rail__enlace--activo' : ''}`}
              aria-current={s === seccion ? 'page' : undefined}
              onClick={() => ir(s)}
            >
              {TITULOS[s]}
            </button>
          </li>
        ))}
      </ul>

      <div className="rail__sesion">
        {usuario && (
          <>
            <p className="rail__usuario">
              <span className="rail__usuario-nombre">{usuario.nombre}</span>
              {remoto && usuario.email && (
                <span className="rail__usuario-correo">{usuario.email}</span>
              )}
            </p>
            <button type="button" className="boton boton--texto" onClick={() => void salir()}>
              {remoto ? 'Cerrar sesión' : 'Cambiar de perfil'}
            </button>
          </>
        )}
        <p className="rail__lema">El paso correcto es el que puedes dar en tu peor día.</p>
      </div>
    </nav>
  )
}

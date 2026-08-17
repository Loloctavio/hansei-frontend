/* Landing.tsx — la primera pantalla, antes del acceso.
 *
 * No vende rachas ni intensidad, que es lo que vende la categoría entera.
 * Vende lo contrario, que es lo único que esta app hace distinto: cuando fallas
 * seguido, el problema es el tamaño del paso, no tu voluntad.
 */

import { MARCA } from '@/marca'
import type { Ruta } from '@/lib/rutas'
import { PiePublico } from './PiePublico'

const PILARES = [
  {
    kanji: '一',
    titulo: 'Un paso mínimo',
    texto:
      'Cada objetivo se define por la versión de un minuto: lo que harías incluso en tu peor día. Si no cabe en un mal día, es demasiado grande.',
  },
  {
    kanji: '改',
    titulo: 'Un sello al día',
    texto:
      'Marcar no es palomear una casilla: es estampar un sello. Un gesto por día, y la cuadrícula se va llenando sola.',
  },
  {
    kanji: '反',
    titulo: 'Una revisión por semana',
    texto:
      'El cierre de semana mira lo que pasó sin castigarte y propone un solo ajuste. Bajo 50% de consistencia, sugiere achicar el paso.',
  },
]

const CONTRASTES = [
  {
    titulo: 'No te castiga por romper la racha',
    texto:
      'El día en curso nunca rompe una racha, y la semana en curso tampoco. Una racha perdida no es un fracaso que haya que exhibir.',
  },
  {
    titulo: 'No te pide más voluntad',
    texto:
      'Cuando la consistencia baja, la app no sube el tono: propone bajar el listón. Un hábito que sobrevive a tus peores semanas vale más que uno intenso que dura doce días.',
  },
  {
    titulo: 'No secuestra tus datos',
    texto:
      'Todo tu historial se exporta a un archivo con un clic, y se vuelve a importar igual de fácil. Una app que guarda años de tus hábitos no debería retenerlos.',
  },
]

export function Landing({ ir }: { ir: (destino: Ruta) => void }) {
  return (
    <div className="publico">
      <header className="publico__barra">
        <div className="publico__logo">
          <span className="publico__logo-kanji" aria-hidden="true">
            反省
          </span>
          <span className="publico__logo-texto">{MARCA.nombre}</span>
        </div>
        <button type="button" className="boton" onClick={() => ir('acceso')}>
          Entrar
        </button>
      </header>

      <main className="publico__cuerpo">
        <section className="portada">
          <p className="eyebrow">{MARCA.lema}</p>
          <h1 className="portada__titulo">
            El paso correcto es el que puedes dar en tu peor día.
          </h1>
          <p className="portada__texto">{MARCA.descripcion}</p>
          <div className="portada__acciones">
            <button
              type="button"
              className="boton boton--primario"
              onClick={() => ir('acceso')}
            >
              Empezar
            </button>
            <a className="boton" href="#como-funciona">
              Cómo funciona
            </a>
          </div>
        </section>

        <section className="publico__seccion" id="como-funciona">
          <h2 className="publico__titulo">Cómo funciona</h2>
          <div className="pilares">
            {PILARES.map((p) => (
              <article key={p.titulo} className="pilar">
                <span className="pilar__kanji" aria-hidden="true">
                  {p.kanji}
                </span>
                <h3 className="pilar__titulo">{p.titulo}</h3>
                <p className="pilar__texto">{p.texto}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="publico__seccion">
          <h2 className="publico__titulo">En qué se diferencia</h2>
          <div className="contrastes">
            {CONTRASTES.map((c) => (
              <article key={c.titulo} className="contraste">
                <h3 className="contraste__titulo">{c.titulo}</h3>
                <p className="contraste__texto">{c.texto}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="cierre">
          <p className="cierre__cita">
            改善 — kaizen: mejora continua. Un uno por ciento al día, sostenido, supera a
            cualquier arranque heroico que no llega a marzo.
          </p>
          <button
            type="button"
            className="boton boton--primario"
            onClick={() => ir('acceso')}
          >
            Empezar ahora
          </button>
        </section>
      </main>

      <PiePublico ir={ir} />
    </div>
  )
}

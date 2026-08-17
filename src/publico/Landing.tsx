/* Landing.tsx — la primera pantalla, antes del acceso.
 *
 * No vende rachas ni intensidad: vende que el paso quepa en tu peor día, que es
 * lo único que esta app hace distinto. Cuando fallas seguido, el problema es el
 * tamaño del paso, no tu voluntad.
 *
 * Las secciones describen lo que la app hace, en concreto. Nada de definirse
 * por lo que otras apps supuestamente hacen mal: es una promesa sobre un rival
 * imaginario, y el visitante no tiene forma de comprobarla.
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

const RASGOS = [
  {
    titulo: 'El seguimiento cabe en un vistazo',
    texto:
      'Un sello por día sobre una cuadrícula que cubre el año entero. Las rachas, la consistencia y los totales se calculan solos: no hay que llevar la cuenta a mano.',
  },
  {
    titulo: 'Hay espacio para escribir el día',
    texto:
      'Dos líneas al cerrar: qué mejoraste y qué te frenó. Con el tiempo, los obstáculos que se repiten se vuelven visibles, y ahí suele estar la siguiente mejora.',
  },
  {
    titulo: 'Tus datos salen en un archivo',
    texto:
      'Todo tu historial se exporta con un clic y se vuelve a importar igual de fácil. Sirve para cambiar de dispositivo, guardar un respaldo o llevarte los años que ya registraste.',
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
          <h2 className="publico__titulo">Lo que hay dentro</h2>
          <div className="rasgos">
            {RASGOS.map((r) => (
              <article key={r.titulo} className="rasgo">
                <h3 className="rasgo__titulo">{r.titulo}</h3>
                <p className="rasgo__texto">{r.texto}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="cierre">
          <p className="cierre__cita">
            改善 — kaizen: mejora continua. Un uno por ciento al día, sostenido, supera a
            cualquier arranque heroico.
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

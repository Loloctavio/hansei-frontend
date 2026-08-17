/* FormularioObjetivo.tsx — alta y edición de un objetivo.
 *
 * El padre lo monta con `key` distinta según lo que se esté editando, así que el
 * estado local arranca limpio sin necesidad de sincronizar props con useEffect.
 */

import { useState } from 'react'
import type { CategoriaId, EntradaObjetivo, Frecuencia, Objetivo } from '@/tipos/dominio'
import { CATEGORIAS, FRECUENCIAS } from '@/tipos/dominio'

interface Props {
  /** null para un objetivo nuevo. */
  objetivo: Objetivo | null
  onGuardar: (entrada: EntradaObjetivo) => Promise<void>
  onCancelar: () => void
}

export function FormularioObjetivo({ objetivo, onGuardar, onCancelar }: Props) {
  const esNuevo = objetivo === null

  const [nombre, setNombre] = useState(objetivo?.nombre ?? '')
  const [pasoMinimo, setPasoMinimo] = useState(objetivo?.pasoMinimo ?? '')
  const [categoria, setCategoria] = useState<CategoriaId>(objetivo?.categoria ?? 'personal')
  const [frecuencia, setFrecuencia] = useState<Frecuencia>(objetivo?.frecuencia ?? 7)
  const [aviso, setAviso] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function enviar() {
    const limpio = nombre.trim()
    if (!limpio) {
      setAviso('Ponle un nombre al objetivo para poder guardarlo.')
      return
    }
    setAviso(null)
    setEnviando(true)
    try {
      await onGuardar({ nombre: limpio, pasoMinimo: pasoMinimo.trim(), categoria, frecuencia })
      if (esNuevo) {
        setNombre('')
        setPasoMinimo('')
      }
    } catch {
      // El mensaje ya está en el estado global; aquí solo evitamos limpiar.
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form
      className="tarjeta form"
      onSubmit={(e) => {
        e.preventDefault()
        void enviar()
      }}
    >
      <h3 className="form__titulo">{esNuevo ? 'Nuevo objetivo' : 'Editar objetivo'}</h3>

      <label className="form__fila">
        <span className="form__etiqueta">Objetivo</span>
        <input
          className="campo"
          type="text"
          value={nombre}
          maxLength={60}
          placeholder="Leer literatura técnica"
          onChange={(e) => setNombre(e.target.value)}
        />
      </label>

      <label className="form__fila">
        <span className="form__etiqueta">Paso mínimo</span>
        <span className="form__ayuda">
          La versión de un minuto: lo que harías incluso en tu peor día.
        </span>
        <input
          className="campo"
          type="text"
          value={pasoMinimo}
          maxLength={90}
          placeholder="Abrir el paper y leer un párrafo"
          onChange={(e) => setPasoMinimo(e.target.value)}
        />
      </label>

      <div className="form__par">
        <label className="form__fila">
          <span className="form__etiqueta">Área</span>
          <select
            className="campo"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value as CategoriaId)}
          >
            {CATEGORIAS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </label>

        <label className="form__fila">
          <span className="form__etiqueta">Frecuencia</span>
          <select
            className="campo"
            value={frecuencia}
            onChange={(e) => setFrecuencia(Number(e.target.value) as Frecuencia)}
          >
            {FRECUENCIAS.map((fr) => (
              <option key={fr.valor} value={fr.valor}>
                {fr.etiqueta}
              </option>
            ))}
          </select>
        </label>
      </div>

      {aviso && <p className="form__aviso">{aviso}</p>}

      <div className="form__acciones">
        <button type="submit" className="boton boton--primario" disabled={enviando}>
          {esNuevo ? 'Crear objetivo' : 'Guardar cambios'}
        </button>
        {!esNuevo && (
          <button type="button" className="boton" onClick={onCancelar}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}

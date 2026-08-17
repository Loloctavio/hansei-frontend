/* Objetivos.tsx — qué estoy mejorando: alta, edición, archivo y borrado. */

import { useState } from 'react'
import type { EntradaObjetivo, Objetivo } from '@/tipos/dominio'
import { CATEGORIAS } from '@/tipos/dominio'
import { useKaizen } from '@/estado/contexto'
import * as metricas from '@/dominio/metricas'
import { CabeceraSeccion } from '@/componentes/CabeceraSeccion'
import { Vacio } from '@/componentes/Vacio'
import { FormularioObjetivo } from './FormularioObjetivo'

function nombreCategoria(id: Objetivo['categoria']): string {
  return CATEGORIAS.find((c) => c.id === id)?.nombre ?? 'Personal'
}

export function Objetivos() {
  const {
    datos,
    crearObjetivo,
    actualizarObjetivo,
    archivarObjetivo,
    borrarObjetivo,
  } = useKaizen()
  const [editando, setEditando] = useState<string | null>(null)

  const activos = metricas.objetivos(datos)
  const archivados = metricas.archivados(datos)
  const enEdicion = editando ? metricas.objetivoPorId(datos, editando) : null

  async function guardar(entrada: EntradaObjetivo) {
    if (enEdicion) {
      await actualizarObjetivo(enEdicion.id, entrada)
      setEditando(null)
    } else {
      await crearObjetivo(entrada)
    }
  }

  function confirmarBorrado(o: Objetivo) {
    const seguro = window.confirm(
      `Se borra "${o.nombre}" y todo su historial de marcas. ¿Continuar?`,
    )
    if (seguro) void borrarObjetivo(o.id)
  }

  function tarjeta(o: Objetivo) {
    const r = metricas.racha(datos, o.id)
    const c = metricas.consistencia(datos, o.id, 30)

    return (
      <article
        key={o.id}
        className={`tarjeta objetivo${o.archivado ? ' objetivo--archivado' : ''}`}
      >
        <div className="objetivo__cabecera">
          <div>
            <h3 className="objetivo__nombre">{o.nombre}</h3>
            <p className="objetivo__meta">
              {nombreCategoria(o.categoria)} · {metricas.etiquetaFrecuencia(o.frecuencia)}
            </p>
          </div>
          <div className="objetivo__cifras">
            <span className="cifra">{c === null ? '—' : `${c}%`}</span>
            <span className="cifra__pie">
              {c === null ? 'primera semana' : 'consistencia 30d'}
            </span>
          </div>
        </div>

        {o.pasoMinimo && (
          <p className="objetivo__paso">
            <span className="objetivo__paso-etiqueta">Paso mínimo</span>
            {o.pasoMinimo}
          </p>
        )}

        <div className="objetivo__pie">
          <span className="chip">
            Racha {r.valor} {r.unidad}
          </span>
          <span className="chip">Máxima {metricas.rachaMaxima(datos, o.id)} d</span>
          <div className="objetivo__botones">
            <button
              type="button"
              className="boton boton--texto"
              onClick={() => setEditando(o.id)}
            >
              Editar
            </button>
            <button
              type="button"
              className="boton boton--texto"
              onClick={() => void archivarObjetivo(o.id, !o.archivado)}
            >
              {o.archivado ? 'Reactivar' : 'Archivar'}
            </button>
            <button
              type="button"
              className="boton boton--texto boton--peligro"
              onClick={() => confirmarBorrado(o)}
            >
              Borrar
            </button>
          </div>
        </div>
      </article>
    )
  }

  return (
    <>
      <CabeceraSeccion
        eyebrow="Objetivos"
        titulo="Qué estoy mejorando"
        subtitulo="Cada objetivo necesita un paso mínimo. Si fallas seguido, el paso es demasiado grande — no tu voluntad."
      />

      {/* La key remonta el formulario al cambiar de objetivo, así los campos
          arrancan con los valores correctos sin sincronizar props a mano. */}
      <FormularioObjetivo
        key={enEdicion?.id ?? 'nuevo'}
        objetivo={enEdicion}
        onGuardar={guardar}
        onCancelar={() => setEditando(null)}
      />

      {activos.length === 0 ? (
        <Vacio
          titulo="Todavía no hay objetivos"
          detalle="Crea el primero arriba. Empieza con uno solo: kaizen premia la profundidad sobre la cantidad."
        />
      ) : (
        <div className="lista">{activos.map(tarjeta)}</div>
      )}

      {archivados.length > 0 && (
        <>
          <h3 className="subseccion">Archivados</h3>
          <div className="lista">{archivados.map(tarjeta)}</div>
        </>
      )}
    </>
  )
}

/* NotaDelDia.tsx — el uno por ciento de hoy.
 *
 * Vivía en su propia sección. Ahora está en Hoy, que es donde se escribe: la
 * nota se llena en el momento, no se navega hasta ella. Su relectura vive en
 * Revisión, junto a la semana que explica.
 */

import { useEffect, useState } from 'react'
import { useKaizen } from '@/estado/contexto'
import * as metricas from '@/dominio/metricas'
import { claveHoy, hoy, largo } from '@/lib/fechas'

export function NotaDelDia() {
  const { datos, guardarNota } = useKaizen()
  const fecha = claveHoy()
  const guardada = metricas.notaDe(datos, fecha)

  const [mejora, setMejora] = useState(guardada.mejora)
  const [obstaculo, setObstaculo] = useState(guardada.obstaculo)
  const [confirmado, setConfirmado] = useState(false)

  // Si los datos llegan después del primer render (carga inicial o import),
  // los campos se rellenan con lo que ya estaba escrito ese día.
  useEffect(() => {
    setMejora(guardada.mejora)
    setObstaculo(guardada.obstaculo)
  }, [guardada.mejora, guardada.obstaculo])

  useEffect(() => {
    if (!confirmado) return
    const t = window.setTimeout(() => setConfirmado(false), 2200)
    return () => window.clearTimeout(t)
  }, [confirmado])

  const sinCambios = mejora === guardada.mejora && obstaculo === guardada.obstaculo

  async function enviar() {
    await guardarNota(fecha, { mejora, obstaculo })
    setConfirmado(true)
  }

  return (
    <section className="tarjeta form">
      <div>
        <h3 className="form__titulo">Bitácora del día</h3>
        <p className="form__ayuda">
          Dos líneas bastan. Con el tiempo, los obstáculos repetidos se vuelven visibles y ahí
          está la siguiente mejora.
        </p>
      </div>

      <label className="form__fila">
        <span className="form__etiqueta">Qué mejoré</span>
        <textarea
          className="campo campo--area"
          rows={3}
          value={mejora}
          placeholder="Ajusté el pipeline para que corra en la mitad de pasos."
          onChange={(e) => setMejora(e.target.value)}
        />
      </label>

      <label className="form__fila">
        <span className="form__etiqueta">Qué me frenó</span>
        <textarea
          className="campo campo--area"
          rows={2}
          value={obstaculo}
          placeholder="Empecé tarde porque no dejé el entorno listo la noche anterior."
          onChange={(e) => setObstaculo(e.target.value)}
        />
      </label>

      <div className="form__acciones">
        <button
          type="button"
          className="boton boton--primario"
          disabled={sinCambios}
          onClick={() => void enviar()}
        >
          Guardar nota
        </button>
        <span className="form__fecha">{largo(hoy())}</span>
        {confirmado && (
          <p className="form__aviso form__aviso--ok" role="status">
            Nota guardada.
          </p>
        )}
      </div>
    </section>
  )
}

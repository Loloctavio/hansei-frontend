/* Pie.tsx — dónde viven los datos, y cómo sacarlos de ahí.
 *
 * Exportar e importar es la vía para respaldar o mudarse de navegador mientras
 * no haya backend. Cuando lo haya, sigue siendo la vía para llevarse sus datos:
 * un producto que guarda hábitos de alguien durante años no debería secuestrarlos.
 */

import { useRef } from 'react'
import { useKaizen } from '@/estado/contexto'
import { claveHoy } from '@/lib/fechas'
import { MARCA } from '@/marca'
import type { Ruta } from '@/lib/rutas'

export function Pie({ ir }: { ir: (destino: Ruta) => void }) {
  const { etiquetaAlmacen, aviso, exportar, importar, avisar } = useKaizen()
  const entrada = useRef<HTMLInputElement>(null)

  function descargar() {
    const url = URL.createObjectURL(new Blob([exportar()], { type: 'application/json' }))
    const enlace = document.createElement('a')
    enlace.href = url
    enlace.download = `hansei-${claveHoy()}.json`
    document.body.appendChild(enlace)
    enlace.click()
    document.body.removeChild(enlace)
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    avisar('Respaldo descargado.')
  }

  async function alElegirArchivo(archivo: File) {
    try {
      await importar(await archivo.text())
      avisar('Datos restaurados.')
    } catch (e) {
      avisar(e instanceof Error ? e.message : 'No se pudo leer el archivo.')
    }
  }

  return (
    <footer className="pie">
      <div className="pie__contenido">
        <span className="pie__motor">{etiquetaAlmacen}</span>
        <span className="pie__mensaje" aria-live="polite">
          {aviso}
        </span>
        <div className="pie__acciones">
          <button type="button" className="boton boton--texto" onClick={descargar}>
            Exportar datos
          </button>
          <button
            type="button"
            className="boton boton--texto"
            onClick={() => entrada.current?.click()}
          >
            Importar datos
          </button>
          <input
            ref={entrada}
            type="file"
            accept="application/json,.json"
            className="oculto"
            onChange={(ev) => {
              const archivo = ev.target.files?.[0]
              if (archivo) void alElegirArchivo(archivo)
              ev.target.value = ''
            }}
          />
        </div>
      </div>

      <div className="pie__legal">
        <span>
          {MARCA.empresa} · {MARCA.desarrollador}
        </span>
        <button type="button" className="enlace" onClick={() => ir('terminos')}>
          Términos
        </button>
        <button type="button" className="enlace" onClick={() => ir('privacidad')}>
          Privacidad
        </button>
      </div>
    </footer>
  )
}

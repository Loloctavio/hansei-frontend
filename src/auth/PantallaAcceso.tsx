/* PantallaAcceso.tsx — la puerta.
 *
 * Una sola pantalla para los dos modos. En modo local no pide contraseña porque
 * no hay nada que validar y guardar una en el navegador sería seguridad de
 * mentiras; en cuanto VITE_MODO_DATOS=api aparecen correo y contraseña y el
 * mismo formulario habla con /auth/acceso y /auth/registro.
 */

import { useState } from 'react'
import type { Ruta } from '@/lib/rutas'
import { useAuth } from './contexto'

type Modo = 'entrar' | 'registrar'

export function PantallaAcceso({ ir }: { ir: (destino: Ruta) => void }) {
  const { entrar, registrar, enviando, error, remoto, limpiarError } = useAuth()
  const [modo, setModo] = useState<Modo>('entrar')
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const esRegistro = modo === 'registrar'

  function cambiarModo(nuevo: Modo) {
    setModo(nuevo)
    setPassword('')
    limpiarError()
  }

  async function enviar() {
    try {
      if (!remoto) {
        // Modo local: el nombre es lo único que da identidad al perfil.
        await registrar({ nombre: nombre.trim() || 'Tú', email: '', password: '' })
        return
      }
      if (esRegistro) await registrar({ nombre, email, password })
      else await entrar({ email, password })
    } catch {
      // El mensaje ya está en el contexto; los campos se quedan como están.
    }
  }

  return (
    <main className="acceso">
      <section className="acceso__caja">
        <div className="acceso__marca">
          <span className="acceso__kanji" aria-hidden="true">
            反省
          </span>
          <h1 className="acceso__titulo">Hansei</h1>
          <p className="acceso__lema">Un 1% al día</p>
        </div>

        {remoto && (
          <div className="subtabs" role="tablist" aria-label="Acceso">
            <button
              type="button"
              role="tab"
              aria-selected={!esRegistro}
              className={`subtabs__boton${!esRegistro ? ' subtabs__boton--activo' : ''}`}
              onClick={() => cambiarModo('entrar')}
            >
              Entrar
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={esRegistro}
              className={`subtabs__boton${esRegistro ? ' subtabs__boton--activo' : ''}`}
              onClick={() => cambiarModo('registrar')}
            >
              Crear cuenta
            </button>
          </div>
        )}

        <form
          className="acceso__form"
          onSubmit={(e) => {
            e.preventDefault()
            void enviar()
          }}
        >
          {(!remoto || esRegistro) && (
            <label className="form__fila">
              <span className="form__etiqueta">Nombre</span>
              <input
                className="campo"
                type="text"
                value={nombre}
                maxLength={60}
                autoComplete="name"
                placeholder="Tu nombre"
                onChange={(e) => setNombre(e.target.value)}
              />
            </label>
          )}

          {remoto && (
            <>
              <label className="form__fila">
                <span className="form__etiqueta">Correo</span>
                <input
                  className="campo"
                  type="email"
                  value={email}
                  required
                  autoComplete="email"
                  placeholder="tu@correo.com"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>

              <label className="form__fila">
                <span className="form__etiqueta">Contraseña</span>
                <input
                  className="campo"
                  type="password"
                  value={password}
                  required
                  minLength={8}
                  autoComplete={esRegistro ? 'new-password' : 'current-password'}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {esRegistro && <span className="form__ayuda">Mínimo 8 caracteres.</span>}
              </label>
            </>
          )}

          {error && (
            <p className="form__aviso" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="boton boton--primario" disabled={enviando}>
            {enviando ? 'Un momento…' : esRegistro ? 'Crear cuenta' : 'Entrar'}
          </button>
        </form>

        {!remoto && (
          <p className="acceso__nota">
            Modo local: tus datos se guardan solo en este navegador y no hay contraseña que
            validar. Al conectar el backend, esta pantalla pedirá correo y contraseña.
          </p>
        )}

        <p className="acceso__legal">
          Al continuar aceptas los{' '}
          <button type="button" className="enlace" onClick={() => ir('terminos')}>
            términos y condiciones
          </button>{' '}
          y el{' '}
          <button type="button" className="enlace" onClick={() => ir('privacidad')}>
            aviso de privacidad
          </button>
          .
        </p>

        <button type="button" className="boton boton--texto" onClick={() => ir('landing')}>
          ← Volver al inicio
        </button>
      </section>
    </main>
  )
}

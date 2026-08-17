/* main.tsx — punto de entrada. */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '@/estilos/base.css'
import '@/estilos/layout.css'
import '@/estilos/componentes.css'
import '@/estilos/acceso.css'

import { ProveedorAuth } from '@/auth/ProveedorAuth'
import { App } from '@/App'

const raiz = document.getElementById('raiz')
if (!raiz) throw new Error('Falta <div id="raiz"> en index.html.')

createRoot(raiz).render(
  <StrictMode>
    <ProveedorAuth>
      <App />
    </ProveedorAuth>
  </StrictMode>,
)

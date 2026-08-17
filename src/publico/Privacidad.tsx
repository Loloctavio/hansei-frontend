/* Privacidad.tsx — aviso de privacidad.
 *
 * ⚠️ BORRADOR. Está estructurado con los elementos que exige la LFPDPPP
 * (identidad y domicilio del responsable, finalidades, medios para limitar el
 * uso, derechos ARCO, transferencias y procedimiento de cambios), y describe
 * con precisión lo que la app hace hoy. Aun así, antes de publicar:
 *   · llenar los PENDIENTE de marca.ts (contacto y domicilio)
 *   · que un abogado lo revise
 *   · si se contrata hosting o analítica, agregarlos a transferencias
 */

import { MARCA } from '@/marca'
import type { Ruta } from '@/lib/rutas'
import { DocumentoLegal } from './DocumentoLegal'

interface Props {
  ir: (destino: Ruta) => void
  volverA: Ruta
  volverTexto: string
}

export function Privacidad({ ir, volverA, volverTexto }: Props) {
  return (
    <DocumentoLegal activo="privacidad" ir={ir} volverA={volverA} volverTexto={volverTexto}>
      <p className="documento__intro">
        {MARCA.empresa}, con domicilio en{' '}
        <span className="documento__dato">{MARCA.domicilio}</span>, es responsable del
        tratamiento de tus datos personales conforme a la Ley Federal de Protección de
        Datos Personales en Posesión de los Particulares.
      </p>

      <h2>1. Qué datos recabamos</h2>
      <p>Solo lo necesario para que la aplicación funcione:</p>
      <ul>
        <li>
          <strong>De identificación:</strong> tu nombre y tu correo electrónico, cuando
          creas una cuenta.
        </li>
        <li>
          <strong>De autenticación:</strong> tu contraseña, que se guarda siempre cifrada
          con un algoritmo de hash irreversible. Nadie en {MARCA.empresa} puede leerla.
        </li>
        <li>
          <strong>De uso:</strong> los hábitos que registras, los días que marcas y las
          notas de tu bitácora.
        </li>
      </ul>
      <p>
        No pedimos datos sensibles, y te recomendamos no escribirlos en las notas de la
        bitácora: es un cuaderno de trabajo, no un expediente clínico.
      </p>

      <h2>2. Para qué los usamos</h2>
      <p>
        <strong>Finalidades primarias</strong>, necesarias para prestarte el servicio:
      </p>
      <ul>
        <li>crear y administrar tu cuenta, y verificar tu identidad al entrar;</li>
        <li>guardar tu historial y sincronizarlo entre tus dispositivos;</li>
        <li>
          calcular tus rachas, tu consistencia y la sugerencia de ajuste de la revisión
          semanal;
        </li>
        <li>responder a lo que nos escribas y avisarte de cambios en el servicio.</li>
      </ul>
      <p>
        <strong>No hay finalidades secundarias.</strong> No usamos tus datos para
        publicidad, no elaboramos perfiles comerciales y no los vendemos ni los
        intercambiamos con nadie.
      </p>

      <h2>3. Dónde viven tus datos</h2>
      <p>
        Si usas la aplicación en modo local, tus datos se guardan únicamente en el
        almacenamiento de tu navegador y <strong>nunca salen de tu dispositivo</strong>.
        {' '}En ese modo no recibimos nada, ni siquiera tu nombre.
      </p>
      <p>
        Si usas una cuenta, tus datos se almacenan en los servidores del servicio para
        poder sincronizarlos. Aplicamos medidas de seguridad administrativas, técnicas y
        físicas razonables para protegerlos, incluido el cifrado del tránsito.
      </p>

      <h2>4. Terceros que intervienen</h2>
      <p>
        No transferimos tus datos personales a terceros para sus propios fines. Sí
        conviene que conozcas los servicios que intervienen técnicamente:
      </p>
      <ul>
        <li>
          <strong>Google Fonts.</strong> Las tipografías de la aplicación se cargan desde
          los servidores de Google, que por ese hecho reciben tu dirección IP y datos
          básicos de tu navegador. No les enviamos ninguno de tus hábitos ni de tus notas.
        </li>
        <li>
          <strong>Proveedor de alojamiento.</strong> Si usas cuenta, un proveedor de
          infraestructura almacena los datos por nuestra cuenta y bajo nuestras
          instrucciones, sin autorización para usarlos con otros fines.
        </li>
      </ul>

      <h2>5. Cookies y tecnologías similares</h2>
      <p>
        No usamos cookies publicitarias ni herramientas de analítica o rastreo. La
        aplicación usa el almacenamiento local de tu navegador para dos cosas: guardar tu
        sesión y, en modo local, guardar tu historial. Puedes borrarlo desde la
        configuración de tu navegador, teniendo en cuenta que en modo local eso también
        borra tu registro.
      </p>

      <h2>6. Tus derechos ARCO</h2>
      <p>
        Tienes derecho a <strong>acceder</strong> a tus datos, <strong>rectificarlos</strong>{' '}
        cuando sean inexactos, <strong>cancelarlos</strong> cuando consideres que no se
        requieren, y <strong>oponerte</strong> a su tratamiento para fines específicos.
      </p>
      <p>
        Para ejercerlos, escribe a{' '}
        <span className="documento__dato">{MARCA.contacto}</span> indicando tu nombre, un
        medio para responderte, la descripción clara de lo que solicitas y un documento que
        acredite tu identidad. Responderemos en un plazo máximo de 20 días hábiles.
      </p>
      <p>
        Para el derecho de acceso no hace falta que nos escribas: el botón{' '}
        <em>Exportar datos</em>, en el pie de la aplicación, te entrega todo tu historial
        en un archivo, al instante y sin trámite.
      </p>

      <h2>7. Revocación del consentimiento</h2>
      <p>
        Puedes revocar tu consentimiento en cualquier momento eliminando tu cuenta o
        escribiéndonos al correo de contacto. Al hacerlo borraremos tus datos, salvo los
        que debamos conservar por una obligación legal. Te sugerimos exportar tu historial
        antes: la eliminación es definitiva.
      </p>

      <h2>8. Limitación del uso y la divulgación</h2>
      <p>
        Además de lo anterior, puedes pedirnos que limitemos el uso o la divulgación de tus
        datos por el mismo medio de contacto. Como no los usamos con fines publicitarios ni
        los compartimos, esta limitación se traduce en la práctica en la cancelación
        descrita arriba.
      </p>

      <h2>9. Conservación</h2>
      <p>
        Conservamos tus datos mientras tu cuenta esté activa. Si la eliminas, los borramos
        de los sistemas productivos de inmediato y de los respaldos en el ciclo de rotación
        siguiente, que no excede de 90 días.
      </p>

      <h2>10. Cambios a este aviso</h2>
      <p>
        Podemos actualizar este aviso. Cualquier cambio se publicará en esta misma
        dirección y, cuando sea sustancial, lo avisaremos dentro de la aplicación antes de
        que entre en vigor. La fecha de la última actualización aparece al inicio.
      </p>

      <h2>11. Contacto</h2>
      <p>
        Para cualquier asunto relacionado con tus datos personales, escribe a{' '}
        <span className="documento__dato">{MARCA.contacto}</span>. Si consideras que tu
        derecho a la protección de datos ha sido vulnerado, puedes acudir al INAI.
      </p>
    </DocumentoLegal>
  )
}

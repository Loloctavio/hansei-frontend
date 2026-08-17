/* Terminos.tsx — términos y condiciones.
 *
 * ⚠️ BORRADOR. Redactado para describir con precisión lo que la app hace hoy,
 * pero no sustituye una revisión legal. Antes de publicar:
 *   · llenar los PENDIENTE de marca.ts (contacto y domicilio)
 *   · que un abogado lo revise, sobre todo la limitación de responsabilidad
 *   · confirmar la jurisdicción, aquí asumida como México
 */

import { MARCA } from '@/marca'
import type { Ruta } from '@/lib/rutas'
import { DocumentoLegal } from './DocumentoLegal'

interface Props {
  ir: (destino: Ruta) => void
  volverA: Ruta
  volverTexto: string
}

export function Terminos({ ir, volverA, volverTexto }: Props) {
  return (
    <DocumentoLegal activo="terminos" ir={ir} volverA={volverA} volverTexto={volverTexto}>
      <p className="documento__intro">
        Estos términos rigen el uso de {MARCA.nombre}, una aplicación de seguimiento de
        hábitos operada por {MARCA.empresa}. Al crear una cuenta o usar la aplicación,
        aceptas lo que sigue. Si no estás de acuerdo con alguna parte, no la uses.
      </p>

      <h2>1. Qué es el servicio</h2>
      <p>
        {MARCA.nombre} te permite registrar hábitos, marcar los días en que los cumpliste,
        anotar una bitácora diaria y revisar tu semana. Es una herramienta de registro
        personal: no es un servicio médico, psicológico ni de asesoría profesional de
        ningún tipo, y no debe usarse como sustituto de uno.
      </p>

      <h2>2. Tu cuenta</h2>
      <p>
        Para usar la aplicación con sincronización necesitas una cuenta. Eres responsable
        de mantener tu contraseña en secreto y de la actividad que ocurra bajo tu cuenta.
        Avísanos en cuanto detectes un uso no autorizado.
      </p>
      <p>
        Debes tener al menos 14 años para usar el servicio. Si eres menor de edad,
        necesitas el consentimiento de quien ejerza tu patria potestad o tutela.
      </p>

      <h2>3. Uso aceptable</h2>
      <p>No puedes:</p>
      <ul>
        <li>usar el servicio para actividades ilícitas o para dañar a terceros;</li>
        <li>
          intentar acceder a cuentas ajenas, ni a partes del sistema para las que no
          tengas autorización;
        </li>
        <li>
          interferir con el funcionamiento del servicio, por ejemplo con carga automatizada
          desproporcionada;
        </li>
        <li>revender el servicio o revenderlo dentro de otro producto sin permiso escrito.</li>
      </ul>

      <h2>4. Tu contenido</h2>
      <p>
        Los hábitos, marcas y notas que registres son tuyos. {MARCA.empresa} no reclama
        propiedad alguna sobre ellos. Nos otorgas únicamente el permiso técnico necesario
        para almacenarlos y mostrártelos, que es lo mínimo para que la aplicación funcione.
      </p>
      <p>
        Puedes exportar todo tu historial a un archivo JSON en cualquier momento, desde el
        pie de la aplicación, sin pedirnos nada ni esperar aprobación.
      </p>

      <h2>5. Disponibilidad</h2>
      <p>
        Hacemos lo razonable por mantener el servicio disponible, pero no garantizamos
        que funcione sin interrupciones ni sin errores. Podemos modificar o suspender
        funciones; si un cambio afecta de forma significativa tu uso, lo avisaremos con
        antelación razonable cuando sea posible.
      </p>

      <h2>6. Sin garantías</h2>
      <p>
        El servicio se ofrece “tal cual”. En la medida en que la ley lo permita,{' '}
        {MARCA.empresa} no otorga garantías de comerciabilidad, idoneidad para un fin
        determinado ni de que el servicio cumpla tus expectativas.
      </p>

      <h2>7. Límite de responsabilidad</h2>
      <p>
        En la medida en que la ley lo permita, {MARCA.empresa} no será responsable por
        daños indirectos, incidentales o consecuenciales derivados del uso o la
        imposibilidad de uso del servicio, incluida la pérdida de datos.
      </p>
      <p>
        Esto no limita la responsabilidad que no pueda excluirse legalmente. Y no te
        exime de una precaución sensata: la función de exportar existe justamente para que
        tengas tu propio respaldo.
      </p>

      <h2>8. Terminación</h2>
      <p>
        Puedes dejar de usar el servicio y eliminar tu cuenta cuando quieras. Podemos
        suspender una cuenta que incumpla estos términos, con aviso previo salvo que la
        gravedad del incumplimiento exija actuar de inmediato. Antes de cerrar una cuenta
        por nuestra iniciativa, te daremos oportunidad razonable de exportar tus datos.
      </p>

      <h2>9. Cambios a estos términos</h2>
      <p>
        Podemos actualizar estos términos. Cuando el cambio sea sustancial, lo avisaremos
        dentro de la aplicación antes de que entre en vigor. La fecha de la última
        actualización aparece al inicio de este documento.
      </p>

      <h2>10. Ley aplicable</h2>
      <p>
        Estos términos se rigen por las leyes de los Estados Unidos Mexicanos. Para
        cualquier controversia, las partes se someten a los tribunales competentes de dicha
        jurisdicción, sin perjuicio de los derechos que la legislación de protección al
        consumidor te reconozca.
      </p>

      <h2>11. Contacto</h2>
      <p>
        Para cualquier duda sobre estos términos, escribe a{' '}
        <span className="documento__dato">{MARCA.contacto}</span>.
      </p>
    </DocumentoLegal>
  )
}

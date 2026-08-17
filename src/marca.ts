/* marca.ts — quiénes somos, en un solo lugar.
 *
 * Lo usan la landing, los documentos legales y el pie. Cambiar el correo de
 * contacto o el domicilio es cambiar este archivo, no seis pantallas.
 *
 * ⚠️ Los valores marcados como PENDIENTE hay que llenarlos antes de publicar.
 * Los dejo con corchetes angulares a propósito: si se escapan a producción, se
 * ven de inmediato en pantalla en vez de pasar como texto plausible.
 */

export const MARCA = {
  nombre: 'Hansei',
  lema: 'Un 1% al día',
  descripcion:
    'Seguimiento de hábitos por pasos mínimos: sellos diarios y una revisión ' +
    'semanal que ajusta el paso en vez de exigirte más voluntad.',

  empresa: 'HayAI Labs',
  desarrollador: 'Octavio Fonseca',

  contacto: 'productos@evilpiglabs.com',

  /** PENDIENTE: domicilio fiscal. La LFPDPPP lo exige en el aviso de privacidad. */
  domicilio: '«domicilio fiscal de HayAI Labs»',

  /** Fecha de la última revisión de los documentos legales. */
  actualizado: '17 de agosto de 2026',
} as const

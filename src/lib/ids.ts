/* ids.ts — identificadores locales.
 *
 * Solo los usa el modo local. Cuando el backend está en juego, los ids los
 * genera él y estos no se llaman nunca: por eso el prefijo, para que en una
 * base de datos se distinga de inmediato un registro creado sin servidor.
 */

export function nuevoId(prefijo = 'o'): string {
  const tiempo = Date.now().toString(36)
  const azar = Math.random().toString(36).slice(2, 6)
  return `${prefijo}${tiempo}${azar}`
}

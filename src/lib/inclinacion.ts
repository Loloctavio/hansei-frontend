/* inclinacion.ts — el giro de cada sello.
 *
 * Se deriva del id del objetivo más la fecha, así que es estable entre
 * redibujados en vez de bailar en cada clic. Un sello hanko real nunca cae
 * perfectamente recto, pero tampoco cambia de ángulo solo.
 */

export function inclinacion(semilla: string): string {
  let h = 0
  for (let i = 0; i < semilla.length; i++) {
    h = (h * 31 + semilla.charCodeAt(i)) % 100_000
  }
  return `${((h % 900) / 100 - 4.5).toFixed(2)}deg`
}

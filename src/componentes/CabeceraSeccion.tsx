/* CabeceraSeccion.tsx — el encabezado que abre cada sección. */

interface Props {
  eyebrow: string
  titulo: string
  subtitulo: string
}

export function CabeceraSeccion({ eyebrow, titulo, subtitulo }: Props) {
  return (
    <header className="seccion__cabecera">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="titulo">{titulo}</h2>
      <p className="subtitulo">{subtitulo}</p>
    </header>
  )
}

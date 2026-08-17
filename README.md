# Hansei — frontend

Seguimiento de hábitos con el método kaizen: pasos mínimos, sellos diarios y una
revisión semanal que propone achicar el paso cuando la consistencia baja.

El nombre viene del *hansei*, el cierre de semana que la app pone en el centro:
mirar lo que pasó sin castigarse y decidir un solo ajuste para la semana
siguiente.

> **Nota sobre las claves de almacenamiento.** Siguen siendo `kaizen:datos`,
> `kaizen:perfil` y `kaizen:token`, y no se renombraron a propósito: cambiarlas
> dejaría huérfanos los datos de quien ya use la app. Son internas y no se ven
> en ninguna pantalla.

Este repo es **solo el frontend**. El backend vive aparte; el contrato entre los
dos está en [API.md](API.md).

## Correrlo

Requiere Node 20.19 o superior.

```bash
npm install
```

```bash
npm run dev
```

Abre <http://localhost:5173>. Arranca en **modo local**: los datos se guardan en
`localStorage` y no hace falta ningún backend.

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga en caliente |
| `npm run build` | Typecheck y build de producción en `dist/` |
| `npm run preview` | Sirve el `dist/` ya construido, para revisarlo antes de publicar |
| `npm run lint` | ESLint sobre todo el proyecto |
| `npm run typecheck` | Solo TypeScript, sin generar nada |

## Configuración

Copia `.env.example` como `.env.local` y ajusta lo que necesites. Solo las
variables con prefijo `VITE_` llegan al navegador — y todo lo que llega al
navegador es público, así que **nunca** pongas secretos ahí.

| Variable | Valores | Para qué |
|---|---|---|
| `VITE_MODO_DATOS` | `local` (defecto) · `api` | De dónde salen los datos y las cuentas |
| `VITE_API_URL` | URL sin diagonal final | Dónde está el backend |
| `VITE_TOKEN_ALMACEN` | `local` · `sesion` · `memoria` | Dónde persiste el token de sesión |
| `VITE_AUTH_COOKIES` | `true` · `false` | El backend maneja la sesión con cookies httpOnly |

Todas se leen en un único archivo, [`src/config.ts`](src/config.ts). Ningún otro
módulo toca `import.meta.env`.

## Cómo está preparado para el backend

La app corre hoy sin servidor, pero no está *escrita* como si el servidor no
existiera. Hay dos costuras, cada una con dos implementaciones que cumplen la
misma interfaz:

```
Componentes (no conocen URLs ni localStorage)
        │
        ├── ProveedorKaizen ──► Repositorio ──┬── repositorioLocal   (localStorage)
        │                                     └── repositorioApi     (HTTP)
        │
        └── ProveedorAuth ────► ServicioAuth ─┬── servicioLocal      (perfil local)
                                              └── servicioApi        (HTTP)
```

- **[`src/datos/repositorio.ts`](src/datos/repositorio.ts)** — el contrato de datos.
- **[`src/tipos/auth.ts`](src/tipos/auth.ts)** — el contrato de cuentas.
- **[`src/datos/index.ts`](src/datos/index.ts)** y
  **[`src/auth/servicio.ts`](src/auth/servicio.ts)** — los dos únicos lugares del
  proyecto donde se ramifica por modo.

Las implementaciones HTTP están **escritas y tipadas, no esbozadas**: no hay
`TODO` ni funciones vacías. Encender el backend es esto:

```bash
# .env.local
VITE_MODO_DATOS=api
VITE_API_URL=http://localhost:8080
```

No cambia ni un componente. La pantalla de acceso pasa sola de pedir un nombre a
pedir correo y contraseña, con pestañas de *Entrar* y *Crear cuenta*.

### Detalles que el backend hereda ya resueltos

- **Un solo cliente HTTP** ([`src/datos/cliente.ts`](src/datos/cliente.ts)): URL
  base, cabecera `Authorization`, parseo de errores y manejo del `401`. Un 401 en
  cualquier petición cierra la sesión y manda a la puerta, no solo en el login.
- **Token en tres modos** (`localStorage`, `sessionStorage`, memoria) y soporte
  para cookies httpOnly, que es la opción recomendada en producción.
- **Sin contraseñas en el cliente.** El modo local deliberadamente no guarda
  ninguna: en `localStorage` no protegería nada y sería un patrón malo de
  heredar. El modo `api` manda la contraseña tal cual por HTTPS y el backend la
  hashea.
- **Errores por campo**: si el backend manda `campos`, el cliente ya los expone.
- **Mutaciones granulares**: cada cambio manda solo lo que cambió y recibe solo
  la entidad afectada, en vez de volver a bajar todo el historial en cada clic.

## Estructura

```
src/
├── main.tsx                punto de entrada
├── App.tsx                 armazón: sesión, rail, sección activa
├── config.ts               el único lector de variables de entorno
├── tipos/
│   ├── dominio.ts          Objetivo, Datos, Registros… el vocabulario
│   └── auth.ts             Usuario, Sesion, ServicioAuth
├── lib/
│   ├── fechas.ts           fechas en horario local, sin UTC
│   ├── rutas.ts            enrutado por hash y las 4 secciones
│   ├── ids.ts              ids del modo local
│   └── inclinacion.ts      el giro estable de cada sello
├── dominio/
│   └── metricas.ts         rachas, consistencia y ajustes: funciones puras
├── datos/
│   ├── repositorio.ts      ⟵ el contrato
│   ├── repositorioLocal.ts
│   ├── repositorioApi.ts
│   ├── cliente.ts          el único fetch del proyecto
│   └── almacenToken.ts
├── auth/
│   ├── servicioLocal.ts · servicioApi.ts · servicio.ts
│   ├── contexto.ts · ProveedorAuth.tsx
│   └── PantallaAcceso.tsx
├── estado/
│   ├── contexto.ts
│   └── ProveedorKaizen.tsx
├── componentes/            Rail, Pie, Sello, Vacio, CabeceraSeccion
├── secciones/              Hoy, Objetivos, Progreso, Revision
└── estilos/                base, layout, componentes, acceso
```

Los contextos están partidos en `contexto.ts` (el hook) y `Proveedor*.tsx` (el
componente) a propósito: un archivo que exporta hooks y componentes a la vez
rompe el hot reload de React Refresh.

### Decisiones que conviene conocer

**El estado es exclusivamente de React.** Todo lo que devuelve el repositorio se
clona antes de entrar al estado (`structuredClone` en `ProveedorKaizen`). La
implementación local guarda sus propios objetos y los muta al editar; sin el clon
compartiríamos referencias y una mutación externa cambiaría el estado sin que
React se enterara.

**Enrutado por hash, sin router.** Cuatro secciones no justifican
`react-router`, y el hash tiene una ventaja concreta: el `dist/` se sirve desde
cualquier lado sin reglas de rewrite. Si aparecen rutas profundas (un objetivo
por URL), se reemplaza [`src/lib/rutas.ts`](src/lib/rutas.ts) y nada más.

**Las fechas nunca pasan por UTC.** `fechas.ts` construye las claves
`AAAA-MM-DD` con los getters locales. Es el bug más fácil de introducir aquí:
marcar un hábito a las 11 de la noche no debe registrarse en el día siguiente.

**Las cifras se calculan en el cliente.** `metricas.ts` son funciones puras sobre
`Datos`, sin React ni navegador: se pueden testear sin montar nada y portar al
servidor si algún día conviene.

## Qué cambió frente a la versión anterior

Esto era una app de scripts clásicos colgados de un namespace global `Kaizen`,
sin build ni dependencias, pensada para abrirse con doble clic.

- **Vite + React + TypeScript** en lugar del namespace global. Ya no funciona con
  doble clic: se corre con `npm run dev` o se sirve el `dist/`.
- **Cuatro secciones en el rail en lugar de seis.** *Consistencia* y *Panel*
  respondían a la misma pregunta y ahora son dos vistas de **Progreso**
  (*Registro* y *Cifras*). *Bitácora* se partió en dos según el momento de uso:
  la nota del día se escribe en **Hoy**, y se relee en **Revisión** dentro de la
  semana que explica, en vez de en una lista plana aparte. Nada se perdió; el
  historial completo se alcanza navegando semanas hacia atrás.
- **Cuentas.** Antes no había sesión. Ahora hay pantalla de acceso y todo el
  andamiaje de auth, funcionando en local y listo para el backend.
- **Cálculos separados de la persistencia.** Antes `store.js` mezclaba estado,
  almacenamiento y matemáticas; ahora son tres capas.

Los datos de la versión anterior se migran solos: si existe la clave
`kaizen:estado` y no la nueva `kaizen:datos`, se lee y se reescribe con la nueva.

## Diseño

Papel cuadriculado de taller — el *gemba* donde nació el kaizen — con sellos
*hanko* en bermellón (*shu-iro*). Marcar un día es estampar un sello 改, no
palomear una casilla. Es el único lugar donde el diseño sube la voz; el resto se
mantiene en tinta *sumi* sobre papel.

La inclinación de cada sello se deriva del id del objetivo más la fecha, así que
es estable entre redibujados en vez de bailar en cada clic.

Tipografías: Zen Kaku Gothic New para títulos y el glifo del sello, Karla para
texto corrido, IBM Plex Mono para cifras y rótulos. Se cargan de Google Fonts;
sin conexión el sistema sustituye sin romper el diseño.

## Dónde viven los datos

En modo local, en `localStorage` bajo `kaizen:datos`, y el perfil bajo
`kaizen:perfil`. El pie de página dice siempre cuál está activo.

**Exportar** e **Importar** mueven todo a un JSON. Es la vía para respaldar o
mudarse de navegador mientras no haya backend — y sigue siendo la vía para que
alguien se lleve sus datos cuando lo haya. Una app que guarda los hábitos de una
persona durante años no debería secuestrarlos.

## Pendientes

- **Pruebas.** `metricas.ts` y `fechas.ts` son funciones puras y son el lugar
  obvio para empezar (Vitest); la lógica de rachas tiene casos de borde que
  merecen quedar fijados.
- Recordatorio diario con la API de notificaciones.
- Vista de un solo objetivo con su historia completa.
- Detección de patrones en los frenos anotados.
- Etiquetas propias además de las cuatro áreas fijas.

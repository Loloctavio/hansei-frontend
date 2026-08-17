# Contrato de API

Este documento es el acuerdo entre este repo y el del backend. El frontend ya
tiene escrita e integrada la implementación que consume estas rutas
([`src/datos/repositorioApi.ts`](src/datos/repositorioApi.ts) y
[`src/auth/servicioApi.ts`](src/auth/servicioApi.ts)); en cuanto el backend las
responda, se pone `VITE_MODO_DATOS=api` y la app funciona sin tocar un
componente.

Si el backend necesita desviarse de algo de aquí, el ajuste va en esos dos
archivos y en este documento. Ningún componente conoce URLs.

## Convenciones

- **Base URL**: `VITE_API_URL`, sin diagonal final. Todas las rutas son relativas.
- **Formato**: JSON en petición y respuesta. `Content-Type: application/json`.
- **Fechas de día**: string `AAAA-MM-DD`, interpretada en el huso del usuario, no
  en UTC. Es el punto más fácil de romper: si el backend normaliza a UTC, marcar
  un hábito a las 11 de la noche en México se guarda en el día siguiente.
- **Marcas de tiempo**: ISO 8601 con huso (`creado`, `expira`).
- **Usuario**: se deduce del token. **Ninguna ruta lleva el id del usuario.** El
  backend filtra por el dueño del token en cada consulta.
- **Autorización**: `Authorization: Bearer <token>` en todo lo que no sea
  `/auth/registro` ni `/auth/acceso`.

### Errores

Cualquier código >= 400 con este cuerpo:

```json
{
  "error": {
    "codigo": "credenciales_invalidas",
    "mensaje": "Correo o contraseña incorrectos.",
    "campos": { "email": "Este correo ya está registrado." }
  }
}
```

- `mensaje` se muestra tal cual al usuario, así que debe venir en español y ser
  accionable. El frontend tiene mensajes por defecto por código HTTP si falta.
- `campos` es opcional, para errores de validación por campo.
- El cliente también acepta `{ "error": "texto" }`, `{ "mensaje": "..." }` o
  `{ "message": "..." }`. Un 401 en cualquier ruta borra el token local y manda
  al usuario a la pantalla de acceso.

### CORS

En desarrollo el frontend corre en `http://localhost:5173`. El backend debe
permitir ese origen, los métodos `GET, POST, PATCH, PUT, DELETE, OPTIONS` y las
cabeceras `Authorization, Content-Type`. Si se usan cookies httpOnly, además
`Access-Control-Allow-Credentials: true` y un origen explícito (no `*`).

---

## Autenticación

### `POST /auth/registro`

Público. Crea la cuenta y deja al usuario dentro.

```json
{ "nombre": "Octavio", "email": "octavio@ejemplo.com", "password": "..." }
```

**201**

```json
{
  "usuario": { "id": "u_123", "nombre": "Octavio", "email": "octavio@ejemplo.com", "creado": "2026-08-17T09:12:00-06:00" },
  "token": "eyJhbGci...",
  "expira": "2026-09-16T09:12:00-06:00"
}
```

- `409` si el correo ya existe.
- `400` con `campos` si la contraseña no cumple la política.
- La contraseña llega en claro sobre HTTPS y el backend la hashea (argon2id o
  bcrypt). El frontend no la transforma: cualquier hash del lado del cliente
  sería teatro.

### `POST /auth/acceso`

Público.

```json
{ "email": "octavio@ejemplo.com", "password": "..." }
```

**200** con la misma forma que el registro. `401` con
`codigo: "credenciales_invalidas"` si no cuadra. Conviene el mismo mensaje para
correo inexistente y contraseña mala, para no revelar qué correos existen.

### `GET /auth/yo`

Devuelve el usuario del token. Es la comprobación de sesión al arrancar.

**200** → el objeto `usuario` a secas (no envuelto).
**401** si el token falta, expiró o es inválido.

El frontend solo llama aquí si tiene un token guardado o si está en modo
cookies, así que un `401` significa sesión vencida, no primera visita.

### `POST /auth/salir`

Invalida el refresh token o la cookie. **204**. El frontend borra el token local
pase lo que pase, así que puede fallar sin romper nada.

### Sesión: token o cookie

Dos esquemas soportados sin cambiar componentes:

| | `VITE_AUTH_COOKIES=false` (defecto) | `VITE_AUTH_COOKIES=true` |
|---|---|---|
| El backend devuelve | `token` en el cuerpo | `Set-Cookie` httpOnly, `token: null` |
| El frontend manda | `Authorization: Bearer` | `credentials: include` |
| Guardado en | `VITE_TOKEN_ALMACEN` | nada del lado del cliente |

Las cookies httpOnly son la opción más resistente a XSS y la recomendable para
producción; exigen `SameSite`, `Secure` y protección CSRF en el backend.

---

## Datos

### `GET /datos`

Todo el estado del usuario en una llamada. Es el arranque de la app.

**200**

```json
{
  "version": 1,
  "objetivos": [
    {
      "id": "o_abc",
      "nombre": "Leer literatura técnica",
      "categoria": "aprendizaje",
      "pasoMinimo": "Abrir el paper y leer un párrafo",
      "frecuencia": 7,
      "creado": "2026-06-01",
      "archivado": false
    }
  ],
  "registros": { "o_abc": { "2026-08-17": true } },
  "bitacora": {
    "2026-08-17": { "mejora": "...", "obstaculo": "..." }
  }
}
```

- `categoria`: `salud` | `aprendizaje` | `trabajo` | `personal`.
- `frecuencia`: entero 1–7, veces por semana. 7 = diario.
- `registros` incluye **solo los días marcados**. Un día sin marca no aparece;
  no se manda `false`. Con años de historial esto importa.
- Cualquiera de las tres partes puede venir ausente o vacía.

> Cuando el historial crezca, esta ruta es el primer cuello de botella. La forma
> natural de paginarla es aceptar `?desde=AAAA-MM-DD` y que el frontend pida los
> últimos ~400 días, que es todo lo que las vistas necesitan (el mapa cubre 53
> semanas). El cambio sería local a `repositorioApi.cargar()`.

### `POST /objetivos`

```json
{ "nombre": "...", "categoria": "aprendizaje", "pasoMinimo": "...", "frecuencia": 7 }
```

**201** → el objetivo completo, con el `id` y el `creado` que asigna el servidor.
El frontend usa lo que devuelva, no lo que mandó.

### `PATCH /objetivos/:id`

Actualización parcial. Cualquier subconjunto de `nombre`, `categoria`,
`pasoMinimo`, `frecuencia`, `archivado`. Archivar y reactivar son este mismo
endpoint con `{ "archivado": true|false }`.

**200** → el objetivo completo ya actualizado. `404` si no es del usuario.

### `DELETE /objetivos/:id`

Borra el objetivo **y todas sus marcas**. La interfaz ya lo confirma con el
usuario y lo advierte explícitamente. **204**.

### `PUT /objetivos/:objetivoId/registros/:fecha`

Sella o quita el sello de un día.

```json
{ "hecho": true }
```

**204**. Idempotente a propósito: mandar `true` dos veces deja una sola marca, y
`false` sobre un día sin marcar no es un error. Así dos clics rápidos o un
reintento de red no corrompen nada.

- `400` si `fecha` no es `AAAA-MM-DD`.
- El backend debería rechazar fechas futuras (`400`): la interfaz ya las
  deshabilita, pero la regla es de negocio.

### `PUT /bitacora/:fecha`

```json
{ "mejora": "...", "obstaculo": "..." }
```

**204**. Si ambos campos llegan vacíos, **se borra** la nota de ese día en vez de
guardar una vacía.

### `PUT /datos`

Reemplaza todo el historial del usuario. Es lo que usa *Importar datos*, con el
mismo cuerpo que devuelve `GET /datos`.

**200** → el estado resultante, con la misma forma que `GET /datos`.

Es destructivo y conviene tratarlo así: validar la forma completa antes de
escribir, hacerlo en una transacción, y considerar un límite de tamaño. Los ids
del archivo importado pueden no existir en la base; el backend decide si los
respeta o los reasigna, y devuelve la verdad en la respuesta.

---

## Lo que el frontend calcula por su cuenta

Rachas, consistencia a 30 días, totales y el ajuste semanal propuesto se
calculan en el cliente, en [`src/dominio/metricas.ts`](src/dominio/metricas.ts).
Son funciones puras sobre `Datos`, sin dependencias de React ni del navegador.

El backend **no necesita** implementar nada de eso. Si más adelante conviene
moverlo al servidor (para notificaciones, resúmenes por correo o informes), ese
archivo se porta casi tal cual y las reglas ya están documentadas ahí:

- **Racha diaria**: días consecutivos hasta hoy. Si hoy no está marcado, se
  cuenta desde ayer — el día en curso no rompe la racha.
- **Racha semanal** (frecuencia < 7): semanas consecutivas que alcanzaron la
  cuota. La semana en curso tampoco la rompe.
- **Consistencia**: logradas / esperadas en la ventana, con
  `esperadas = round(dias * frecuencia / 7)`. Devuelve `null` con menos de 7 días
  de vida del objetivo, porque antes de eso el porcentaje es ruido.

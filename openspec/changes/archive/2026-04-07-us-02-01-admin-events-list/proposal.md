## Why

L'administradora necessita un punt d'entrada centralitzat per veure tots els esdeveniments (publicats i esborranys) de Sala Onirica. Sense aquest llistat, no és possible accedir a les accions de gestió (editar, eliminar, publicar) ni tenir visió global del catàleg. Correspon a PE-14 (US-02-01).

## What Changes

- **Nou endpoint** `GET /api/admin/events` al backend Laravel: retorna tots els esdeveniments independentment de l'estat `publicat`, protegit per `auth:sanctum` + validació de rol `admin`.
- **Nova pàgina** `/admin/events` al frontend Nuxt 3: taula amb nom, data, hora, recinte, estat (badge Publicat/Esborrany), i accions per fila (Editar, Eliminar, Publicar/Despublicar).
- **Middleware de backend**: validació de rol `admin` aplicada a totes les rutes `/api/admin/*`.

## Capabilities

### New Capabilities

- `admin-events-list`: Endpoint REST i pàgina d'administració que llista tots els esdeveniments amb el seu estat, i exposa accions de gestió per fila.

### Modified Capabilities

- `frontend-admin-middleware`: Ampliació per garantir que la ruta `/admin/events` redirigeix a `/` si el token és absent o el rol no és `admin`.

## Impact

- **Backend (Laravel)**: nou `AdminEventController` amb mètode `index`, ruta `GET /api/admin/events`, middleware de rol admin compartit per totes les rutes `/api/admin/*`.
- **Frontend (Nuxt 3)**: nova pàgina `pages/admin/events.vue` amb `ssr: false`, crida a l'API via store o `useFetch`, reutilitza el middleware `admin.ts` existent.
- **Tests**: tests unitaris per al controlador (retorn d'events, 401 sense token, 403 sense rol admin) i tests de component per a la pàgina (renderitzat de la taula, badge d'estat).
- **Cap canvi** a esquema de BD — l'entitat `Event` ja existeix (dep. US-01-03).

## Why

Les dades d'una projecció (descripció, data, venue) poden canviar abans de la venda. L'administradora necessita poder corregir la informació d'un event existent sense haver de recrear-lo ni afectar les reserves actives. Jira: PE-16 (US-02-03).

## What Changes

- Nou endpoint `PUT /api/admin/events/:id` al mòdul `admin` del backend NestJS, protegit per middleware `X-Admin-Token`.
- L'endpoint actualitza els camps generals de l'event (`name`, `slug`, `description`, `date`, `venue`).
- Si l'event té reserves actives o `order_items` associats, **no** es permet modificar `price_categories` ni la distribució de seients: la resposta és `422 Unprocessable Entity` amb el missatge `"No és possible modificar les categories mentre hi ha reserves actives"`.
- Nova pàgina frontend `/admin/events/[id]` amb `ssr: false` i middleware `admin`, que carrega les dades actuals i envia el formulari d'edició.

## Capabilities

### New Capabilities

- `admin-event-edit`: Cobreix el comportament de l'endpoint `PUT /api/admin/events/:id` (validació de reserves actives, 422, 200, 404) i la pàgina frontend `/admin/events/[id]` per editar events existents.

### Modified Capabilities

_(cap canvi de requisits en specs existents)_

## Impact

- **Backend** — mòdul `admin` (`AdminController`, `AdminService`): nou mètode `update` amb lògica de guarda per reserves actives.
- **Frontend** — nova pàgina `pages/admin/events/[id].vue`; la pàgina de llistat `/admin/events` ja ha d'enroutar a l'edició.
- **Tests** — nous tests unitaris al backend (`admin.controller.spec.ts`, `admin.service.spec.ts`) i test de component pel frontend (`pages/admin/events/[id].spec.ts`).
- **No breaking changes** — l'endpoint `GET /api/admin/events` i `POST /api/admin/events` no es modifiquen.

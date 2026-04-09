## Why

L'administradora necessita controlar el cicle de vida dels events: preparar les projeccions internament (esborrany) i publicar-les quan sigui el moment. Sense el toggle de publicació, qualsevol event creat és immediatament visible al públic, impossibilitant la preparació anticipada. Jira: [PE-18](https://lightweight-fitness.atlassian.net/browse/PE-18) (US-02-05).

## What Changes

- Nou botó "Publicar / Despublicar" a la pàgina `/admin/events` (llistat d'events), fent una crida `PUT /api/admin/events/:id` amb `{ published: true/false }`.
- L'endpoint `PUT /api/admin/events/:id` (ja existent) accepta el camp `published` i el persisteix.
- `GET /api/events` (portada pública) filtra els events amb `published = false` i no els inclou a la resposta.
- Feedback visual immediat: l'etiqueta/badge d'estat de l'event a la llista canvia sense recarregar la pàgina.

## Capabilities

### New Capabilities

- `admin-event-publish`: Cobreix el comportament del toggle de publicació: la crida `PUT /api/admin/events/:id` amb `{ published: bool }`, la lògica de filtratge de `GET /api/events` per events no publicats, i la interacció del botó a la pàgina `/admin/events`.

### Modified Capabilities

- `admin-event-edit`: Ampliar la spec per cobrir explícitament l'acceptació del camp `published` al `PUT /api/admin/events/:id` i el seu comportament de persistència.

## Impact

- **Laravel**: `AdminEventController@update` — ja accepta el payload parcialment; cal assegurar que `published` és un camp omplible (`$fillable`).
- **Laravel**: `EventController@index` (ruta pública `GET /api/events`) — afegir filtre `where('published', true)`.
- **Frontend (Nuxt 3)**: pàgina `/admin/events` — afegir botó de toggle per fila, crida a l'store o al composable d'events admin, i actualització reactiva de la llista.
- **Mòduls afectats**: `admin` (AdminEventController), `events` (EventController — ruta pública).
- **Sense impacte en**: WebSocket gateway, reservations, orders, shared types.

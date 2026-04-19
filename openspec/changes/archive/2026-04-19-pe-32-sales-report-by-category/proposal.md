## Why

L'administradora de Sala Onirica necessita saber quines categories de preu (VIP, General, etc.) han funcionat millor per poder planificar la distribució de seients en futures projeccions. Fins ara el panell `/admin` mostra estadístiques en temps real per event, però no ofereix cap desglossament per categoria; aquesta informació és necessària per tancar EP-06.

## What Changes

- Nou endpoint `GET /api/admin/reports` al backend (Node/NestJS, mòdul `admin`) que retorna agregats per categoria: nom, total seients, seients venuts, % d'ocupació i recaptació total.
- Nova secció de taula d'informes a la pàgina `/admin` del frontend (Nuxt 3) que mostra els resultats de l'endpoint.
- La consulta és estàtica (no requereix WebSocket ni actualització en temps real).

## Capabilities

### New Capabilities

- `admin-sales-report`: Endpoint `GET /api/admin/reports` i taula d'informes a `/admin` que mostren la recaptació i l'ocupació desglossades per categoria de preu. Inclou lògica de servei al mòdul `admin`, accés protegit per `X-Admin-Token`, i tests unitaris Vitest per al servei.

### Modified Capabilities

- `admin-realtime-dashboard`: S'afegeix la taula d'informes per categoria com a nova secció de la pàgina `/admin`, que ja existeix com a punt d'entrada del panell d'administració.

## Impact

- **Backend**: Nou mètode `getSalesReport()` a `AdminService` + nou endpoint a `AdminController`. Consulta sobre `PriceCategory`, `Seat` i `OrderItem`. Cap canvi a la lògica de temps real.
- **Frontend**: `pages/admin/index.vue` s'amplia amb una nova secció de taula; s'afegeix un `useFetch` o `$fetch` per cridar `/api/admin/reports`.
- **Tests**: Tests unitaris Vitest per a `AdminService.getSalesReport()` amb `PrismaService` mockejat.
- **Jira**: PE-32 (US-06-02)

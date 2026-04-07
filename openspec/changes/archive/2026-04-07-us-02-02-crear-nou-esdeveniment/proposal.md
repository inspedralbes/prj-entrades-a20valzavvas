## Why

L'administradora de Sala Onirica necessita poder afegir noves projeccions al sistema. Sense l'endpoint de creació (`POST /api/admin/events`), no hi ha manera de posar entrades en venda. Aquesta és la funcionalitat central del panell d'administració (EP-02).

## What Changes

- **Nou endpoint** `POST /api/admin/events` al backend Laravel que crea transaccionalment: un `Event`, les seves `PriceCategory` i tots els `Seat` (un per seient, amb `estat: DISPONIBLE`).
- **Validació de slug únic**: si el slug ja existeix, retorna `409 Conflict`.
- **Validació de data futura**: la data de l'event ha de ser posterior al moment de la creació.
- **Form Request Laravel** `StoreEventRequest` amb les regles de validació.
- **Pàgina frontend** `/admin/events/new` (CSR, `ssr:false`) amb formulari de creació.
- Registre de la nova rota `Route::post('/events', ...)` al grup `admin` de `routes/api.php`.

## Capabilities

### New Capabilities

- `admin-event-create`: Endpoint `POST /api/admin/events` amb creació transaccional de Event + PriceCategories + Seats, validació de slug únic i data futura. Inclou el formulari frontend `/admin/events/new`.

### Modified Capabilities

<!-- Cap spec existent canvia els seus requisits per a aquest canvi -->

## Impact

- **Backend (Laravel)**: `AdminEventController` (mètode `store`), nou `StoreEventRequest`, lògica transaccional a `AdminEventService` (nou) o directament al controlador. Ruta nova al grup `admin` de `routes/api.php`.
- **DB**: inserció a les taules `events`, `price_categories` i `seats`. No cal migració nova — les taules ja existeixen.
- **Frontend (Nuxt 3)**: nova pàgina `pages/admin/events/new.vue` (CSR, `ssr:false`, `middleware: 'admin'`) amb un formulari reactiu.
- **Shared types**: possiblement s'afegeix o actualitza el tipus `EventCreatePayload` a `shared/types/event.types.ts`.
- **Testing**: cal afegir tests de feature per a `AdminEventController@store` (Pest/PHPUnit al Laravel service) i tests de component per a la pàgina `admin/events/new.vue` (Vitest + @nuxt/test-utils).
- **Jira**: [PE-15 — US-02-02: Crear un nou esdeveniment](https://lightweight-fitness.atlassian.net/browse/PE-15)

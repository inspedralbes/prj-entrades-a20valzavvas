## Why

Un Comprador que vol canviar la seva selecció de seient ha d'esperar fins que expiri el TTL de 5 minuts, bloquejant innecessàriament una plaça per a la resta d'usuaris. PE-25 introdueix l'alliberament voluntari: clicar un seient `SELECCIONAT PER MI` el retorna immediatament al pool de disponibles. Jira: [PE-25](https://lightweight-fitness.atlassian.net/browse/PE-25).

## What Changes

- El frontend emet l'event WebSocket `seient:alliberar { seatId }` quan el Comprador clica un seient que ja té reservat (estat visual `SELECCIONAT_PER_MI`).
- El `SeatsGateway` (NestJS) rep l'event, valida que l'usuari és propietari de la reserva via `JwtWsGuard` (`socket.data.userId`), i delega a `LaravelClientService.releaseSeat(seatId, userId)` → `DELETE /api/seats/{seatId}/reserve`.
- El `SeatReservationController` (Laravel) valida que `reservation.user_id === userId` del JWT (`403` si no coincideix), esborra la `Reservation`, actualitza `seat.estat = DISPONIBLE` en una transacció, i retorna `204`.
- El gateway emet `seient:canvi-estat { seatId, estat: DISPONIBLE }` broadcast a la room de l'event.
- La store Pinia `reserva.ts` elimina el seient alliberat i reseteja l'estat local.
- `Seient.vue` / `MapaSeients.vue` detecten la clickabilitat per a seients `SELECCIONAT_PER_MI` i emeten `seient:alliberar` en lloc de `seient:reservar`.

## Capabilities

### New Capabilities

- `seat-release`: Alliberament voluntari d'un seient reservat via WebSocket (`seient:alliberar`). Inclou handler al gateway, endpoint `DELETE` intern a Laravel, i actualització del store Pinia.

### Modified Capabilities

- `seat-reservation`: El component `Seient.vue` i la store `reserva.ts` tanquen el cicle reserva→alliberament: un seient `SELECCIONAT_PER_MI` és ara clicable per alliberar-lo.

## Impact

- **Backend Node Service — `seats` module**: Nou handler `@SubscribeMessage('seient:alliberar')` al `SeatsGateway`; nova crida `LaravelClientService.releaseSeat(seatId, userId)`.
- **Backend Laravel Service — `seats` module**: Nou mètode de controlador `SeatReservationController::destroy()` (`DELETE /api/seats/{seatId}/reserve`) amb validació de propietat (`403`) i transacció `DB::transaction + lockForUpdate()`.
- **Frontend — `reserva.ts`**: Acció `alliberarSeient(seatId)` que emet `seient:alliberar` i neteja l'entrada del seient del store.
- **Frontend — `Seient.vue`**: Lògica de click diferenciada: si el seient és `SELECCIONAT_PER_MI`, s'emetit `seient:alliberar`; si és `DISPONIBLE`, s'emet `seient:reservar`.
- **Shared — `socket.types.ts`**: Nous tipus `SeientAlliberarPayload` (client→server) i cap nou event server→client (reutilitza `seient:canvi-estat`).
- **Testing**: Tests unitaris per al handler `seient:alliberar` al `SeatsGateway` (mock `LaravelClientService`), tests del controlador Laravel (`destroy()`), tests de l'acció `alliberarSeient` al store `reserva.ts`, i tests del component `Seient.vue` per a l'emissió de l'event correcte.

## 1. Shared — Nous tipus de socket

- [x] 1.1 Afegir `SeientReservarPayload`, `ReservaConfirmadaPayload`, `ReservaRebutjadaPayload` a `shared/types/socket.types.ts`
- [x] 1.2 Verificar que `pnpm type-check` passa al workspace `shared`

## 2. Backend — SeatsService.reservar()

- [x] 2.1 Implementar `SeatReservationController::store()` a Laravel amb `DB::transaction + lockForUpdate()` (arquitectura real: Laravel REST + NestJS WS gateway)
- [x] 2.2 Retornar `{ reservation, seat }` si `DISPONIBLE` (200) o `{ motiu }` si no (409/404/500)
- [x] 2.3 Escriure tests unitaris per a `LaravelClientService.reserveSeat()` a `laravel-client.service.spec.ts`:
  - Happy path: seient DISPONIBLE → reserva creada, retorna `ok: true`
  - Seient RESERVAT → retorna `ok: false`
  - Seient VENUT → retorna `ok: false`

## 3. Backend — SeatsGateway handler seient:reservar

- [x] 3.1 Afegir handler `@SubscribeMessage('seient:reservar')` al `SeatsGateway` que crida `LaravelClientService.reserveSeat()`
- [x] 3.2 Si `ok: true`: emetre `reserva:confirmada` al client i broadcast `seient:canvi-estat { status: RESERVAT }` a la sala `event:{eventId}`
- [x] 3.3 Si `ok: false`: emetre `reserva:rebutjada` al client (sense broadcast)
- [x] 3.4 Escriure tests unitaris per al gateway a `src/seats/seats.gateway.spec.ts`:
  - Verificar `socket.emit('reserva:confirmada', ...)` en cas d'èxit
  - Verificar `server.to(room).emit('seient:canvi-estat', ...)` en cas d'èxit
  - Verificar `socket.emit('reserva:rebutjada', ...)` en cas de rebuig

## 4. Frontend — Store Pinia reserva.ts

- [x] 4.1 Crear store `stores/reserva.ts` amb estat `{ seatId, expiraEn }` i accions `confirmarReserva(payload)` i `netejarReserva()`
- [x] 4.2 Auth via JWT (no cal sessionToken per missatge); el token JWT és gestionat per `auth.ts` i el guard WS
- [x] 4.3 Escriure tests unitaris a `stores/reserva.spec.ts`:
  - `confirmarReserva` actualitza els camps correctament
  - `netejarReserva` restableix l'estat

## 5. Frontend — Component Seient.vue

- [x] 5.1 Afegir handler de clic a `Seient.vue`: si `status === DISPONIBLE`, emetre `seient:reservar { seatId }` via `$socket`
- [x] 5.2 Bloquejar clics sobre seients `RESERVAT` o `VENUT` (no emetre res)
- [x] 5.3 Escriure tests a `components/Seient.spec.ts`:
  - Clic sobre DISPONIBLE → `socket.emit` cridat amb payload correcte
  - Clic sobre RESERVAT → `socket.emit` no cridat

## 6. Frontend — Listeners WS al composable useSocket.ts

- [x] 6.1 Afegir listener `reserva:confirmada` a `stores/seients.ts`: crida `reservaStore.confirmarReserva(payload)`
- [x] 6.2 Afegir listener `reserva:rebutjada` a `stores/seients.ts`: log de warning (no hi ha composable useSocket separat, els listeners van al store)
- [x] 6.3 Verificat que el listener `seient:canvi-estat` ja gestiona l'estat `RESERVAT` al store `seients` ✓
- [x] 6.4 Escriure tests a `stores/seients.spec.ts` (listeners reserva:confirmada, reserva:rebutjada, desconnectar)
  - Recepció de `reserva:confirmada` → `reservaStore.confirmarReserva` cridat
  - Recepció de `seient:canvi-estat { status: RESERVAT }` → store `seients` actualitzat

## 7. Verificació final

- [x] 7.1 Executar `pnpm lint` — zero errors
- [x] 7.2 Executar `pnpm type-check` — zero errors
- [x] 7.3 Executar `pnpm test` a tots els workspaces — tots els tests passen
- [x] 7.4 Prova manual: obrir dos navegadors, intentar reservar el mateix seient, verificar exclusió mútua

## Tests — Fitxers a crear

- `backend/src/seats/seats.service.spec.ts` — tests de `SeatsService.reservar()`
- `backend/src/seats/seats.gateway.spec.ts` — tests del handler `seient:reservar`
- `frontend/stores/reserva.spec.ts` — tests del store Pinia
- `frontend/components/Seient.spec.ts` — tests del component (clic + emit)
- `frontend/composables/useSocket.spec.ts` — tests dels listeners WS

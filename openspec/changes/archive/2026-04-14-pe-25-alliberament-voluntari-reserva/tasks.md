## 1. Shared Types

- [x] 1.1 Afegir `SeientAlliberarPayload { seatId: string }` a `shared/types/socket.types.ts`
- [x] 1.2 Verificar que `pnpm type-check` passa al workspace `shared`

## 2. Laravel Service — Endpoint intern release

- [x] 2.1 Afegir ruta `DELETE /api/seats/{seatId}/reserve` a `routes/api.php` protegida per `auth:sanctum`
- [x] 2.2 Implementar `SeatReservationController::destroy(seatId, Request $request)`: obrir `DB::transaction`, fer `lockForUpdate()` sobre la `Reservation`, validar `reservation.user_id === $request->user()->id` (403 si no), esborrar la reserva i actualitzar `seat.estat = DISPONIBLE`, retornar `204`
- [x] 2.3 Escriure test `SeatReservationControllerTest::test_destroy_releases_own_reservation` (DB factory, 204, BD actualitzada)
- [x] 2.4 Escriure test `SeatReservationControllerTest::test_destroy_rejects_other_user_reservation` (403, BD intacta)
- [x] 2.5 Escriure test `SeatReservationControllerTest::test_destroy_returns_404_if_reservation_not_found` (404)
- [x] 2.6 Executar `./vendor/bin/pint` (Laravel code style) i `php artisan test` — tots els tests han de passar

## 3. Node Service — LaravelClientService

- [x] 3.1 Afegir mètode `releaseSeat(seatId: string, userId: string, token: string): Promise<{ ok: boolean; motiu?: string }>` a `LaravelClientService` — crida `DELETE /api/seats/{seatId}/reserve` amb header `Authorization: Bearer <token>`
- [x] 3.2 Gestionar respostes: `204 → { ok: true }`, `403 → { ok: false, motiu: "no_autoritzat" }`, `404 → { ok: false, motiu: "reserva_no_trobada" }`
- [x] 3.3 Escriure test unitari Vitest `laravel-client.service.spec.ts::releaseSeat` — mockar `HttpService`, verificar la URL i el header, i cobrir els tres casos de resposta

## 4. Node Service — SeatsGateway handler

- [x] 4.1 Afegir `@SubscribeMessage('seient:alliberar')` al `SeatsGateway`: extreure `socket.data.userId` i `socket.data.token`, cridar `laravelClientService.releaseSeat(seatId, userId, token)`
- [x] 4.2 En cas d'èxit (`ok: true`): emetre broadcast `seient:canvi-estat { seatId, estat: 'DISPONIBLE' }` a la room `event:{eventId}`; no emetre event privat
- [x] 4.3 En cas d'error (`ok: false`): emetre `error:general { motiu }` al socket del client; no fer broadcast
- [x] 4.4 Escriure test unitari Vitest `seats.gateway.spec.ts::handleAlliberarSeient` — mockar `LaravelClientService.releaseSeat`, verificar el broadcast en cas d'èxit i l'event privat en cas d'error
- [x] 4.5 Executar `pnpm lint` i `pnpm type-check` al workspace `node-service` — ha de passar sense errors

## 5. Frontend — Store reserva.ts

- [x] 5.1 Canviar l'estat intern de `reserva.ts` de camps individuals a `seients: Record<seatId, { expiraEn: string }>` (mantenir compatibilitat amb `confirmarReserva` i `netejarReserva` existents)
- [x] 5.2 Afegir getter `esSeleccionatPerMi(seatId: string): boolean` — retorna `seatId in state.seients`
- [x] 5.3 Afegir acció `alliberarSeient(seatId: string)`: emetre `seient:alliberar { seatId }` via el plugin socket; eliminar `state.seients[seatId]` en rebre el broadcast `seient:canvi-estat { DISPONIBLE }`
- [x] 5.4 Escriure tests Vitest `stores/reserva.spec.ts`: cobrir `confirmarReserva`, `netejarReserva`, `alliberarSeient` i el getter `esSeleccionatPerMi` (socket emit mockat)

## 6. Frontend — Component Seient.vue

- [x] 6.1 Importar `esSeleccionatPerMi` del store `reserva` al component `Seient.vue`
- [x] 6.2 Modificar el handler de click: si `esSeleccionatPerMi(seat.id)` → emetre `seient:alliberar`; si `seat.estat === DISPONIBLE` → emetre `seient:reservar`; en altres estats (`RESERVAT` per altri, `VENUT`) → no fer res
- [x] 6.3 Escriure test Vitest `components/Seient.spec.ts`: verificar que el click sobre un seient `SELECCIONAT_PER_MI` emet `seient:alliberar` i que el click sobre un seient `DISPONIBLE` emet `seient:reservar`

## 7. Verificació final

- [x] 7.1 Executar `pnpm test` a tots els workspaces (`frontend`, `node-service`, `shared`) — tots els tests nous i existents han de passar
- [x] 7.2 Executar `php artisan test` al `laravel-service` — tots els tests nous i existents han de passar
- [x] 7.3 Executar `pnpm type-check` a `frontend` i `node-service` — sense errors TypeScript
- [x] 7.4 Executar `pnpm lint` a `frontend` i `node-service` i `./vendor/bin/pint` a `laravel-service` — sense errors
- [x] 7.5 Smoke test manual: arrencar l'entorn amb `docker compose up`, reservar un seient, clicar-lo de nou per alliberar-lo, verificar que tots els clients veuen el seient tornar a `DISPONIBLE`

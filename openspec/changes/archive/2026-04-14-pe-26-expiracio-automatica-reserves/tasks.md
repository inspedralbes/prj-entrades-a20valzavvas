## 1. Configuració d'entorn

- [x] 1.1 Afegir `INTERNAL_SECRET` a `src/backend/node-service/.env.example` (valor exemple: `change-me-internal-secret`)
- [x] 1.2 Afegir `INTERNAL_SECRET` a `src/backend/laravel-service/.env.example`
- [x] 1.3 Actualitzar `.env` locals amb un valor de `INTERNAL_SECRET` per a dev

## 2. Laravel Service — Endpoint intern `DELETE /api/reservations/expired`

- [x] 2.1 Crear `app/Http/Middleware/InternalSecretMiddleware.php` que valida la capçalera `X-Internal-Secret` contra `env('INTERNAL_SECRET')` i retorna `401` si no coincideix
- [x] 2.2 Registrar el middleware a `app/Http/Kernel.php` com alias `internal.secret`
- [x] 2.3 Crear el mètode `releaseExpired(): array` a `app/Services/ReservationService.php` (o nou `SeatExpiryService.php`):
  - Obre `DB::transaction()`
  - `SELECT reservations.id, seat_id, seats.event_id FROM reservations JOIN seats ... WHERE expires_at < NOW() FOR UPDATE`
  - `UPDATE seats SET estat='DISPONIBLE' WHERE id IN (...)`
  - `DELETE FROM reservations WHERE id IN (...)`
  - Retorna `[['seatId' => ..., 'eventId' => ...], ...]`
- [x] 2.4 Afegir mètode `releaseExpired(Request $request)` a `SeatReservationController` (o nou `ReservationExpiryController.php`) que crida el servei i retorna `200 { released: [...] }`
- [x] 2.5 Afegir la ruta `Route::delete('/reservations/expired', ...)` protegida amb `internal.secret` a `routes/api.php`
- [x] 2.6 Test PHPUnit per a `releaseExpired()`: escenaris — cap reserva expirada, 1 reserva expirada, N reserves de M events

## 3. Node Service — `LaravelClientService.releaseExpiredReservations()`

- [x] 3.1 Afegir interfície `ReleasedSeat { seatId: string; eventId: string }` a `laravel-client.service.ts`
- [x] 3.2 Implementar el mètode `releaseExpiredReservations(): Promise<{ released: ReleasedSeat[] }>` a `LaravelClientService`:
  - Crida `DELETE /api/reservations/expired` amb capçalera `X-Internal-Secret: <INTERNAL_SECRET>`
  - Llegeix `INTERNAL_SECRET` de `process.env.INTERNAL_SECRET`
  - Retorna `{ released: data.released }`
- [x] 3.3 Afegir test unitari Vitest per `releaseExpiredReservations()` a `laravel-client.service.spec.ts`:
  - Mock `HttpService.delete` retornant `{ released: [{ seatId: 'S1', eventId: 'E1' }] }`
  - Verifica que es crida `DELETE /api/reservations/expired` amb la capçalera correcta

## 4. Node Service — `ReservationsScheduler`

- [x] 4.1 Instal·lar `@nestjs/schedule` si no és ja present: `pnpm --filter node-service add @nestjs/schedule`
- [x] 4.2 Implementar `src/scheduler/reservations.scheduler.ts` amb `@Injectable()`:
  - Injecta `LaravelClientService` i `SeatsGateway`
  - Mètode `@Cron(CronExpression.EVERY_30_SECONDS) async releaseExpired()`:
    - Crida `laravelClient.releaseExpiredReservations()`
    - Per cada `{ seatId, eventId }` emet `seient:canvi-estat { seatId, estat: EstatSeient.DISPONIBLE }` a `event:{eventId}`
    - Captura excepcions i fa `this.logger.error(...)` sense re-llançar
- [x] 4.3 Actualitzar `scheduler/scheduler.module.ts` per importar `ScheduleModule.forRoot()` i declarar/exportar `ReservationsScheduler`
- [x] 4.4 Registrar `SchedulerModule` i `GatewayModule` a `AppModule` (si `SchedulerModule` no hi és ja)
- [x] 4.5 Crear `src/scheduler/reservations.scheduler.spec.ts` amb tests Vitest:
  - Escenari 1: `released` amb 1 seient → `server.to("event:E1").emit(...)` cridat 1 vegada
  - Escenari 2: `released` buit → `server.to().emit` no cridat
  - Escenari 3: `LaravelClientService` llança excepció → l'error és loggejat, no re-llançat

## 5. Verificació final

- [x] 5.1 `pnpm --filter node-service type-check` — 0 errors TypeScript
- [x] 5.2 `pnpm --filter node-service lint` — 0 errors ESLint
- [x] 5.3 `pnpm --filter node-service test` — tots els tests passen (incloent els nous)
- [x] 5.4 `pnpm --filter laravel-service test` (o `php artisan test`) — tests PHPUnit passen
- [x] 5.5 Verificació manual en local: crear una reserva, esperar 30s+ amb `expires_at` passat, confirmar que la BD allibera el seient i el frontend rep el broadcast

## Why

Si un usuari tanca el navegador amb seients reservats, sense neteja al servidor aquells seients quedarien bloquejats indefinidament per a la resta de compradors. PE-26 introdueix l'expiració automàtica de reserves al servidor (US-04-05): un cron job al NestJS Node Service que allibera les reserves caducades cada 30 segons i notifica tots els clients en temps real. Jira: [PE-26](https://lightweight-fitness.atlassian.net/browse/PE-26)

## What Changes

- **Nou scheduler**: `ReservationsScheduler` al mòdul `reservations` del Node Service, amb `@Cron` que s'executa cada 30 segons.
- **Lògica de neteja**: Crida `LaravelClientService.releaseExpiredReservations()` que fa `DELETE /api/reservations/expired` al Laravel Service; Laravel localitza totes les reserves amb `expires_at < NOW()`, executa la transacció (actualitza `seat.estat → DISPONIBLE`, esborra el registre `Reservation`) i retorna la llista de `seatId`s alliberats.
- **Broadcast de canvi d'estat**: Per cada `seatId` retornat, el Node Service emet `seient:canvi-estat { seatId, estat: "DISPONIBLE" }` a la room `event:{eventId}` corresponent.
- **Endpoint Laravel nou**: `DELETE /api/reservations/expired` (protegit per servei intern, sense JWT d'usuari), retorna `{ released: [{ seatId, eventId }] }`.
- **Test unitari**: `ReservationsScheduler` és testable amb Vitest mockant `LaravelClientService` i `SeatsGateway`.

## Capabilities

### New Capabilities

- `seat-expiry`: Expiració automàtica de reserves al servidor. Inclou el `ReservationsScheduler` (NestJS cron), l'endpoint intern `DELETE /api/reservations/expired` (Laravel), i el broadcast `seient:canvi-estat` per a cada seient alliberat.

### Modified Capabilities

- `seat-reservation`: S'afegeix al camp semàntic del TTL de 5 minuts la garantia que el servidor allibera la reserva si el client desapareix (complementa el comportament ja especificat d'`expires_at`).

## Impact

- **Mòdul afectat (NestJS)**: `reservations` — nou `ReservationsScheduler`, `ReservationsModule` exposa el scheduler.
- **Mòdul afectat (NestJS)**: `node-ws-jwt-guard` / `LaravelClientService` — nou mètode `releaseExpiredReservations()`.
- **Laravel Service**: nou endpoint `DELETE /api/reservations/expired` a `ReservationController`; nou `ReservationService::releaseExpired()` amb transacció PostgreSQL.
- **Cap canvi al frontend**: el client rep els broadcasts `seient:canvi-estat` existents; cap nova lògica client-side necessària.
- **Dependències**: Requereix US-04-01 (reserva temporal) i US-04-03 (temporitzador visible) ja implementats.
- **Testing**: Cal test unitari de `ReservationsScheduler` amb Vitest (mock de `LaravelClientService` i `SeatsGateway`); test de `ReservationService::releaseExpired()` amb PHPUnit (SQLite en CI).

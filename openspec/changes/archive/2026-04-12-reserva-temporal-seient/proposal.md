## Why

La reserva temporal és el mecanisme central del flux de compra (EP-04). Sense ella, cap usuari pot bloquejar un seient per completar la compra, i no es pot garantir la consistència sota alta concurrència. Ara que el mapa de seients en temps real (EP-03) ja és funcional, és el moment d'implementar la reserva com a pas previ a la compra. Jira: [PE-22](https://lightweight-fitness.atlassian.net/browse/PE-22)

## What Changes

- **NOU** — `SeatsService.reservar()`: executa `prisma.$transaction` amb `SELECT FOR UPDATE` sobre el seient demanat; si `DISPONIBLE`, crea la `Reservation` amb `expires_at = NOW() + 5min` i canvia `seatStatus` a `RESERVAT`.
- **NOU** — `SeatsGateway` gestiona l'event entrant `seient:reservar { seatId, sessionToken }`; emet `reserva:confirmada` o `reserva:rebutjada` al client i fa broadcast `seient:canvi-estat { RESERVAT }` a la sala si la reserva ha prosperat.
- **NOU** — Store Pinia `reserva.ts`: guarda `seatId`, `sessionToken`, `expiresAt` i exposa accions `confirmarReserva` i `netejarReserva`.
- **MODIFICAT** — `MapaSeients.vue` / `Seient.vue`: emeten `seient:reservar` en fer clic sobre un seient `DISPONIBLE`; escolten `reserva:confirmada` / `reserva:rebutjada` per actualitzar l'estat local.
- **MODIFICAT** — `shared/types/socket.types.ts`: afegir els tipus de payload `SeientReservarPayload`, `ReservaConfirmadaPayload`, `ReservaRebutjadaPayload`.

## Capabilities

### New Capabilities

- `seat-reservation`: Flux complet de reserva temporal d'un seient via WebSocket amb bloqueig pessimista PostgreSQL, TTL de 5 minuts i notificació en temps real a tots els clients de la sala.

### Modified Capabilities

- `realtime-seat-sync`: L'event `seient:canvi-estat` ara inclou el nou estat `RESERVAT` emès com a conseqüència d'una reserva exitosa (a més del `DISPONIBLE` existent per expiració).

## Impact

- **Mòduls backend**: `seats` (SeatsService, SeatsGateway), `reservations` (ReservationsService ja existent gestiona el TTL)
- **Mòduls frontend**: store `reserva.ts`, components `Seient.vue`, `MapaSeients.vue`, composable `useSocket.ts`
- **Shared**: `shared/types/socket.types.ts` (nous payloads)
- **Concurrència**: Dos clients que reservin el mateix seient simultàniament: el `SELECT FOR UPDATE` garanteix que només un prospera. Cap canvi d'esquema Prisma necessari (entitats `Reservation` i `Seat` ja existeixen).
- **Testing**: Nous tests unitaris per a `SeatsService.reservar()` (Vitest, mockat `prisma.$transaction`), tests del store `reserva.ts`, i tests del component `Seient.vue` per a l'emissió d'events.

## Non-goals

- Reserva de múltiples seients en una sola operació (es cobrirà en un ticket futur).
- Lògica de checkout / confirmació de compra (PE-23 o equivalent).
- Alliberament manual de la reserva per l'usuari (pot ser un ticket separat).

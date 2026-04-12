## ADDED Requirements

### Requirement: Comprador pot reservar temporalment un seient disponible

El sistema SHALL permetre a un Comprador autenticat (JWT via handshake WS) reservar temporalment un seient amb estat `DISPONIBLE` emetent l'event WebSocket `seient:reservar { seatId }`. Si la reserva prospera, el sistema MUST crear un registre `Reservation` amb `expires_at = NOW() + 5 minuts`, actualitzar `seat.estat` a `RESERVAT` dins d'una transacció atòmica, i notificar el client privadament amb `reserva:confirmada`.

#### Scenario: Reserva exitosa d'un seient disponible

- **GIVEN** el Comprador està autenticat i és a la pàgina `/events/[slug]` i el seient B5 té `estat: DISPONIBLE`
- **WHEN** el Comprador emet `seient:reservar { seatId: "B5-id" }`
- **THEN** el client rep `reserva:confirmada { seatId: "B5-id", expiraEn: <ISO en 5min> }`
- **AND** `seat.estat` a la BD és `RESERVAT`
- **AND** existeix un registre `Reservation { seat_id: "B5-id", user_id: <id> }` amb `expires_at` aproximadament 5 minuts en el futur

#### Scenario: Reserva rebutjada si el seient ja és RESERVAT

- **GIVEN** el seient B5 té `estat: RESERVAT` per un altre Comprador
- **WHEN** un segon Comprador emet `seient:reservar { seatId: "B5-id" }`
- **THEN** el segon client rep `reserva:rebutjada { seatId: "B5-id", motiu: "no_disponible" }`
- **AND** no es crea cap nova `Reservation` per al segon Comprador
- **AND** `seat.estat` a la BD continua sent `RESERVAT`

#### Scenario: Reserva rebutjada si el seient ja és VENUT

- **GIVEN** el seient B5 té `estat: VENUT`
- **WHEN** qualsevol Comprador emet `seient:reservar { seatId: "B5-id" }`
- **THEN** el client rep `reserva:rebutjada { seatId: "B5-id", motiu: "no_disponible" }`

#### Scenario: Testabilitat — LaravelClientService.reserveSeat() és testable unitàriament

- **GIVEN** `HttpService.post` és mockat per retornar un seient amb `estat: DISPONIBLE`
- **WHEN** s'invoca `LaravelClientService.reserveSeat(seatId, token)` en un test Vitest
- **THEN** el mock verifica que s'ha cridat `httpService.post('/api/seats/{seatId}/reserve', ...)` amb el token correcte
- **AND** la funció retorna `{ ok: true, reservation, seat }`

### Requirement: Exclusió mútua sota alta concurrència

El sistema MUST garantir que, si dos o més Compradors emeten `seient:reservar` per al mateix seient de forma concurrent, exactament un rep `reserva:confirmada` i la resta reben `reserva:rebutjada`. La BD MUST contenir exactament una `Reservation` activa per seient en tot moment.

#### Scenario: Dos clients competint pel mateix seient

- **GIVEN** el seient B5 té `estat: DISPONIBLE`
- **WHEN** els Compradors A i B emeten `seient:reservar { seatId: "B5-id" }` simultàniament
- **THEN** exactament un client rep `reserva:confirmada`
- **AND** l'altre client rep `reserva:rebutjada { motiu: "no_disponible" }`
- **AND** la BD conté exactament una `Reservation` per B5

#### Scenario: Tres clients en ràfega

- **GIVEN** el seient C3 té `estat: DISPONIBLE`
- **WHEN** tres Compradors emeten `seient:reservar { seatId: "C3-id" }` en menys d'1 segon
- **THEN** exactament un rep `reserva:confirmada` i els dos restants reben `reserva:rebutjada`

### Requirement: Notificació en temps real a tots els clients de la sala

Quan una reserva prospera, el sistema SHALL fer broadcast de `seient:canvi-estat { seatId, status: "RESERVAT" }` a tots els clients connectats a la sala `event:{eventId}`, incloent el Comprador que ha fet la reserva.

#### Scenario: Broadcast a la sala després de reserva exitosa

- **GIVEN** tres Compradors estan connectats a la sala `event:evt-1`
- **WHEN** un Comprador reserva exitosament el seient D7
- **THEN** els tres clients reben `seient:canvi-estat { seatId: "D7-id", status: "RESERVAT" }`
- **AND** el seient D7 es visualitza com a RESERVAT al mapa de tots els clients

#### Scenario: Cap broadcast si la reserva és rebutjada

- **GIVEN** el seient D7 ja és RESERVAT
- **WHEN** un Comprador emet `seient:reservar { seatId: "D7-id" }`
- **THEN** el Comprador rep `reserva:rebutjada`
- **AND** cap broadcast `seient:canvi-estat` s'emet a la sala

#### Scenario: Testabilitat — SeatsGateway emet els events correctes

- **GIVEN** `SeatsService.reservar` és mockat per retornar `{ ok: true, expiresAt }`
- **WHEN** el gateway gestiona l'event `seient:reservar`
- **THEN** el test verifica que s'ha cridat `socket.emit('reserva:confirmada', ...)` i `server.to(room).emit('seient:canvi-estat', ...)`

### Requirement: Store Pinia reserva.ts gestiona l'estat de la reserva activa

El frontend SHALL mantenir un store Pinia `reserva.ts` que persisti el `seatId` i `expiraEn` de la reserva activa del Comprador. El store MUST exposar accions `confirmarReserva(payload)` i `netejarReserva()`.

#### Scenario: confirmarReserva actualitza l'estat del store

- **GIVEN** el store `reserva` té estat inicial `{ seatId: null, expiraEn: null }`
- **WHEN** s'invoca `confirmarReserva({ seatId: "B5-id", expiraEn: "2026-04-12T10:05:00Z" })`
- **THEN** l'estat del store és `{ seatId: "B5-id", expiraEn: "2026-04-12T10:05:00Z" }`

#### Scenario: netejarReserva restableix l'estat

- **GIVEN** el store té una reserva activa
- **WHEN** s'invoca `netejarReserva()`
- **THEN** `seatId` i `expiresAt` tornen a `null`

#### Scenario: Testabilitat — store és testable amb Vitest

- **GIVEN** el store s'inicialitza en un test Vitest amb `setActivePinia(createPinia())`
- **WHEN** s'executen les accions `confirmarReserva` i `netejarReserva`
- **THEN** els canvis d'estat es verifiquen directament sense mocks externs

### Requirement: Component Seient.vue emet la reserva en fer clic

El component `Seient.vue` SHALL emetre l'event WS `seient:reservar { seatId }` quan un Comprador fa clic sobre un seient amb `estat: DISPONIBLE`. El component MUST ignorar clics sobre seients `RESERVAT` o `VENUT`.

#### Scenario: Clic sobre seient disponible emet l'event WS

- **GIVEN** el seient té `estat: DISPONIBLE`
- **WHEN** el Comprador fa clic sobre el seient
- **THEN** `MapaSeients.vue` emet `seient:reservar { seatId: <id> }` via `$socket`

#### Scenario: Clic sobre seient reservat no fa res

- **GIVEN** el seient té `estat: RESERVAT`
- **WHEN** el Comprador fa clic sobre el seient
- **THEN** no s'emet cap event WS

#### Scenario: Testabilitat — Seient.vue testable amb mock de socket

- **GIVEN** `$socket` és mockat en un test Vitest
- **WHEN** es simula un clic sobre un seient DISPONIBLE amb `@testing-library/vue`
- **THEN** el mock verifica que s'ha cridat `socket.emit('seient:reservar', { seatId })`

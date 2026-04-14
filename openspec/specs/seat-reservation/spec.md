## Purpose

Reserva temporal de seients amb exclusió mútua. Un Comprador autenticat pot reservar un seient disponible via WebSocket. La reserva és atòmica (DB transaction + lock) i expira al cap de 5 minuts.

## Requirements

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

---

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

---

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

---

### Requirement: Store Pinia reserva.ts gestiona l'estat de la reserva activa

El frontend SHALL mantenir un store Pinia `reserva.ts` que persisti el `seatId` i `expiraEn` de cada seient que el Comprador té reservat activament com a `seients: Record<string, { expiraEn: string }>`. El store MUST exposar accions `confirmarReserva(payload)`, `netejarReserva()`, `alliberarSeient(seatId)` i `removeSeient(seatId)`, i el getter `esSeleccionatPerMi(seatId): boolean`.

#### Scenario: confirmarReserva actualitza l'estat del store

- **GIVEN** el store `reserva` té estat inicial `{ seients: {} }`
- **WHEN** s'invoca `confirmarReserva({ seatId: "B5-id", expiraEn: "2026-04-12T10:05:00Z" })`
- **THEN** l'estat del store conté `seients["B5-id"] = { expiraEn: "2026-04-12T10:05:00Z" }`

#### Scenario: netejarReserva restableix l'estat

- **GIVEN** el store té una o més reserves actives
- **WHEN** s'invoca `netejarReserva()`
- **THEN** `seients` torna a `{}`

#### Scenario: alliberarSeient emet seient:alliberar i l'eliminació arriba via broadcast

- **GIVEN** el store té el seient C3 com a reservat (`esSeleccionatPerMi("C3-id") === true`)
- **WHEN** s'invoca `alliberarSeient("C3-id")`
- **THEN** el socket emet `seient:alliberar { seatId: "C3-id" }`
- **AND** l'entrada `seients["C3-id"]` no s'elimina directament — s'elimina quan arriba el broadcast `seient:canvi-estat { DISPONIBLE }` via `removeSeient`

#### Scenario: removeSeient elimina l'entrada del store (cridat pel broadcast handler)

- **GIVEN** el store té el seient C3 com a reservat
- **WHEN** el broadcast `seient:canvi-estat { seatId: "C3-id", estat: "DISPONIBLE" }` arriba i el handler crida `removeSeient("C3-id")`
- **THEN** l'entrada `seients["C3-id"]` és eliminada del store

#### Scenario: esSeleccionatPerMi retorna true per seients reservats per l'usuari actual

- **GIVEN** el store té `seients["B5-id"]` a l'estat
- **WHEN** s'invoca `esSeleccionatPerMi("B5-id")`
- **THEN** retorna `true`

#### Scenario: esSeleccionatPerMi retorna false per seients d'altri o disponibles

- **GIVEN** el store no té `seients["C3-id"]` (seient d'un altre usuari o disponible)
- **WHEN** s'invoca `esSeleccionatPerMi("C3-id")`
- **THEN** retorna `false`

#### Scenario: Testabilitat — store és testable amb Vitest

- **GIVEN** el store s'inicialitza en un test Vitest amb `setActivePinia(createPinia())`
- **WHEN** s'executen les accions `confirmarReserva`, `netejarReserva`, `alliberarSeient`, `removeSeient` i el getter `esSeleccionatPerMi`
- **THEN** els canvis d'estat es verifiquen directament sense mocks externs

---

### Requirement: El servidor rebutja la reserva quan el sessionToken ha assolit el límit de seients per event

El sistema SHALL comptar el nombre de `Reservation` actives associades al `sessionToken` per a l'`eventId` concret dins la transacció de reserva. Si el comptador és igual o superior a `event.max_seients_per_usuari`, el sistema MUST retornar `reserva:rebutjada { seatId, motiu: "limit_assolit" }` al client sense modificar la BD ni emetre cap broadcast a la sala.

#### Scenario: Reserva rebutjada quan el sessionToken ja té el màxim de reserves actives

- **GIVEN** que l'event té `max_seients_per_usuari: 4` i el `sessionToken` ja té exactament 4 `Reservation` actives per a aquell event
- **WHEN** el client emet `seient:reservar { seatId: "X-id" }` per a un cinquè seient disponible
- **THEN** el servidor retorna `reserva:rebutjada { seatId: "X-id", motiu: "limit_assolit" }` al client
- **AND** no es crea cap nova `Reservation` a la BD
- **AND** `seat.estat` no canvia
- **AND** cap broadcast `seient:canvi-estat` s'emet a la sala

#### Scenario: Reserva acceptada quan el sessionToken està per sota del límit

- **GIVEN** que l'event té `max_seients_per_usuari: 4` i el `sessionToken` té 3 reserves actives
- **WHEN** el client emet `seient:reservar { seatId: "Y-id" }` per a un seient disponible
- **THEN** el servidor retorna `reserva:confirmada { seatId: "Y-id", expiraEn: <ISO en 5min> }`
- **AND** es crea un nou registre `Reservation` a la BD
- **AND** `seat.estat` passa a `RESERVAT`
- **AND** la sala rep `seient:canvi-estat { seatId: "Y-id", status: "RESERVAT" }`

#### Scenario: Reserva acceptada quan el límit és 1 i el sessionToken no té reserves

- **GIVEN** que l'event té `max_seients_per_usuari: 1` i el `sessionToken` no té cap reserva activa
- **WHEN** el client emet `seient:reservar { seatId: "Z-id" }`
- **THEN** el servidor retorna `reserva:confirmada`
- **AND** es crea la `Reservation` correctament

#### Scenario: Reserva rebutjada quan el límit és 1 i el sessionToken ja té una reserva activa

- **GIVEN** que l'event té `max_seients_per_usuari: 1` i el `sessionToken` ja té 1 reserva activa
- **WHEN** el client emet `seient:reservar { seatId: "W-id" }` per a un segon seient
- **THEN** el servidor retorna `reserva:rebutjada { motiu: "limit_assolit" }`
- **AND** no es crea cap `Reservation` addicional

#### Scenario: Testabilitat — LaravelClientService mapeja HTTP 422 a limit_assolit

- **GIVEN** `HttpService.post` és mockat per retornar un error HTTP 422
- **WHEN** s'invoca `LaravelClientService.reserveSeat(seatId, token)` en un test Vitest
- **THEN** la funció retorna `{ ok: false, motiu: "limit_assolit" }`

---

### Requirement: El store Pinia reserva.ts exposa el getter limitAssolit

El store `reserva.ts` SHALL exposar un getter computat `limitAssolit: boolean` que retorna `true` quan el nombre de `seatIds` reservats activament per al `sessionToken` és igual o superior a `event.maxSeientPerUsuari`. El frontend pot usar aquest getter per desactivar el mapa de seients o mostrar un avís.

#### Scenario: limitAssolit és true quan el nombre de reserves actives és igual al límit

- **GIVEN** que `reserva.seients` conté 4 elements i `event.maxSeientPerUsuari` és 4
- **WHEN** es llegeix `reserva.limitAssolit`
- **THEN** el getter retorna `true`

#### Scenario: limitAssolit és false quan el nombre de reserves actives és inferior al límit

- **GIVEN** que `reserva.seients` conté 2 elements i `event.maxSeientPerUsuari` és 4
- **WHEN** es llegeix `reserva.limitAssolit`
- **THEN** el getter retorna `false`

#### Scenario: limitAssolit és false quan no hi ha reserves actives

- **GIVEN** que `reserva.seients` és buit
- **WHEN** es llegeix `reserva.limitAssolit`
- **THEN** el getter retorna `false`

#### Scenario: Testabilitat — getter limitAssolit és testable amb Vitest

- **GIVEN** el store s'inicialitza en un test Vitest amb `setActivePinia(createPinia())`
- **WHEN** s'estableix `reserva.seients = ['a','b','c','d']` i `event.maxSeientPerUsuari = 4`
- **THEN** `reserva.limitAssolit` retorna `true`
- **AND** en eliminar un element de `reserva.seients`, el getter retorna `false` automàticament

---

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

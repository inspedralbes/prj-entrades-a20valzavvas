## ADDED Requirements

### Requirement: Comprador pot alliberar voluntàriament un seient que ell mateix té reservat

El sistema SHALL permetre a un Comprador autenticat (JWT via handshake WS) alliberar un seient amb estat `RESERVAT` que li pertany emetent l'event WebSocket `seient:alliberar { seatId }`. Si l'alliberament prospera, el sistema MUST esborrar el registre `Reservation`, actualitzar `seat.estat` a `DISPONIBLE` dins d'una transacció atòmica, i fer broadcast `seient:canvi-estat { seatId, estat: "DISPONIBLE" }` a la room de l'event.

#### Scenario: Alliberament exitós d'un seient reservat pel propi Comprador

- **GIVEN** el Comprador A té reservat el seient C3 (`Reservation.user_id == A.id`) i és a la pàgina `/events/[slug]`
- **WHEN** el Comprador A emet `seient:alliberar { seatId: "C3-id" }`
- **THEN** la BD mostra `seat.estat: DISPONIBLE` per a C3
- **AND** el registre `Reservation` per a C3 és eliminat
- **AND** tots els clients connectats a la room reben `seient:canvi-estat { seatId: "C3-id", estat: "DISPONIBLE" }`
- **AND** la store `reserva.ts` del Comprador A elimina l'entrada de C3

#### Scenario: Alliberament rebutjat si la reserva pertany a un altre usuari

- **GIVEN** el seient C3 té una `Reservation` amb `user_id == B.id`
- **WHEN** el Comprador A (diferent de B) emet `seient:alliberar { seatId: "C3-id" }` amb el seu JWT
- **THEN** el servidor retorna `403 Forbidden` a `LaravelClientService`
- **AND** el gateway emet `error:general { motiu: "no_autoritzat" }` al Comprador A
- **AND** `seat.estat` i la `Reservation` de C3 no es modifiquen

#### Scenario: Alliberament rebutjat si la reserva no existeix (ja expirada o alliberada)

- **GIVEN** el seient D7 té `estat: DISPONIBLE` i no té cap `Reservation` activa
- **WHEN** un Comprador emet `seient:alliberar { seatId: "D7-id" }`
- **THEN** el servidor retorna `404 Not Found` a `LaravelClientService`
- **AND** el gateway emet `error:general { motiu: "reserva_no_trobada" }` al Comprador
- **AND** cap broadcast s'emet a la room

#### Scenario: Testabilitat — LaravelClientService.releaseSeat() és testable unitàriament

- **GIVEN** `HttpService.delete` és mockat per retornar `204 No Content`
- **WHEN** s'invoca `LaravelClientService.releaseSeat(seatId, userId, token)` en un test Vitest
- **THEN** el mock verifica que s'ha cridat `httpService.delete('/api/seats/{seatId}/reserve')` amb el token correcte
- **AND** la funció retorna `{ ok: true }`

---

### Requirement: El servidor valida la propietat de la reserva sense dependre del client

El sistema MUST extreure el `userId` exclusivament del JWT validat pel `JwtWsGuard` (`socket.data.userId`). El payload del client `{ seatId }` SHALL NOT contenir cap camp d'usuari. La validació de propietat les fa Laravel comparant `reservation.user_id` amb el `userId` del token.

#### Scenario: El client no pot suplantar un altre usuari al payload

- **GIVEN** un Comprador A autenticat intenta alliberar un seient d'un altre usuari enviant un payload manipulat
- **WHEN** emet `seient:alliberar { seatId: "C3-id" }` (sense camp userId al payload)
- **THEN** el gateway extreu el `userId` del JWT (`socket.data.userId`) i el passa a `LaravelClientService`
- **AND** Laravel retorna `403` perquè `reservation.user_id !== A.id`
- **AND** la reserva original queda intacta

#### Scenario: Testabilitat — SeatsGateway handler seient:alliberar és testable unitàriament

- **GIVEN** `LaravelClientService.releaseSeat` és mockat per retornar `{ ok: true }`
- **WHEN** el test Vitest dispara l'event `seient:alliberar { seatId }` al gateway amb un socket autenticat (`socket.data.userId = "user-1"`)
- **THEN** el mock verifica que `releaseSeat` s'ha cridat amb `(seatId, "user-1", token)`
- **AND** el test verifica que s'ha emès `seient:canvi-estat { seatId, estat: "DISPONIBLE" }` a la room

---

### Requirement: El Comprador pot re-reservar immediatament un seient que acaba d'alliberar

Un cop el seient ha estat alliberat amb èxit i el broadcast `seient:canvi-estat { DISPONIBLE }` s'ha aplicat al frontend, el seient SHALL ser clicable de nou per qualsevol Comprador, incloent el que l'acaba d'alliberar.

#### Scenario: Re-reserva immediata després d'alliberament

- **GIVEN** el Comprador A acaba d'alliberar C3 i ha rebut el broadcast `seient:canvi-estat { DISPONIBLE }`
- **WHEN** el Comprador A clica de nou C3 (ara visible com a `DISPONIBLE`)
- **THEN** el frontend emet `seient:reservar { seatId: "C3-id" }` (no `seient:alliberar`)
- **AND** el flux normal de reserva continua com si fos un seient nou

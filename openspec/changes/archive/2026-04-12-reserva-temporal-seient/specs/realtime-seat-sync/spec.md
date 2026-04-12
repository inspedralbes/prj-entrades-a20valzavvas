## MODIFIED Requirements

### Requirement: Broadcast de canvi d'estat dels seients a tots els clients de la sala
El sistema SHALL fer broadcast de l'event `seient:canvi-estat { seatId, status }` a tots els clients connectats a la sala `event:{eventId}` quan l'estat d'un seient canvia. Els orígens possibles del canvi d'estat inclouen: expiració de reserva pel scheduler (RESERVAT → DISPONIBLE), reserva exitosa per un Comprador (DISPONIBLE → RESERVAT), i confirmació de compra (RESERVAT → VENUT).

#### Scenario: Broadcast quan un seient passa a DISPONIBLE per expiració
- **GIVEN** una reserva del seient A1 ha expirat (`expiresAt < NOW()`)
- **WHEN** el `ReservationsScheduler` processa l'expiració
- **THEN** tots els clients de la sala `event:{eventId}` reben `seient:canvi-estat { seatId: "A1-id", status: "DISPONIBLE" }`
- **AND** el seient A1 es mostra com a disponible al mapa de tots els clients

#### Scenario: Broadcast quan un seient passa a RESERVAT per reserva exitosa
- **GIVEN** el seient B5 té `status: DISPONIBLE`
- **WHEN** un Comprador reserva exitosament el seient B5
- **THEN** tots els clients de la sala reben `seient:canvi-estat { seatId: "B5-id", status: "RESERVAT" }`
- **AND** el seient B5 es mostra com a reservat al mapa de tots els clients immediatament

#### Scenario: Broadcast quan un seient passa a VENUT per compra completada
- **GIVEN** el seient C2 té `status: RESERVAT`
- **WHEN** el Comprador completa la compra i el backend processa `compra:confirmar`
- **THEN** tots els clients de la sala reben `seient:canvi-estat { seatId: "C2-id", status: "VENUT" }`

#### Scenario: El client actualitza el store seients en rebre el broadcast
- **GIVEN** el client té el seient D4 com `DISPONIBLE` al store `seients`
- **WHEN** el client rep `seient:canvi-estat { seatId: "D4-id", status: "RESERVAT" }`
- **THEN** el store `seients` actualitza l'estat de D4 a `RESERVAT`
- **AND** el component `Seient.vue` renderitza D4 amb l'estil visual de RESERVAT

#### Scenario: Testabilitat — handler del broadcast és testable
- **GIVEN** el listener de `seient:canvi-estat` al composable `useSocket` és testable amb Vitest
- **WHEN** es simula la recepció de `seient:canvi-estat { seatId, status: "RESERVAT" }` en un test
- **THEN** es verifica que el store `seients` crida l'acció d'actualització amb el `seatId` i `status` correctes

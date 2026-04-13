## ADDED Requirements

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

#### Scenario: Testabilitat — SeatsService.reservar() és testable amb límit assolit

- **GIVEN** `PrismaService.$transaction` és mockat per retornar un comptador de reserves igual al límit de l'event
- **WHEN** s'invoca `SeatsService.reservar(seatId, sessionToken, eventId)` en un test Vitest
- **THEN** el mock verifica que no s'ha creat cap `Reservation`
- **AND** la funció retorna `{ ok: false, motiu: "limit_assolit" }`

---

## ADDED Requirements

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

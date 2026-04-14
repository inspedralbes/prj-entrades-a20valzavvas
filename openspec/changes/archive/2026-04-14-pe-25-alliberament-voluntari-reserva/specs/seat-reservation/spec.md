## MODIFIED Requirements

### Requirement: Store Pinia reserva.ts gestiona l'estat de la reserva activa

El frontend SHALL mantenir un store Pinia `reserva.ts` que persisti el `seatId` i `expiraEn` de cada seient que el Comprador té reservat activament. El store MUST exposar accions `confirmarReserva(payload)`, `netejarReserva()` i `alliberarSeient(seatId)`, i el getter `esSeleccionatPerMi(seatId)`.

#### Scenario: confirmarReserva actualitza l'estat del store

- **GIVEN** el store `reserva` té estat inicial `{ seients: {} }`
- **WHEN** s'invoca `confirmarReserva({ seatId: "B5-id", expiraEn: "2026-04-12T10:05:00Z" })`
- **THEN** l'estat del store conté `seients["B5-id"] = { expiraEn: "2026-04-12T10:05:00Z" }`

#### Scenario: netejarReserva restableix l'estat

- **GIVEN** el store té una o més reserves actives
- **WHEN** s'invoca `netejarReserva()`
- **THEN** `seients` torna a `{}`

#### Scenario: alliberarSeient emet seient:alliberar i elimina l'entrada del store

- **GIVEN** el store té el seient C3 com a reservat (`esSeleccionatPerMi("C3-id") === true`)
- **WHEN** s'invoca `alliberarSeient("C3-id")`
- **THEN** el socket emet `seient:alliberar { seatId: "C3-id" }`
- **AND** l'entrada `seients["C3-id"]` s'elimina del store en rebre el broadcast `seient:canvi-estat { DISPONIBLE }`

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
- **WHEN** s'executen les accions `confirmarReserva`, `netejarReserva`, `alliberarSeient` i el getter `esSeleccionatPerMi`
- **THEN** els canvis d'estat es verifiquen directament sense mocks externs

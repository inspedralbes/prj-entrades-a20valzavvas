## ADDED Requirements

### Requirement: SeatsGateway exposa emitStatsActualitzacio per broadcast de stats a tot el room

El `SeatsGateway` SHALL exposar el mètode públic `emitStatsActualitzacio(eventId: string, payload: StatsActualitzacioPayload): void` que emeti l'event `stats:actualitzacio` a tots els clients del room `event:{eventId}` via `this.server.to(`event:${eventId}`).emit(...)`. Altres mòduls i serveis podran injectar `SeatsGateway` i cridar aquest mètode.

#### Scenario: Broadcast stats arriba a tots els clients del room

- **GIVEN** tres clients en el room `event:evt-123`
- **WHEN** s'invoca `seatsGateway.emitStatsActualitzacio('evt-123', { disponibles: 80, reservats: 10, venuts: 10, ... })`
- **THEN** els tres clients reben l'event `stats:actualitzacio` amb el payload especificat

#### Scenario: Broadcast stats no arriba a clients d'altres rooms

- **GIVEN** un client en el room `event:evt-abc` i un altre en `event:evt-xyz`
- **WHEN** s'invoca `emitStatsActualitzacio('evt-abc', payload)`
- **THEN** únicament el client de `event:evt-abc` rep l'event; el de `event:evt-xyz` no el rep

#### Scenario: Testabilitat — emitStatsActualitzacio pot ser verificat en test unitari

- **WHEN** `SeatsGateway` és instanciat en un test amb `this.server` mockejat
- **THEN** es pot cridar `emitStatsActualitzacio` i verificar que `server.to(...).emit('stats:actualitzacio', payload)` ha estat invocat amb els arguments correctes

---

### Requirement: AdminService calcula i retorna StatsActualitzacioPayload per a un event

L'`AdminService` SHALL exposar el mètode `getEventStats(eventId: string): Promise<StatsActualitzacioPayload>` que consulti la base de dades (Prisma) per obtenir: el recompte de seients per estat (`groupBy status`), el recompte de reserves actives, i la recaptació total (`sum` de `OrderItem.price`). El `SeatsGateway` MUST cridar `adminService.getEventStats(eventId)` i posteriorment `emitStatsActualitzacio` cada vegada que un canvi d'estat de seient es processa.

#### Scenario: Stats calculades correctament per un event

- **GIVEN** un event amb 50 DISPONIBLE, 30 RESERVAT, 20 VENUT, i recaptació total de 200.00€
- **WHEN** s'invoca `adminService.getEventStats('evt-123')`
- **THEN** retorna `{ disponibles: 50, reservats: 30, venuts: 20, totalSeients: 100, percentatgeVenuts: 20, percentatgeReservats: 30, recaptacioTotal: 200.00, reservesActives: <n>, usuaris: <n> }`

#### Scenario: Stats emeses automàticament després de cada canvi d'estat de seient

- **GIVEN** un seient passa de RESERVAT a VENUT en el flux de compra
- **WHEN** el `SeatsGateway` emet `seient:canvi-estat` per aquell seient
- **THEN** immediatament després s'invoca `adminService.getEventStats(eventId)` i s'emet `stats:actualitzacio` al room `event:{eventId}`

#### Scenario: Testabilitat — integració SeatsGateway + AdminService

- **WHEN** `SeatsGateway` és instanciat en un test amb `AdminService` i `this.server` mockejats
- **THEN** en cridar el handler de canvi d'estat, es verifica que `adminService.getEventStats` és invocat i que `server.to(...).emit('stats:actualitzacio', ...)` és cridat amb el payload retornat

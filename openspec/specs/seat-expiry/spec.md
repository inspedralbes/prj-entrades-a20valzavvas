## Purpose

Alliberament automàtic de reserves caducades. Un cron job al Node Service (`ReservationsScheduler`) s'executa cada 30 segons, crida Laravel per alliberar en bloc les reserves amb `expires_at < NOW()` i propaga l'estat `DISPONIBLE` als clients via WebSocket.

## Requirements

### Requirement: El sistema allibera automàticament les reserves expirades cada 30 segons

El sistema SHALL executar un cron job (`ReservationsScheduler`) al Node Service cada 30 segons que crida `DELETE /internal/reservations/expired` al Laravel Service. Laravel MUST trobar totes les reserves amb `expires_at < NOW()`, actualitzar `seat.estat → DISPONIBLE` i eliminar els registres `Reservation` dins d'una única transacció atòmica, i retornar la llista `{ released: [{ seatId, eventId }] }`. Per cada seient alliberat, el Node Service MUST emetre `seient:canvi-estat { seatId, estat: "DISPONIBLE" }` a la room `event:{eventId}`.

#### Scenario: Una reserva expirada és alliberada i notificada en temps real

- **GIVEN** existeix una `Reservation` per al seient A1 (event E1) amb `expires_at` en el passat i `seat.estat: RESERVAT`
- **WHEN** el cron s'executa (≤ 30s des de l'expiració)
- **THEN** la BD mostra `seat.estat: DISPONIBLE` per a A1
- **AND** el registre `Reservation` de A1 ha estat eliminat
- **AND** tots els clients connectats a la room `event:E1` reben `seient:canvi-estat { seatId: "A1-id", estat: "DISPONIBLE" }`

#### Scenario: Múltiples reserves expirades de diferents events s'alliberen en una sola execució

- **GIVEN** existeixen reserves expirades per als seients B2 (event E1) i C3 (event E2)
- **WHEN** el cron s'executa
- **THEN** `seat.estat: DISPONIBLE` per a B2 i C3 a la BD
- **AND** les `Reservation` de B2 i C3 han estat eliminades
- **AND** els clients de la room `event:E1` reben el broadcast de B2
- **AND** els clients de la room `event:E2` reben el broadcast de C3

#### Scenario: Cap reserva expirada — el cron no fa res

- **GIVEN** no hi ha cap reserva amb `expires_at < NOW()`
- **WHEN** el cron s'executa
- **THEN** Laravel retorna `{ released: [] }`
- **AND** cap broadcast s'emet a cap room
- **AND** cap registre de BD és modificat

#### Scenario: Idempotència — la reserva ja alliberada voluntàriament no genera error

- **GIVEN** el Comprador A va alliberar voluntàriament el seient D4 (via `seient:alliberar`) just abans que el cron s'executi
- **WHEN** el cron s'executa i la `Reservation` de D4 ja no existeix a la BD
- **THEN** Laravel retorna `{ released: [] }` (o sense incloure D4)
- **AND** cap error es llança

---

### Requirement: L'endpoint intern `DELETE /internal/reservations/expired` és accessible únicament des del Node Service

El sistema SHALL protegir `DELETE /internal/reservations/expired` mitjançant la capçalera `X-Internal-Secret`. Laravel MUST verificar que el valor coincideix amb la variable d'entorn `INTERNAL_SECRET`. Si la capçalera és absent o incorrecta, MUST retornar `401 Unauthorized`.

#### Scenario: Crida autenticada correctament retorna les reserves alliberades

- **GIVEN** la capçalera `X-Internal-Secret` coincideix amb `INTERNAL_SECRET` configurada a Laravel
- **WHEN** `DELETE /internal/reservations/expired` és cridat pel Node Service
- **THEN** Laravel retorna `200 OK` amb `{ released: [...] }`

#### Scenario: Crida sense capçalera d'autenticació és rebutjada amb 401

- **GIVEN** la petició a `DELETE /internal/reservations/expired` no porta capçalera `X-Internal-Secret`
- **WHEN** Laravel processa la petició
- **THEN** Laravel retorna `401 Unauthorized`
- **AND** cap transacció de BD s'executa

#### Scenario: Crida amb secret incorrecte és rebutjada amb 401

- **GIVEN** la capçalera `X-Internal-Secret` porta un valor diferent a `INTERNAL_SECRET`
- **WHEN** Laravel processa la petició
- **THEN** Laravel retorna `401 Unauthorized`

---

### Requirement: El scheduler tolera errors de comunicació amb Laravel sense aturar el servei

El sistema SHALL capturar qualsevol excepció llançada per `LaravelClientService.releaseExpiredReservations()` i registrar-la al log d'errors sense re-llançar. El cron MUST continuar funcionant als ticks posteriors.

#### Scenario: Laravel inassolible — el scheduler registra l'error i continua

- **GIVEN** `LaravelClientService.releaseExpiredReservations()` llança `InternalServerErrorException` (Laravel inassolible)
- **WHEN** el cron s'executa
- **THEN** l'error és capturat i registrat (logger.error)
- **AND** el servei Node no cau ni atura el scheduler
- **AND** el proper tick del cron (30s) s'executa normalment

---

### Requirement: `ReservationsScheduler` és testable unitàriament amb Vitest

El sistema SHALL permetre testejar `ReservationsScheduler.releaseExpired()` amb Vitest mockant `LaravelClientService` i `SeatsGateway.server`.

#### Scenario: Test verifica que el broadcast s'emet per cada seient alliberat

- **GIVEN** `LaravelClientService.releaseExpiredReservations` és mockat retornant `{ released: [{ seatId: "S1", eventId: "E1" }] }`
- **AND** `SeatsGateway.server.to().emit` és un mock de Vitest
- **WHEN** `ReservationsScheduler.releaseExpired()` s'executa en el test
- **THEN** el mock verifica que `server.to("event:E1").emit("seient:canvi-estat", { seatId: "S1", estat: "DISPONIBLE" })` ha estat cridat exactament una vegada

#### Scenario: Test verifica que cap broadcast s'emet quan no hi ha reserves expirades

- **GIVEN** `LaravelClientService.releaseExpiredReservations` és mockat retornant `{ released: [] }`
- **WHEN** `ReservationsScheduler.releaseExpired()` s'executa
- **THEN** `SeatsGateway.server.to().emit` no ha estat cridat

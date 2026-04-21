## ADDED Requirements

### Requirement: Test automatitzat de concurrència per a reserves de seients

El sistema SHALL disposar d'un test d'integració Vitest a `backend/test/concurrencia.spec.ts` que verifiqui de manera determinista que dos clients Socket.IO simultanis no poden reservar el mateix seient. El test MUST arrancar una instància real de l'aplicació NestJS (`NestFactory`) contra una base de dades PostgreSQL real (injectada via `DATABASE_URL`), crear dos clients `socket.io-client`, emetre `seient:reservar` per al mateix seient via `Promise.all`, i afirmar que exactament un client rep `reserva:confirmada` i l'altre `reserva:rebutjada`, i que la BD conté exactament una `Reservation` per aquell seient.

#### Scenario: Un sol client rep reserva:confirmada quan dos emeten simultàniament

- **GIVEN** el seient S1 té `estat: DISPONIBLE` i dos clients C1 i C2 estan connectats a la mateixa sala
- **WHEN** C1 i C2 emeten `seient:reservar { seatId: "S1-id" }` via `Promise.all` en el mateix tick
- **THEN** exactament un client rep `reserva:confirmada { seatId: "S1-id" }`
- **AND** l'altre client rep `reserva:rebutjada { seatId: "S1-id", motiu: "no_disponible" }`

#### Scenario: La BD conté exactament una Reservation per seient després de la cursa

- **GIVEN** el seient S1 tenia `estat: DISPONIBLE` i dos clients han emès `seient:reservar` simultàniament
- **WHEN** ambdues respostes han estat rebudes
- **THEN** `SELECT COUNT(*) FROM "Reservation" WHERE "seatId" = 'S1-id' AND "expiresAt" > NOW()` retorna exactament 1
- **AND** `seat.estat` a la BD és `RESERVAT`

#### Scenario: El test és determinista i no depèn de temporització artificial

- **GIVEN** el test s'executa en un entorn CI amb càrrega variable
- **WHEN** `Promise.all` dispara els dos emits
- **THEN** el resultat (qui guanya i qui perd) pot variar, però l'invariant d'exclusió mútua sempre es compleix
- **AND** el test NO usa `setTimeout` ni `sleep` per sincronitzar les respostes

#### Scenario: Neteja de la BD després del test

- **GIVEN** el test ha creat una `Reservation` i ha canviat `seat.estat` a `RESERVAT`
- **WHEN** s'executa `afterAll`
- **THEN** la `Reservation` és eliminada de la BD
- **AND** `seat.estat` torna a `DISPONIBLE`
- **AND** els clients Socket.IO es desconnecten i l'app NestJS és tancada

#### Scenario: Testabilitat — el test s'executa amb pnpm --filter node-service test

- **GIVEN** `vitest.config.ts` del backend inclou el glob `test/**/*.spec.ts` (o equivalent)
- **WHEN** s'executa `pnpm --filter node-service test` des de l'arrel del monorepo
- **THEN** Vitest troba i executa `test/concurrencia.spec.ts`
- **AND** el test passa amb les afirmacions d'exclusió mútua en verd

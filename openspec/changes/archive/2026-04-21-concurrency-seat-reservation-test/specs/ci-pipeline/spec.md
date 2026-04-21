## MODIFIED Requirements

### Requirement: Tests de backend s'executen amb PostgreSQL en CI

El workflow SHALL executar validació de backend per a **tots dos** serveis (node-service i laravel-service) amb el service container de PostgreSQL 16 disponible. La `DATABASE_URL` MUST ser injectada per a node-service; les variables `DB_*` MUST ser injectades per a laravel-service. El pas de tests de node-service MUST incloure el test de concurrència (`backend/test/concurrencia.spec.ts`) i bloquejar el merge si falla.

#### Scenario: Tests de backend passen amb BD disponible

- **GIVEN** el service container de PostgreSQL 16 està actiu i els schemas s'han migrat (node i laravel)
- **THEN** `pnpm --filter backend test` completa amb codi de sortida 0 (inclou `concurrencia.spec.ts`)
- **THEN** `php artisan test` completa amb codi de sortida 0

#### Scenario: Test de concurrència de SeatsService falla correctament

- **GIVEN** un canvi trenca la lògica de `SELECT FOR UPDATE` a `SeatsService`
- **WHEN** el workflow executa els tests de backend
- **THEN** el test `concurrencia.spec.ts` falla
- **THEN** el workflow es marca com a `failure` i GitHub bloqueja el merge a `main`

#### Scenario: Test de concurrència és part del pas de tests de backend estàndard

- **GIVEN** `vitest.config.ts` del backend inclou `test/**/*.spec.ts`
- **WHEN** el workflow executa `pnpm --filter backend test`
- **THEN** Vitest executa `concurrencia.spec.ts` juntament amb tots els altres tests de backend
- **AND** no cal un pas de CI separat per al test de concurrència

#### Scenario: DATABASE_URL i DB_* mai hardcodejades

- **WHEN** s'inspeccionà el fitxer `.github/workflows/ci.yml`
- **THEN** la `DATABASE_URL` és referenciada com a variable d'entorn
- **THEN** les variables `DB_HOST`, `DB_PASSWORD` són referenciades com a variables d'entorn
- **THEN** cap cadena de connexió amb credencials literals apareix al fitxer

#### Scenario: Testability — service container de Postgres s'inicialitza

- **WHEN** el workflow arrenca el job de CI
- **THEN** el service container `postgres:16` s'inicia i respon a connexions TCP al port 5432 abans d'executar els tests de backend

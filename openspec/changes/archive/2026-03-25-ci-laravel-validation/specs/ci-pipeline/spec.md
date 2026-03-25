## ADDED Requirements

### Requirement: PHP i Composer instal·lats en CI

El workflow SHALL configurar PHP 8.3 amb les extensions `pdo_pgsql` i `mbstring` usant `shivammathur/setup-php@v2`, i instal·lar les dependències del laravel-service amb `composer install --no-interaction --prefer-dist`.

#### Scenario: Setup de PHP correcte

- **WHEN** s'inspeccionà el fitxer `.github/workflows/ci.yml`
- **THEN** existeix un step que usa `shivammathur/setup-php@v2` amb `php-version: '8.3'`
- **THEN** l'extensió `pdo_pgsql` és llistada com a extensió requerida

#### Scenario: Composer install completa sense errors

- **WHEN** el workflow executa el step de composer install
- **THEN** `composer install` completa amb codi de sortida 0
- **THEN** el directori `src/backend/laravel-service/vendor/` existeix

#### Scenario: Testability — PHP version correcta

- **WHEN** el workflow executa `php --version`
- **THEN** la versió retornada és 8.3.x

### Requirement: Lint PHP (Pint) s'executa en CI

El workflow SHALL executar `vendor/bin/pint --test` des del directori `src/backend/laravel-service/`. Qualsevol error d'estil SHALL fer fallar el workflow.

#### Scenario: Pint passa sense errors d'estil

- **WHEN** el codi PHP segueix les regles de Pint configurades
- **THEN** `vendor/bin/pint --test` completa amb codi de sortida 0

#### Scenario: Error d'estil atura el pipeline

- **WHEN** existeix un fitxer PHP que no segueix les regles de Pint
- **THEN** `vendor/bin/pint --test` retorna codi de sortida diferent de 0
- **THEN** el workflow es marca com a `failure`

#### Scenario: Testability — Pint existeix al vendor

- **WHEN** s'inspeccionà el fitxer `composer.json` del laravel-service
- **THEN** `laravel/pint` apareix com a dependència de `require-dev`

### Requirement: Migrations Laravel s'executen contra PostgreSQL en CI

El workflow SHALL executar `php artisan migrate --force` al contenidor de CI amb connexió al service container de PostgreSQL 16. La migració SHALL completar sense errors com a prerequisit dels tests.

#### Scenario: php artisan migrate completa sense errors

- **GIVEN** que el service container de PostgreSQL 16 és accessible a `127.0.0.1:5432`
- **WHEN** el workflow executa `php artisan migrate --force`
- **THEN** totes les taules del domini es creen sense errors
- **THEN** el pas completa amb codi de sortida 0

#### Scenario: Variables de BD injectades com a env vars del job

- **WHEN** s'inspeccionà el fitxer `.github/workflows/ci.yml`
- **THEN** les variables `DB_CONNECTION`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` s'injecten com a variables d'entorn del step o del job
- **THEN** cap credencial de BD apareix hardcoded com a literal al fitxer

#### Scenario: Testability — migrate:status mostra totes les taules com a Ran

- **WHEN** `php artisan migrate --force` completa amb èxit
- **THEN** `php artisan migrate:status` mostra totes les migrations amb estat `Ran`

### Requirement: Tests PHP (PHPUnit) s'executen contra PostgreSQL en CI

El workflow SHALL executar `php artisan test` des del directori `src/backend/laravel-service/`. Els tests SHALL córrer contra PostgreSQL (no SQLite). Qualsevol test fallit SHALL fer fallar el workflow.

#### Scenario: php artisan test passa

- **GIVEN** que les migrations s'han aplicat correctament
- **WHEN** el workflow executa `php artisan test`
- **THEN** tots els tests passen amb codi de sortida 0

#### Scenario: Test fallit atura el pipeline

- **WHEN** un test de PHPUnit falla
- **THEN** `php artisan test` retorna codi de sortida diferent de 0
- **THEN** el workflow es marca com a `failure` i GitHub bloqueja el merge

#### Scenario: Testability — phpunit.xml apunta a PostgreSQL

- **WHEN** s'inspeccionà el fitxer `src/backend/laravel-service/phpunit.xml`
- **THEN** `DB_CONNECTION` té el valor `pgsql`
- **THEN** `DB_CONNECTION` NO té el valor `sqlite`

## MODIFIED Requirements

### Requirement: Tests de backend s'executen amb PostgreSQL en CI

El workflow SHALL executar validació de backend per a **tots dos** serveis (node-service i laravel-service) amb el service container de PostgreSQL 16 disponible. La `DATABASE_URL` MUST ser injectada per a node-service; les variables `DB_*` MUST ser injectades per a laravel-service.

#### Scenario: Tests de backend passen amb BD disponible

- **WHEN** el service container de PostgreSQL 16 està actiu i els schemas s'han migrat (node i laravel)
- **THEN** `pnpm --filter node-service test` completa amb codi de sortida 0
- **THEN** `php artisan test` completa amb codi de sortida 0

#### Scenario: Test de concurrència de SeatsService falla correctament

- **GIVEN** un canvi trenca la lògica de `SELECT FOR UPDATE` a `SeatsService`
- **WHEN** el workflow executa els tests de node-service
- **THEN** el test de concurrència falla
- **THEN** el workflow es marca com a `failure` i GitHub bloqueja el merge a `main`

#### Scenario: DATABASE_URL i DB_* mai hardcodejades

- **WHEN** s'inspeccionà el fitxer `.github/workflows/ci.yml`
- **THEN** la `DATABASE_URL` és referenciada com a variable d'entorn
- **THEN** les variables `DB_HOST`, `DB_PASSWORD` són referenciades com a variables d'entorn
- **THEN** cap cadena de connexió amb credencials literals apareix al fitxer

#### Scenario: Testability — service container de Postgres s'inicialitza

- **WHEN** el workflow arrenca el job de CI
- **THEN** el service container `postgres:16` s'inicia i respon a connexions TCP al port 5432 abans d'executar els tests de node-service i laravel-service

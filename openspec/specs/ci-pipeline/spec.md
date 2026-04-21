## Purpose

Aquest spec defineix els requisits del pipeline de CI (Integració Contínua) basat en GitHub Actions per al monorepo del projecte. L'objectiu és garantir que cada canvi al codi passi automàticament una bateria de validacions (instal·lació de dependències, lint, type-check i tests) abans de poder ser integrat a la branca principal.

---

## Requirements

### Requirement: CI workflow s'activa en push i pull_request

El sistema SHALL disposar d'un fitxer `.github/workflows/ci.yml` que s'activi automàticament en events `push` i `pull_request` a qualsevol branca del repositori.

#### Scenario: Push a una branca feature activa el workflow

- **WHEN** un desarrollador fa `git push` a una branca `feature/*`
- **THEN** GitHub Actions inicia el workflow `CI` automàticament
- **AND** l'estat del workflow apareix com a "pending" o "in_progress" al commit

#### Scenario: Obertura d'una PR activa el workflow

- **WHEN** s'obre una Pull Request cap a `main`
- **THEN** el workflow s'executa sobre el codi de la PR
- **AND** GitHub requereix que el workflow passi com a status check obligatori abans de permetre el merge

#### Scenario: Testabilitat — el workflow existeix i té la configuració correcta

- **WHEN** s'inspeccionà el fitxer `.github/workflows/ci.yml`
- **THEN** el fitxer conté la clau `on` amb `push` i `pull_request`
- **AND** no hi ha condicions de branca que excloguin branques habituals

---

### Requirement: Instal·lació de dependències reproduïble

El workflow SHALL instal·lar les dependències del monorepo usant `pnpm install --frozen-lockfile`, garantint que les versions coincideixen exactament amb el `pnpm-lock.yaml`.

#### Scenario: Instal·lació correcta amb lockfile existent

- **WHEN** el workflow executa el pas d'instal·lació
- **THEN** `pnpm install --frozen-lockfile` completa sense errors
- **AND** tots els workspaces (`frontend/`, `backend/`, `shared/`) tenen les seves dependències instal·lades

#### Scenario: Fallada si el lockfile no coincideix

- **WHEN** el `pnpm-lock.yaml` no coincideix amb el `package.json`
- **THEN** el pas d'instal·lació falla amb error
- **AND** el workflow s'atura i es marca com a `failure`

#### Scenario: Versió de Node correcta

- **WHEN** el workflow configura l'entorn
- **THEN** usa `actions/setup-node` amb `node-version-file: '.nvmrc'`
- **AND** la versió de Node usada en CI coincideix amb la versió local del projecte

---

### Requirement: Lint i type-check passen en CI

El workflow SHALL executar lint i type-check de tots els workspaces. El pas de lint (`pnpm lint`) MUST ser el primer step de validació del workflow, executat **abans** del type-check i dels tests. Qualsevol error de lint o de tipatge MUST fer fallar el workflow.

#### Scenario: Lint passa sense errors

- **WHEN** el workflow executa `pnpm lint`
- **THEN** el pas completa amb codi de sortida 0
- **AND** no es reporta cap error d'estil de codi

#### Scenario: Type-check passa sense errors

- **WHEN** el workflow executa el type-check de frontend i backend
- **THEN** la compilació de TypeScript no retorna errors (`tsc --noEmit` o equivalent)
- **AND** el pas completa amb codi de sortida 0

#### Scenario: Error de tipus atura el pipeline

- **WHEN** existeix un error de tipatge en el codi enviat
- **THEN** el pas de type-check falla amb codi de sortida diferent de 0
- **AND** el workflow es marca com a `failure` i no continua amb els tests

#### Scenario: Lint s'executa com a primer step de validació

- **WHEN** s'inspeccionà el fitxer `.github/workflows/ci.yml`
- **THEN** el step `pnpm lint` apareix **abans** dels steps de type-check i tests en la seqüència del job
- **AND** si `pnpm lint` falla, el workflow s'atura i no executa els tests

#### Scenario: pnpm lint executa ESLint real (no stub)

- **WHEN** el workflow executa `pnpm lint`
- **THEN** ESLint s'invoca realment en els tres workspaces (no el missatge `echo 'eslint not configured yet'`)
- **AND** el workflow falla si existeix algun error d'ESLint o Prettier

---

### Requirement: Tests de frontend s'executen en CI

El workflow SHALL executar `pnpm --filter frontend test` com a pas independent. Qualsevol test que falli MUST fer fallar el workflow.

#### Scenario: Tests de frontend passen

- **WHEN** tots els tests de frontend estan en verd
- **THEN** el pas `pnpm --filter frontend test` completa amb codi de sortida 0

#### Scenario: Test de frontend fallit atura el pipeline

- **WHEN** un test de component o store del frontend falla
- **THEN** el pas falla amb codi de sortida diferent de 0
- **AND** el workflow es marca com a `failure`

#### Scenario: Testabilitat — tests de frontend existeixen

- **WHEN** s'executa `pnpm --filter frontend test` en l'entorn CI
- **THEN** Vitest troba i executa almenys un test
- **AND** retorna un resum del nombre de tests passats

---

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

#### Scenario: DATABASE*URL i DB*\* mai hardcodejades

- **WHEN** s'inspeccionà el fitxer `.github/workflows/ci.yml`
- **THEN** la `DATABASE_URL` és referenciada com a variable d'entorn
- **THEN** les variables `DB_HOST`, `DB_PASSWORD` són referenciades com a variables d'entorn
- **THEN** cap cadena de connexió amb credencials literals apareix al fitxer

#### Scenario: Testability — service container de Postgres s'inicialitza

- **WHEN** el workflow arrenca el job de CI
- **THEN** el service container `postgres:16` s'inicia i respon a connexions TCP al port 5432 abans d'executar els tests de backend

---

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

---

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

---

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

---

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

---

### Requirement: El workflow completa en menys de 5 minuts

El workflow SHALL completar tota la seqüència (install → lint → type-check → tests frontend → tests backend) en menys de 5 minuts en condicions normals.

#### Scenario: Execució total dins del límit de temps

- **WHEN** tots els passos del workflow passen sense errors
- **THEN** el temps total d'execució del job és inferior a 5 minuts

#### Scenario: Testabilitat — durada visible als logs de GitHub Actions

- **WHEN** el workflow completa
- **THEN** GitHub Actions mostra la durada de cada pas i la durada total del job

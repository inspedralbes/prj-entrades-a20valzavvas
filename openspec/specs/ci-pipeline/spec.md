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

El workflow SHALL executar lint i type-check de tots els workspaces. Qualsevol error de lint o de tipatge MUST fer fallar el workflow.

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

El workflow SHALL executar `pnpm --filter backend test` amb un service container de PostgreSQL 16 disponible. La `DATABASE_URL` MUST ser injectada com a variable d'entorn del job.

#### Scenario: Tests de backend passen amb BD disponible

- **WHEN** el service container de PostgreSQL 16 està actiu i el schema s'ha migrat
- **THEN** `pnpm --filter backend test` completa amb codi de sortida 0
- **AND** tots els tests d'integració i concurrència passen

#### Scenario: Test de concurrència de SeatsService falla correctament

- **GIVEN** un canvi trenca la lògica de `SELECT FOR UPDATE` a `SeatsService`
- **WHEN** el workflow executa els tests de backend
- **THEN** el test de concurrència falla
- **AND** el workflow es marca com a `failure` i GitHub bloqueja el merge a `main`

#### Scenario: DATABASE_URL mai hardcodejada

- **WHEN** s'inspeccionà el fitxer `.github/workflows/ci.yml`
- **THEN** la `DATABASE_URL` és referenciada com a variable d'entorn (`${{ env.DATABASE_URL }}` o similar)
- **AND** no hi ha cap cadena de connexió amb credencials literals al fitxer

#### Scenario: Testabilitat — service container de Postgres s'inicialitza

- **WHEN** el workflow arrenca el job de CI
- **THEN** el service container `postgres:16` s'inicia i respon a connexions TCP al port 5432 abans d'executar els tests

---

### Requirement: El workflow completa en menys de 5 minuts

El workflow SHALL completar tota la seqüència (install → lint → type-check → tests frontend → tests backend) en menys de 5 minuts en condicions normals.

#### Scenario: Execució total dins del límit de temps

- **WHEN** tots els passos del workflow passen sense errors
- **THEN** el temps total d'execució del job és inferior a 5 minuts

#### Scenario: Testabilitat — durada visible als logs de GitHub Actions

- **WHEN** el workflow completa
- **THEN** GitHub Actions mostra la durada de cada pas i la durada total del job

## Purpose

Aquest spec defineix els requisits del workflow de desplegament automàtic del frontend Nuxt (`deploy-frontend.yml`). L'objectiu és garantir que cada push a `main` que superi el CI desplega automàticament la nova versió del frontend al VPS de manera independent del backend, sense intervenció manual i sense secrets hardcodejats.

---

## ADDED Requirements

### Requirement: El workflow de deploy del frontend s'activa via CI o manualment

El sistema SHALL disposar d'un fitxer `.github/workflows/deploy-frontend.yml` amb dos triggers:
- `workflow_run` (CI completat a `main`): s'activa automàticament quan el CI acaba amb èxit; MUST ometre l'execució si el CI ha fallat.
- `workflow_dispatch`: permet llançar el deploy manualment des de la UI de GitHub Actions sobre qualsevol branca.

#### Scenario: Push a main amb CI verd activa el deploy automàticament

- **GIVEN** que existeix el fitxer `.github/workflows/deploy-frontend.yml`
- **WHEN** un desarrollador fa `git push` a `main` i tots els tests del CI passen
- **THEN** el workflow `deploy-frontend` s'inicia automàticament un cop el CI ha finalitzat amb èxit
- **AND** l'estat del workflow apareix com a "in_progress" a GitHub Actions

#### Scenario: Push a main amb CI vermell no activa el deploy

- **GIVEN** que existeix el fitxer `.github/workflows/deploy-frontend.yml`
- **WHEN** un desarrollador fa `git push` a `main` i el CI falla
- **THEN** el workflow de deploy-frontend NO s'executa
- **AND** el VPS continua executant la versió anterior del frontend

#### Scenario: Execució manual des de qualsevol branca

- **GIVEN** que existeix el fitxer `.github/workflows/deploy-frontend.yml` amb trigger `workflow_dispatch`
- **WHEN** una enginyera accedeix a la pestanya "Actions" de GitHub i executa manualment el workflow
- **THEN** el workflow s'executa immediatament sense esperar cap resultat de CI

#### Scenario: Testabilitat — configuració correcta del workflow

- **WHEN** s'inspeccionà el fitxer `.github/workflows/deploy-frontend.yml`
- **THEN** el fitxer conté `on.workflow_run.workflows: ["CI"]` i `on.workflow_dispatch`
- **AND** el job de deploy conté `if: ${{ github.event_name == 'workflow_dispatch' || github.event.workflow_run.conclusion == 'success' }}`
- **AND** no hi ha credencials hardcodejades

---

### Requirement: El deploy del frontend s'executa condicionalment segons els paths canviats

El workflow SHALL comprovar si han canviat fitxers a `src/frontend/**` o `src/shared/**`. Si no n'hi ha cap canvi i el trigger és `workflow_run`, tots els passos de deploy MUST ser saltats. Si el trigger és `workflow_dispatch`, el deploy SHALL executar-se sempre.

#### Scenario: Merge que canvia frontend/ activa el deploy

- **GIVEN** que el CI ha passat en un push a `main`
- **WHEN** el merge inclou canvis a fitxers de `src/frontend/**` o `src/shared/**`
- **THEN** el workflow executa rsync, injecta el `.env` i executa `docker compose up -d --build frontend`

#### Scenario: Merge que només canvia backend/ salta el deploy del frontend

- **GIVEN** que el CI ha passat en un push a `main`
- **WHEN** el merge inclou únicament canvis a `src/backend/**`
- **THEN** el workflow de deploy-frontend detecta que no hi ha canvis rellevants
- **AND** els passos de rsync, `.env` i SSH són saltats
- **AND** el workflow finalitza amb estat `success`

#### Scenario: workflow_dispatch sempre desplega independentment dels paths

- **GIVEN** que s'executa el workflow manualment via `workflow_dispatch`
- **WHEN** no hi ha canvis recents a `frontend/**` ni `shared/**`
- **THEN** el deploy s'executa igualment sense comprovar paths

---

### Requirement: Sincronització del repositori i build del frontend al VPS

El workflow SHALL sincronitzar el repositori al directori `/opt/entrades/` del VPS via rsync, injectar les variables d'entorn de producció des dels secrets de GitHub, i executar `docker compose -f docker-compose.prod.yml up -d --build frontend` al VPS.

#### Scenario: rsync sincronitza el repositori correctament

- **GIVEN** que el workflow s'ha activat i els paths rellevants han canviat
- **WHEN** s'executa el pas de rsync
- **THEN** el directori `/opt/entrades/` del VPS conté el codi actualitzat
- **AND** els directoris `.git` i `.github` NO s'han copiat
- **AND** fitxers eliminats localment també s'eliminen al VPS

#### Scenario: docker compose up --build arrenca la nova versió del frontend

- **GIVEN** que el repositori està sincronitzat al VPS
- **WHEN** el workflow executa `docker compose -f docker-compose.prod.yml up -d --build frontend`
- **THEN** el contenidor `frontend` s'aixeca amb el codi actualitzat
- **AND** els contenidors del backend (`node-service`, `laravel-service`) NO es reinicien
- **AND** s'executa `docker image prune -f` per alliberar espai

#### Scenario: Fallada de connexió SSH fa fallar el workflow

- **GIVEN** que les credencials SSH (`VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`) són incorrectes o el VPS no és accessible
- **WHEN** el workflow intenta executar qualsevol pas SSH
- **THEN** el pas falla amb un error descriptiu
- **AND** el workflow es marca com a `failure` a GitHub Actions
- **AND** el VPS continua executant la versió anterior del frontend

---

### Requirement: El Dockerfile del frontend és multi-stage i injecta variables en build time

El sistema SHALL disposar d'un `frontend/Dockerfile` amb dues etapes: `builder` (build SSR) i `runner` (runtime mínim). Les variables `NUXT_PUBLIC_API_URL` i `NUXT_PUBLIC_WS_URL` MUST ser declarades com a `ARG` i injectades en build time.

#### Scenario: Build d'imatge Docker del frontend

- **GIVEN** que existeix `frontend/Dockerfile` multi-stage
- **WHEN** s'executa `docker build --build-arg NUXT_PUBLIC_API_URL=https://api.example.com --build-arg NUXT_PUBLIC_WS_URL=wss://api.example.com .`
- **THEN** la imatge es construeix sense errors
- **AND** l'etapa `runner` no conté `node_modules` de devDependencies ni fitxers font `.ts`

#### Scenario: Variables públiques injectades correctament en build time

- **GIVEN** que el Dockerfile declara `ARG NUXT_PUBLIC_API_URL` i `ARG NUXT_PUBLIC_WS_URL`
- **WHEN** el contenidor s'executa en producció
- **THEN** el bundle de Nuxt conté les URLs correctes sense necessitat de variables en runtime

#### Scenario: Testabilitat — inspecció del Dockerfile

- **WHEN** s'inspeccionà el fitxer `frontend/Dockerfile`
- **THEN** conté exactament dues etapes (`FROM ... AS builder` i `FROM ... AS runner`)
- **AND** la instrucció `ARG NUXT_PUBLIC_API_URL` i `ARG NUXT_PUBLIC_WS_URL` apareixen a l'etapa builder
- **AND** l'etapa runner copia únicament `.output/` de l'etapa builder

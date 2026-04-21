## Purpose

Aquest spec defineix els requisits del workflow de desplegament automàtic del backend (`deploy-backend.yml`). L'objectiu és garantir que cada push a `main` que superi el CI desplega automàticament la nova versió del backend al VPS en menys de 3 minuts, sense intervenció manual i sense secrets hardcodejats. El desplegament usa rsync per sincronitzar el repositori a `/opt/entrades/` i executa el build directament al VPS.

---

## ADDED Requirements

### Requirement: El workflow de deploy s'activa via CI o manualment

El sistema SHALL disposar d'un fitxer `.github/workflows/deploy-backend.yml` amb dos triggers:
- `workflow_run` (CI completat a `main`): s'activa automàticament quan el CI acaba; MUST ometre l'execució si el CI ha fallat.
- `workflow_dispatch`: permet llançar el deploy manualment des de la UI de GitHub Actions sobre qualsevol branca, sense cap restricció de CI.

#### Scenario: Push a main amb CI verd activa el deploy automàticament

- **GIVEN** que existeix el fitxer `.github/workflows/deploy-backend.yml`
- **WHEN** un desarrollador fa `git push` a `main` i tots els tests del CI passen
- **THEN** el workflow `deploy-backend` s'inicia automàticament un cop el CI ha finalitzat amb èxit
- **AND** l'estat del workflow apareix com a "in_progress" a GitHub Actions

#### Scenario: Push a main amb CI vermell no activa el deploy

- **GIVEN** que existeix el fitxer `.github/workflows/deploy-backend.yml`
- **WHEN** un desarrollador fa `git push` a `main` i el CI falla (tests, lint o type-check)
- **THEN** el workflow de deploy NO s'executa (condicional `if` descarta l'execució)
- **AND** el VPS continua executant la versió anterior del backend

#### Scenario: Execució manual des de qualsevol branca

- **GIVEN** que existeix el fitxer `.github/workflows/deploy-backend.yml` amb trigger `workflow_dispatch`
- **WHEN** una enginyera accedeix a la pestanya "Actions" de GitHub i executa manualment el workflow sobre una branca `feature/*` o `main`
- **THEN** el workflow s'executa immediatament sense esperar cap resultat de CI
- **AND** el desplegament procedeix amb el codi de la branca seleccionada

#### Scenario: Push a una branca feature sense dispatch no activa el deploy

- **GIVEN** que existeix el fitxer `.github/workflows/deploy-backend.yml`
- **WHEN** un desarrollador fa `git push` a una branca `feature/*` (sense activar workflow_dispatch)
- **THEN** el workflow de deploy NO s'executa automàticament
- **AND** el CI sí que s'executa normalment

#### Scenario: Testabilitat — el workflow té la configuració correcta

- **WHEN** s'inspeccionà el fitxer `.github/workflows/deploy-backend.yml`
- **THEN** el fitxer conté `on.workflow_run.workflows: ["CI"]` i `on.workflow_dispatch`
- **AND** el job de deploy conté `if: ${{ github.event_name == 'workflow_dispatch' || github.event.workflow_run.conclusion == 'success' }}`
- **AND** no hi ha credencials hardcodejades (cap `password:`, `key:` o token literal)

---

### Requirement: El deploy del backend s'executa condicionalment segons els paths canviats

El workflow SHALL comprovar si han canviat fitxers a `backend/**` o `shared/**` en el merge. Si no n'hi ha cap canvi i el trigger és `workflow_run`, tots els passos de deploy MUST ser saltats. Si el trigger és `workflow_dispatch`, el deploy SHALL executar-se sempre independentment dels paths.

#### Scenario: Merge que canvia backend/ activa el deploy

- **GIVEN** que el CI ha passat en un push a `main`
- **WHEN** el merge inclou canvis a fitxers de `backend/**` o `shared/**`
- **THEN** el workflow executa rsync, injecta el `.env` i executa `docker compose up -d --build backend`

#### Scenario: Merge que només canvia frontend/ salta el deploy del backend

- **GIVEN** que el CI ha passat en un push a `main`
- **WHEN** el merge inclou únicament canvis a `frontend/**` (cap fitxer de `backend/**` ni `shared/**`)
- **THEN** el workflow de deploy-backend detecta que no hi ha canvis rellevants
- **AND** els passos de rsync, `.env` i SSH són saltats
- **AND** el workflow finalitza amb estat `success` (no `failure`)

#### Scenario: workflow_dispatch sempre desplega independentment dels paths

- **GIVEN** que s'executa el workflow manualment via `workflow_dispatch`
- **WHEN** no hi ha canvis recents a `backend/**` ni `shared/**`
- **THEN** el deploy s'executa igualment sense comprovar paths

---

### Requirement: Sincronització del repositori i build al VPS

El workflow SHALL sincronitzar el repositori al directori `/opt/entrades/` del VPS via rsync, injectar el fitxer `.env` del backend des del secret `BACKEND_ENV_FILE`, i executar `docker compose -f docker-compose.prod.yml up -d --build backend` al VPS. El desplegament complet MUST finalitzar en menys de 3 minuts des del push inicial.

#### Scenario: rsync sincronitza el repositori correctament

- **GIVEN** que el workflow s'ha activat i els paths rellevants han canviat
- **WHEN** s'executa el pas de rsync
- **THEN** el directori `/opt/entrades/` del VPS conté el codi actualitzat de `main`
- **AND** els directoris `.git` i `.github` NO s'han copiat (flag `--exclude`)
- **AND** fitxers eliminats localment també s'eliminen al VPS (flag `--delete`)

#### Scenario: El fitxer .env s'injecta des del secret sense exposar-lo als logs

- **GIVEN** que el secret `BACKEND_ENV_FILE` conté el contingut del `.env` del backend
- **WHEN** el workflow executa el pas d'injecció del `.env`
- **THEN** el fitxer `/opt/entrades/.env` existeix al VPS amb permisos `600`
- **AND** el contingut del `.env` no apareix en cap log de GitHub Actions

#### Scenario: docker compose up arrenca la nova versió del backend

- **GIVEN** que el repositori i el `.env` estan sincronitzats al VPS
- **WHEN** el workflow executa `docker compose -f docker-compose.prod.yml up -d --build backend`
- **THEN** el contenidor del backend s'aixeca amb el codi actualitzat
- **AND** s'executa `docker image prune -f` per alliberar espai d'imatges antigues

#### Scenario: Fallada de connexió SSH fa fallar el workflow

- **GIVEN** que les credencials SSH (`SSH_HOST`, `SSH_USER`, `SSH_KEY`) són incorrectes o el VPS no és accessible
- **WHEN** el workflow intenta executar qualsevol pas SSH
- **THEN** el pas falla amb un error descriptiu
- **AND** el workflow es marca com a `failure` a GitHub Actions
- **AND** el VPS continua executant la versió anterior del backend

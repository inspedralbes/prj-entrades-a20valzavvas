## ADDED Requirements

### Requirement: El workflow de deploy del Laravel Service s'activa via CI o manualment

El sistema SHALL disposar d'un fitxer `.github/workflows/deploy-laravel.yml` amb dos triggers:
- `workflow_run` (CI completat a `main`): s'activa automàticament quan el workflow "CI" finalitza; MUST ometre l'execució si el CI ha fallat.
- `workflow_dispatch`: permet llançar el deploy manualment des de la UI de GitHub Actions sobre qualsevol branca.

#### Scenario: Push a main amb CI verd activa el deploy automàticament

- **GIVEN** que existeix el fitxer `.github/workflows/deploy-laravel.yml`
- **WHEN** un push a `main` supera tots els checks del CI (`ci.yml`)
- **THEN** el workflow `deploy-laravel` s'inicia automàticament un cop el CI ha finalitzat amb èxit
- **AND** l'estat del workflow apareix com a "in_progress" a GitHub Actions

#### Scenario: CI fallat no activa el deploy

- **GIVEN** que existeix el fitxer `.github/workflows/deploy-laravel.yml`
- **WHEN** un push a `main` provoca un error al CI (tests, lint o type-check)
- **THEN** el workflow de deploy-laravel NO s'executa
- **AND** el VPS continua executant la versió anterior del Laravel Service

#### Scenario: Execució manual via workflow_dispatch

- **GIVEN** que existeix el fitxer `.github/workflows/deploy-laravel.yml` amb trigger `workflow_dispatch`
- **WHEN** una enginyera executa el workflow manualment des de la pestanya "Actions" de GitHub
- **THEN** el workflow s'executa immediatament sense esperar cap resultat de CI
- **AND** el desplegament procedeix amb el codi de la branca seleccionada

#### Scenario: Push a branca feature sense dispatch no activa el deploy

- **GIVEN** que existeix el fitxer `.github/workflows/deploy-laravel.yml`
- **WHEN** es fa `git push` a una branca `feature/*` sense activar `workflow_dispatch`
- **THEN** el workflow de deploy-laravel NO s'executa automàticament

#### Scenario: Testabilitat — el workflow té la configuració correcta de triggers

- **WHEN** s'inspeccionà el fitxer `.github/workflows/deploy-laravel.yml`
- **THEN** el fitxer conté `on.workflow_run.workflows: ["CI"]` i `on.workflow_dispatch`
- **AND** el job principal conté `if: ${{ github.event_name == 'workflow_dispatch' || github.event.workflow_run.conclusion == 'success' }}`
- **AND** no hi ha cap credencial hardcodejada al fitxer

---

### Requirement: El deploy es condiciona als canvis a laravel-service/**

El workflow SHALL detectar si el push inclou canvis a `laravel-service/**`. Si no n'hi ha cap canvi i el trigger és `workflow_run`, tots els steps de build, push i SSH MUST ser saltats. Si el trigger és `workflow_dispatch`, el deploy SHALL executar-se sempre.

#### Scenario: Canvis a laravel-service/ activen el build i deploy

- **GIVEN** que el CI ha passat en un push a `main`
- **WHEN** el merge inclou fitxers modificats a `laravel-service/**`
- **THEN** el workflow executa el build de la imatge, el push a GHCR i el deploy al VPS

#### Scenario: Canvis només al frontend o al backend Node salten el deploy del Laravel Service

- **GIVEN** que el CI ha passat en un push a `main`
- **WHEN** el merge inclou únicament canvis a `frontend/**` o `backend/**` (cap fitxer de `laravel-service/**`)
- **THEN** el workflow de deploy-laravel detecta que no hi ha canvis rellevants
- **AND** els steps de build, push i SSH MUST ser saltats
- **AND** el workflow finalitza amb estat `success` (no `failure`)

#### Scenario: workflow_dispatch desplega sempre independentment dels paths

- **GIVEN** que s'executa el workflow manualment via `workflow_dispatch`
- **WHEN** no hi ha canvis recents a `laravel-service/**`
- **THEN** el deploy s'executa igualment sense comprovar paths

---

### Requirement: Build de la imatge Docker multi-stage i push a GHCR

El workflow SHALL construir la imatge Docker de producció del Laravel Service usant un Dockerfile multi-stage (`laravel-service/Dockerfile.prod`) i publicar-la a GHCR amb el tag `ghcr.io/{owner}/{repo}-laravel:latest`. La imatge NO MUST contenir cap secret ni fitxer `.env`.

L'stage `builder` SHALL usar `composer:2` per instal·lar dependències PHP sense dev (`--no-dev --optimize-autoloader`). L'stage `runtime` SHALL usar `php:8.4-cli-alpine` (nginx fa proxy HTTP, no fastcgi) i copiar únicament el vendor/ i el codi de l'aplicació des del builder.

#### Scenario: Build correcte genera una imatge sense secrets

- **GIVEN** que existeix `laravel-service/Dockerfile.prod` amb build multi-stage
- **WHEN** el workflow executa `docker build -f laravel-service/Dockerfile.prod`
- **THEN** la imatge resultant NO conté cap fitxer `.env`, `APP_KEY` ni `JWT_SECRET` hardcodejats
- **AND** la comanda `docker inspect` de la imatge no mostra variables d'entorn amb valors de secrets

#### Scenario: La imatge es publica a GHCR amb el tag latest

- **WHEN** el build finalitza amb èxit
- **THEN** `docker push ghcr.io/{owner}/{repo}-laravel:latest` té exit code 0
- **AND** la imatge és accessible des del VPS fent `docker pull ghcr.io/{owner}/{repo}-laravel:latest`

#### Scenario: Fallada de build atura el workflow sense desplegar

- **WHEN** el build de Docker falla (ex. error de sintaxi al Dockerfile o dependència de Composer no resolta)
- **THEN** el workflow finalitza amb estat `failure`
- **AND** els steps de SSH al VPS NO s'executen

#### Scenario: Testabilitat — el Dockerfile.prod compila localment

- **WHEN** s'executa `docker build -f laravel-service/Dockerfile.prod laravel-service/` localment
- **THEN** la comanda finalitza sense errors
- **AND** la imatge resultant arrenca amb `docker run --rm -e APP_KEY=... <image> php artisan --version` sense errors

---

### Requirement: Desplegament al VPS via SSH sense secrets hardcodejats

El workflow SHALL connectar-se al VPS via SSH usant la clau privada del secret `VPS_SSH_KEY` i executar les comandes `docker compose pull laravel-service && docker compose up -d laravel-service`. Les variables sensibles (`LARAVEL_APP_KEY`, `JWT_SECRET`, `VPS_HOST`, `VPS_USER`) MUST ser GitHub Secrets, mai literals al fitxer YAML.

#### Scenario: Deploy exitós al VPS

- **GIVEN** que la imatge s'ha publicat correctament a GHCR
- **WHEN** el workflow connecta al VPS via SSH
- **THEN** `docker compose pull laravel-service` descarrega la nova imatge al VPS
- **AND** `docker compose up -d laravel-service` reinicia el servei amb la nova imatge
- **AND** `docker-entrypoint.sh` executa `php artisan migrate --force` automàticament en l'arrencada
- **AND** `GET /api/health` retorna HTTP `200` en menys de 5 minuts des del push inicial

#### Scenario: Les variables d'entorn s'injecten en runtime (no a la imatge)

- **GIVEN** que el VPS té el `docker-compose.prod.yml` configurat amb `environment:` per al servei `laravel-service`
- **WHEN** el contenidor arrenca
- **THEN** `APP_KEY`, `JWT_SECRET` i `DATABASE_URL` estan disponibles com a variables d'entorn del procés PHP
- **AND** cap d'aquests valors és visible fent `docker inspect` de la imatge (només del contenidor en execució)

#### Scenario: Fallada de connexió SSH atura el workflow amb error

- **WHEN** el VPS és inassolible o la clau SSH és invàlida
- **THEN** el step SSH finalitza amb exit code diferent de 0
- **AND** el workflow finalitza amb estat `failure`
- **AND** GitHub notifica l'error a l'equip

#### Scenario: Testabilitat — cap secret al fitxer YAML

- **WHEN** s'inspeccionà el fitxer `.github/workflows/deploy-laravel.yml`
- **THEN** no hi ha cap valor literal de clau, token o contrasenya
- **AND** totes les referències a credencials usen la sintaxi `${{ secrets.NOM_SECRET }}`

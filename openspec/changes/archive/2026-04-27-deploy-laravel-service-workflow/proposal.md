## Why

El Laravel Service (API REST + autenticació) no té pipeline de desplegament automatitzat: cada actualització requereix accés manual al VPS. Cal un workflow de GitHub Actions que construeixi la imatge Docker de producció i la desplegui al VPS en cada push a `main` que superi el CI, eliminant el desplegament manual i garantint que el servei sempre executa el codi verificat. Relacionat amb **PE-57**.

## What Changes

- Nou workflow `.github/workflows/deploy-laravel.yml` que s'activa en push a `main` (amb dependència de `ci.yml`)
- Nou Dockerfile de producció multi-stage per al Laravel Service (`laravel-service/Dockerfile.prod`)
- El workflow fa: build de la imatge → push a GHCR (`ghcr.io/{owner}/{repo}-laravel:latest`) → SSH al VPS per fer `docker compose pull laravel-service && docker compose up -d laravel-service`
- Variables sensibles (clau SSH, host, user, `LARAVEL_APP_KEY`, `JWT_SECRET`) gestionades com a GitHub Secrets
- La imatge Docker no conté `.env` ni secrets; les variables s'injecten en runtime via Docker Compose

## Capabilities

### New Capabilities

- `laravel-deploy-workflow`: Workflow CI/CD de GitHub Actions que construeix la imatge Docker de producció del Laravel Service, la publica a GHCR i la desplegha al VPS via SSH.

### Modified Capabilities

*(cap canvi en requisits de specs existents)*

## Impact

- **Fitxers nous**: `.github/workflows/deploy-laravel.yml`, `laravel-service/Dockerfile.prod`
- **GitHub Secrets requerits**: `VPS_SSH_KEY`, `VPS_HOST`, `VPS_USER`, `LARAVEL_APP_KEY`, `JWT_SECRET`, `GHCR_TOKEN`
- **Depèn de**: `laravel-deploy-entrypoint` (US-08-04 — `docker-entrypoint.sh` amb `php artisan migrate --force`) i `ci-pipeline` (CI ha de passar)
- **Cap afectació** al Node Service, al frontend ni als workflows existents (`deploy-frontend.yml`, `deploy-backend.yml`)

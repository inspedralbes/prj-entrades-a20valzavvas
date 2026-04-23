## Why

El frontend Nuxt necessita un workflow de desplegament automàtic i independent del backend, de manera que canvis de UI es puguin publicar al VPS sense reiniciar els contenidors del Node Service ni del Laravel Service. Ara mateix no existeix cap pipeline de CD per al frontend.

## What Changes

- Nou fitxer `.github/workflows/deploy-frontend.yml` que s'activa en push a `main`
- Nou `Dockerfile` de producció per al frontend Nuxt (multi-stage: build SSR + runtime mínim)
- Push de la imatge a GHCR (`ghcr.io/{owner}/{repo}-frontend:latest`)
- SSH al VPS per executar `docker compose pull frontend && docker compose up -d frontend`
- Variables d'entorn de producció (`NUXT_PUBLIC_API_URL`, `NUXT_PUBLIC_WS_URL`) injectades en build time via `ARG`

## Capabilities

### New Capabilities

- `frontend-deploy-workflow`: Pipeline GitHub Actions que construeix la imatge Docker del frontend Nuxt, la publica a GHCR i la desplega al VPS de manera independent del backend.

### Modified Capabilities

_(cap canvi de requisits en specs existents)_

## Impact

- **Mòdul afectat**: `frontend/` (Dockerfile de producció nou)
- **CI/CD**: nou workflow `.github/workflows/deploy-frontend.yml`
- **Infraestructura**: `docker-compose.prod.yml` al VPS ha de tenir el servei `frontend` configurat per llegir la imatge de GHCR (ja definit a `production-infrastructure`)
- **Secrets GitHub**: `VPS_SSH_KEY`, `VPS_HOST`, `VPS_USER`, `GHCR_TOKEN`, `NUXT_PUBLIC_API_URL`, `NUXT_PUBLIC_WS_URL`
- **Jira**: PE-40 (US-08-03)
- **Testing**: cap nova lògica de negoci; no requereix nous tests unitaris. La verificació és funcional: el contenidor `frontend` es redesplega sense afectar els altres serveis.

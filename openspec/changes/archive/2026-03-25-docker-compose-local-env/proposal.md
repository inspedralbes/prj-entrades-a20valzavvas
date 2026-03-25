## Why

El projecte necessita PostgreSQL, NestJS i Nuxt executant-se simultàniament en local. Sense un entorn de contenidors definit, cada membre de l'equip ha de configurar manualment els serveis, cosa que provoca inconsistències i pèrdua de temps. Docker Compose resol l'entorn de forma reproduïble i idempotent amb un sol comandament. Jira: [PE-11](https://lightweight-fitness.atlassian.net/browse/PE-11)

## What Changes

- S'afegeix `docker-compose.yml` a l'arrel del monorepo amb els serveis: `db` (PostgreSQL 16), `backend` (NestJS) i `frontend` (Nuxt 3).
- S'afegeix `.env.example` a l'arrel documentant totes les variables d'entorn requerides (`DATABASE_URL`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `BACKEND_PORT`, `FRONTEND_PORT`).
- El `docker-compose.yml` no conté cap credencial hardcoded; totes les variables sensibles referencien `${VAR}` del fitxer `.env` (gitignored).
- S'actualitza el `README` o documentació d'arrencada per reflectir el comandament `docker compose up --build`.
- El spec existent `monorepo-setup` s'actualitza per indicar que l'arrencada local és via Docker Compose.

## Capabilities

### New Capabilities
- `local-dev-environment`: Configuració completa de l'entorn de desenvolupament local via Docker Compose (serveis `db`, `backend`, `frontend`), incloent ports exposats, variables d'entorn i ordre d'arrencada amb health checks.

### Modified Capabilities
- `monorepo-setup`: S'actualitza el requisit d'arrencada local: el comandament canonia passa a ser `docker compose up --build` en lloc d'arrencades manuals individuals per workspace.

## Impact

- **Fitxers nous:** `docker-compose.yml`, `.env.example` (arrel del monorepo)
- **Fitxers modificats:** `openspec/specs/monorepo-setup/spec.md` (nota d'arrencada via Docker Compose)
- **Mòduls afectats:** infraestructura (no afecta cap mòdul de backend ni frontend directament)
- **Dependències externes:** Docker Engine ≥ 24, Docker Compose plugin ≥ 2.x
- **Sense breaking changes** per a la lògica de l'aplicació; és purament infraestructura local
- **Testing:** no requereix tests unitaris nous; la verificació és funcional (`docker compose up --build` sense errors i health checks verds)

## Non-goals

- No s'inclou Nginx ni proxy invers en aquesta història (títol PE-11 v2.0 menciona Nginx però els criteris d'acceptació no el requereixen per a US-01-02).
- No s'inclou configuració de producció ni entorn de CI/CD (cobert per EP-08).
- No es dockeritza el servei `shared` per separat; es consumeix com a workspace intern.

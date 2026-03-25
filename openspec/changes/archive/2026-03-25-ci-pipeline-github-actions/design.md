## Context

El projecte és un monorepo pnpm amb tres workspaces (`frontend/`, `backend/`, `shared/`). Tots els tests ja estan implementats (EP-07): Vitest al backend (`src/**/*.spec.ts`), Vitest via `@nuxt/test-utils` al frontend, i Vitest als tipus compartits. Fins ara no existeix cap fitxer `.github/workflows/ci.yml` actiu que executi automàticament tots aquests tests.

El backend necessita una base de dades PostgreSQL real per als tests d'integració i concurrència (`SeatsService`), de manera que el workflow ha de proveir un service container de Postgres.

## Goals / Non-Goals

**Goals:**
- Crear `.github/workflows/ci.yml` que s'activi en `push` i `pull_request`
- Executar en ordre: instal·lació de dependències → lint + type-check → tests frontend → tests backend
- Proveir un servei PostgreSQL 16 per als tests de backend
- Fer que el workflow bloquegi el merge a `main` en cas de fallada
- Mantenir el temps d'execució total per sota de 5 minuts

**Non-Goals:**
- Deploy automàtic (cobert per `deploy-frontend.yml` i `deploy-backend.yml`, fora d'abast)
- Tests E2E amb navegador (Playwright/Cypress)
- Caché de `node_modules` / `pnpm store` (es pot afegir posteriorment com a optimització)
- Notificacions Slack/email en fallada

## Decisions

### 1. Un sol job lineal vs. jobs paral·lels

**Decisió:** Un sol job amb passos en seqüència.

**Raonament:** La paral·lelització (frontend i backend en jobs separats) acceleraria el pipeline, però requeriria configurar el service container de Postgres dues vegades i gestionar artefactes entre jobs. Per a un temps objectiu de <5 minuts, un sol job és suficient i molt més simple. Es pot refactoritzar si el temps supera el límit.

**Alternativa descartada:** Dos jobs (frontend-ci / backend-ci) executats en paral·lel, bloquejats per un job d'instal·lació comú.

### 2. PostgreSQL com a service container de GitHub Actions

**Decisió:** Usar `services.postgres` natiu de GitHub Actions (imatge `postgres:16`).

**Raonament:** És la solució oficial i no requereix Docker Compose ni scripts d'inici personalitzats. La `DATABASE_URL` s'injecta com a variable d'entorn del job, consistent amb la convenció del projecte (mai hardcodejada).

**Alternativa descartada:** Aixecar la base de dades amb `docker-compose up -d db` — afegeix complexitat i temps d'espera.

### 3. `pnpm` com a gestor de paquets

**Decisió:** Usar l'acció oficial `pnpm/action-setup@v4` i `pnpm install --frozen-lockfile`.

**Raonament:** `pnpm/action-setup@v4` és l'acció oficial de pnpm — gestiona la instal·lació, la integra amb `actions/setup-node` per activar la caché (`cache: 'pnpm'`), i llegeix la versió del camp `packageManager` de `package.json` si escau. És més robusta i mantenible que `npm install -g pnpm`.

**Alternativa descartada:** `npm install -g pnpm` — menys integrada amb l'ecosistema d'actions, no activa la caché automàticament.

### 4. Ordre dels passos

**Decisió:** lint/type-check abans dels tests.

**Raonament:** Els errors de lint i tipatge fallen ràpid i no necessiten Postgres. Situar-los primer proporciona feedback immediat i evita inicialitzar el servei de BD innecessàriament.

## Risks / Trade-offs

- **[Risc] Tests de backend depenen de migració de BD** → Afegir `pnpm --filter backend prisma migrate deploy` (o `prisma db push`) com a pas previ als tests de backend. Usar variables d'entorn del job per a `DATABASE_URL`.
- **[Risc] Temps d'execució >5 min** → Afegir caché de `pnpm store` en una iteració posterior (`actions/cache` amb clau basada en el hash del `pnpm-lock.yaml`).
- **[Trade-off] Un sol job** → Si els tests de frontend o backend creixen molt, caldrà paral·lelitzar. El disseny actual ho permet fàcilment separant en dos jobs.
- **[Risc] Node version mismatch** → Usar `actions/setup-node` amb `node-version-file: '.nvmrc'` per garantir la mateixa versió que en local.

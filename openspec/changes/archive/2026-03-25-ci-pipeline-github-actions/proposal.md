## Why

Sense un pipeline de CI automatitzat, els tests crítics (especialment el test de concurrència de `SeatsService`) podrien ometre's manualment i codi trencat podria arribar a `main`. Ara que EP-07 (testing) està completat, tenim la cobertura de tests necessària per convertir-los en una porta de qualitat obligatòria a cada PR.

## What Changes

- Nou fitxer `.github/workflows/ci.yml` que s'activa en `push` i `pull_request` a qualsevol branca
- El workflow executa en seqüència: `pnpm install` → lint + type-check (frontend + backend) → tests frontend → tests backend (amb PostgreSQL service container)
- El workflow bloqueja el merge a `main` si qualsevol pas falla
- Temps objectiu d'execució: <5 minuts

## Capabilities

### New Capabilities

- `ci-pipeline`: Workflow de GitHub Actions que executa lint, type-check i tots els tests (frontend, backend, shared) en cada push i PR, amb un servei PostgreSQL containeritzat per als tests de backend

### Modified Capabilities

_(cap canvi en requisits de specs existents)_

## Impact

- **Fitxers nous:** `.github/workflows/ci.yml`
- **Mòduls afectats:** tots (el pipeline valida frontend, backend i shared)
- **Dependències CI:** `pnpm`, Node.js (versió fixada via `.nvmrc`), PostgreSQL 16 service container
- **Credencials:** `DATABASE_URL` injectada com a variable d'entorn del workflow (mai hardcodejada)
- **Jira:** PE-38
- **Nota testing:** no s'introdueixen nous tests — el pipeline executa els tests ja existents de tots els workspaces (`pnpm --filter frontend test`, `pnpm --filter backend test`)

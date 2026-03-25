## Why

El projecte Sala Onirica és un monorepo que inclou frontend (Nuxt 3), node-service (NestJS — temps real), laravel-service (Laravel — BD i auth) i tipus TypeScript compartits. Sense una configuració inicial del monorepo pnpm, el desenvolupament en paral·lel és inviable i la reutilització de tipus entre capes és impossible. Aquesta és la història zero: el fonament de tot el projecte. (Jira: PE-10)

> **Nota v2.0 — Pivotatge arquitectural:** El directori `backend/` original s'ha dividit en dos serveis: `backend/node-service/` (NestJS, temps real) i `backend/laravel-service/` (Laravel, BD i auth). Laravel és PHP i no forma part del workspace pnpm. El workspace pnpm declara: `frontend`, `backend/node-service`, `shared`. El rename de `backend/` → `backend/node-service/` i l'actualització de `pnpm-workspace.yaml` és tasca de US-01-05 (PE-53).

## What Changes

- Creació de l'estructura de directoris del monorepo: `frontend/`, `backend/node-service/`, `backend/laravel-service/`, `shared/`
- Configuració de `pnpm-workspace.yaml` a l'arrel declarant els paquets JS: `frontend`, `backend/node-service`, `shared` (laravel-service és PHP, no s'inclou)
- Creació del paquet `shared/` amb els tipus base del domini: `seat.types.ts`, `event.types.ts`, `socket.types.ts`, `auth.types.ts`
- Configuració dels `tsconfig.json` de `frontend` i `backend/node-service` amb l'àlies `@shared/*` apuntant a `shared/types/`
- Creació del `package.json` arrel amb scripts globals: `pnpm dev`, `pnpm lint`, `pnpm test`, `pnpm build`, `pnpm type-check`
- Fixació de la versió de Node.js via `.nvmrc` i camp `engines` al `package.json` arrel
- Configuració de **Vitest** als workspaces JS com a framework de testing unificat
- Primers tests unitaris per als tipus de `shared/` (integritat d'enums i estructura d'interfícies)

## Capabilities

### New Capabilities

- `monorepo-setup`: Estructura i configuració del monorepo pnpm amb els workspaces JS (frontend, backend/node-service, shared), scripts globals unificats i fixació de la versió de Node.js
- `shared-types`: Paquet `shared/types/` amb els enums i interfícies base del domini (EstatSeient, IEvent, missatges Socket.IO, User/JwtPayload per auth) accessibles des de frontend i node-service via l'àlies `@shared/*`
- `vitest-setup`: Configuració de Vitest als workspaces JS com a eina de testing unificada; primers tests unitaris que verifiquen els valors dels enums i l'estructura dels tipus compartits; script `pnpm test` operatiu des de l'arrel

### Modified Capabilities

<!-- Cap. Aquesta és la història zero; no hi ha especificacions existents a modificar. -->

## Impact

- **Mòduls afectats**: shared, frontend (configuració TypeScript + Vitest), backend (configuració TypeScript + Vitest)
- **Dependències noves**: pnpm workspaces; versió de Node.js fixada; `vitest` com a devDependency als tres workspaces
- **Tots els desenvolupaments posteriors depenen d'aquesta història**: qualsevol canvi a `shared/types/` tindrà impacte immediat als dos workspaces; el framework de test quedarà establert per a totes les US posteriors
- **No hi ha endpoints REST ni events Socket.IO en aquesta fase**
- **EP-07** (Testing i qualitat de codi) aportarà cobertura E2E i d'integració sobre la base de tests unitaris establerta aquí

## Non-goals

- Implementació de cap funcionalitat de negoci
- Configuració de Docker o contenidors (US-01-02)
- Scaffold complet de node-service: mòduls NestJS (US-01-05)
- Scaffold complet de laravel-service: projecte Laravel (US-01-06)
- Esquema de base de dades o migracions Eloquent (US-01-03)
- Seeds de dades (US-01-04)
- Dockerfiles optimitzats per a producció
- Tests E2E o d'integració (EP-07)
- Configuració d'ESLint/Prettier (US-07-05)

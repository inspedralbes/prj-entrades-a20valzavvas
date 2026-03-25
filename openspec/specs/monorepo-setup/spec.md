# Capability: monorepo-setup

## Purpose

Defineix els requisits per a la configuració del monorepo pnpm, incloent la gestió de workspaces, scripts globals, versió de Node.js, àlies TypeScript i configuració de Vitest.

## Requirements

### Requirement: pnpm workspace arrel operatiu

El sistema SHALL tenir un `pnpm-workspace.yaml` a l'arrel del repositori que declari els paquets JS (`frontend`, `backend/node-service`, `shared`), de manera que `pnpm install` des de l'arrel instal·li totes les dependències dels workspaces en un únic `node_modules` arrel. `backend/laravel-service` és PHP i NO s'inclou.

#### Scenario: Instal·lació unificada des de l'arrel

- **WHEN** s'executa `pnpm install` des de l'arrel del repositori
- **THEN** les dependències dels tres workspaces s'instal·len sense errors
- **THEN** existeix un únic directori `node_modules/` a l'arrel (no duplicats per workspace)

#### Scenario: Arxius de workspace declarats

- **WHEN** s'inspecciona `pnpm-workspace.yaml`
- **THEN** conté exactament tres entrades JS: `frontend`, `backend/node-service`, `shared`
- **THEN** NO conté `backend/laravel-service` (és PHP, no és workspace pnpm)

#### Scenario: Workspace de frontend referencia shared

- **WHEN** s'executa `pnpm --filter frontend install`
- **THEN** el paquet `shared` es resol com a dependència de workspace sense warnings

### Requirement: Scripts globals al package.json arrel

El `package.json` arrel SHALL definir almenys els scripts `dev`, `lint`, `test` i `build`, que deleguen als workspaces corresponents, de manera que qualsevol membre de l'equip pugui operar el projecte sencer des de l'arrel sense entrar a cada directori.

#### Scenario: Script dev arrenca front i node-service en paral·lel

- **WHEN** s'executa `pnpm dev` des de l'arrel
- **THEN** el procés arrenca el servidor de Nuxt 3 (port 3000) i el servidor NestJS node-service (port 3001) simultàniament
- **NOTA**: l'entorn complet amb PostgreSQL s'arrenca via `docker compose up --build`; `pnpm dev` és per a development ràpid sense contenidors

#### Scenario: Script lint cobreix tots els workspaces

- **WHEN** s'executa `pnpm lint` des de l'arrel
- **THEN** s'executa la comprovació de lint als workspaces `frontend`, `backend` i `shared` sense saltar cap workspace

#### Scenario: Script build executa la compilació completa

- **WHEN** s'executa `pnpm build` des de l'arrel
- **THEN** s'executa `build` als tres workspaces i finalitza sense errors de compilació TypeScript

### Requirement: Versió de Node.js fixada

El repositori SHALL incloure un fitxer `.nvmrc` a l'arrel amb la versió LTS de Node.js, i el `package.json` arrel SHALL incloure el camp `engines` amb la versió mínima requerida, per garantir consistència entre entorns locals i CI/CD.

#### Scenario: .nvmrc llegit per nvm

- **WHEN** s'executa `nvm use` des de l'arrel del repositori
- **THEN** nvm canvia a la versió de Node.js especificada al `.nvmrc` sense errors

#### Scenario: engines al package.json arrel

- **WHEN** s'inspecciona el `package.json` arrel
- **THEN** conté el camp `engines.node` amb una versió >= 20.0.0

#### Scenario: Versió incompatible detectada

- **WHEN** s'executa `pnpm install` amb una versió de Node.js inferior a la requerida per `engines`
- **THEN** pnpm mostra un avís de versió incompatible i l'instal·lació falla o avisa

### Requirement: Àlies TypeScript @shared/\* resolt a frontend i backend

Els `tsconfig.json` de `frontend` i `backend` SHALL incloure un camp `paths` que mapegi `@shared/*` al directori `shared/types/`, de manera que les importacions de tipus compartits no requereixin rutes relatives.

#### Scenario: Importació des de backend compila sense errors

- **WHEN** un fitxer de backend importa `import { EstatSeient } from '@shared/seat.types'`
- **THEN** el compilador TypeScript (`tsc --noEmit`) resol la importació sense errors

#### Scenario: Importació des de frontend compila sense errors

- **WHEN** un component de Nuxt 3 importa `import type { ISeient } from '@shared/seat.types'`
- **THEN** el compilador TypeScript (`nuxi typecheck`) resol la importació sense errors

#### Scenario: Ruta inexistent a @shared reporta error

- **WHEN** un fitxer importa `import { Inexistent } from '@shared/inexistent'`
- **THEN** el compilador TypeScript reporta error de mòdul no trobat

### Requirement: Vitest configurat i operatiu als tres workspaces

Cada workspace (`shared/`, `backend/`, `frontend/`) SHALL tenir un `vitest.config.ts` i el script `"test": "vitest run"` al seu `package.json`, de manera que `pnpm test` des de l'arrel executi tots els tests sense errors.

#### Scenario: pnpm test des de l'arrel executa tots els workspaces

- **WHEN** s'executa `pnpm test` des de l'arrel del repositori
- **THEN** Vitest s'executa als workspaces `shared`, `backend` i `frontend` en seqüència
- **THEN** tots els tests passen i el procés finalitza amb codi de sortida 0

#### Scenario: Tests del workspace shared passen

- **WHEN** s'executa `pnpm --filter shared test`
- **THEN** els tests de `shared/types/*.spec.ts` s'executen i passen sense errors

#### Scenario: Àlies @shared/\* resolt dins de Vitest al node-service

- **WHEN** s'executa `pnpm --filter node-service test`
- **THEN** Vitest resol les importacions `@shared/*` via `vite-tsconfig-paths` sense errors de mòdul no trobat

#### Scenario: Un test fallat des de qualsevol workspace atura el CI

- **WHEN** un test de `shared/types/seat.types.spec.ts` falla
- **THEN** `pnpm test` des de l'arrel retorna codi de sortida diferent de 0
- **THEN** el pipeline de CI (GitHub Actions) marca el workflow com a fallat

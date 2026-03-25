## Why

El projecte necessita un Node Service (NestJS) per gestionar tota la capa de temps real: Gateway Socket.IO, Scheduler de crons i client HTTP intern cap a Laravel. El directori actual `backend/` és un scaffold NestJS buit que cal reorganitzar a `src/backend/node-service/` amb els mòduls base configurats, per tal que les iteracions posteriors (Gateway, Scheduler, client HTTP, JWT guard) tinguin una base estable sobre la qual construir.

## What Changes

- Reorganitzar `backend/` → `src/backend/node-service/` amb una estructura de projecte NestJS neta
- Crear mòduls base buits (sense lògica de negoci): `GatewayModule`, `SchedulerModule`, `LaravelClientModule`, `AuthModule`
- Instal·lar dependències NestJS: `@nestjs/websockets`, `socket.io`, `@nestjs/schedule`, `@nestjs/axios`, `@nestjs/jwt`, `@nestjs/config`
- Configurar `ConfigModule` per exposar les variables d'entorn `JWT_SECRET` i `PORT`
- Actualitzar `pnpm-workspace.yaml` per referenciar `backend/node-service` en lloc de `backend`
- Afegir/actualitzar `vitest.config.ts` i `tsconfig.json` per al workspace `node-service`
- Afegir l'àlies `@shared/*` al `tsconfig.json` de `node-service`

## Capabilities

### New Capabilities

- `node-service-scaffold`: Servei NestJS a `src/backend/node-service/` amb els mòduls base (`GatewayModule`, `SchedulerModule`, `LaravelClientModule`, `AuthModule`), dependències instal·lades, `ConfigModule` configurat i servei arrencable sense errors en el port configurable via `PORT`.

### Modified Capabilities

- `monorepo-setup`: L'entrada del workspace pnpm canvia de `backend` a `backend/node-service`. La spec ja declara aquest estat com a objectiu; la implementació ha d'alinear-s'hi.

## Impact

- **Fitxers**: `pnpm-workspace.yaml`, `src/backend/node-service/` (nou arbre de directoris), `package.json` arrel (el script `dev` ha d'arrancar el node-service al port 3001)
- **Dependències**: `@nestjs/websockets`, `socket.io`, `@nestjs/schedule`, `@nestjs/axios`, `@nestjs/jwt`, `@nestjs/config` afegits a `src/backend/node-service/package.json`
- **Entorn**: `.env.example` ha de documentar `JWT_SECRET` i `PORT` (node-service)
- **Testing**: `vitest.config.ts` inicialitzat per al workspace `node-service`; sense lògica de negoci, només cal un smoke-test d'instanciació de mòdul
- **Jira**: [PE-53](https://lightweight-fitness.atlassian.net/browse/PE-53)

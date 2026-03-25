## Context

El directori `backend/` actual conté un scaffold NestJS buit generat per la CLI oficial. Actualment, el `pnpm-workspace.yaml` referencia `backend` com a workspace, però la spec `monorepo-setup` ja defineix l'estat objectiu com a `backend/node-service`. Cal moure el contingut i configurar els mòduls base perquè les iteracions posteriors (Gateway Socket.IO, Scheduler, client HTTP, JWT guard) tinguin una base estable.

Restriccions:
- No s'ha d'introduir cap lògica de negoci en aquest US
- El testing framework és Vitest (no Jest), per coherència amb la resta del monorepo
- Les credencials mai s'hardcodegen: `JWT_SECRET` i `PORT` sempre via `.env`

## Goals / Non-Goals

**Goals:**
- Reorganitzar `backend/` → `src/backend/node-service/` i actualitzar `pnpm-workspace.yaml`
- Registrar quatre mòduls base buits: `GatewayModule`, `SchedulerModule`, `LaravelClientModule`, `AuthModule`
- Instal·lar les dependències NestJS necessàries per a WebSockets, cron, HTTP intern i JWT
- Configurar `ConfigModule` per llegir `JWT_SECRET` i `PORT` des de `.env`
- Garantir que el servei arrenca sense errors (`pnpm --filter node-service start:dev`)
- Bootstrapping de Vitest per al workspace `node-service`
- Afegir l'àlies `@shared/*` al `tsconfig.json` de `node-service`

**Non-Goals:**
- Implementació del Gateway Socket.IO (US-03-xx)
- Implementació del Scheduler de crons (US-04-xx)
- Implementació del client HTTP cap a Laravel (US futurs)
- JWT Guard complet (US-00-06)
- Lògica de negoci de cap mena

## Decisions

### Decisió 1: Moure el directori vs. crear-lo des de zero

**Escollit**: Crear `src/backend/node-service/` des de zero amb la CLI de NestJS (`nest new`) i eliminar `backend/` antic.

**Alternativa descartada**: Renomenar el directori i adaptar fitxers. Comporta riscos de deixar restes (configuració de Jest, `.gitignore` incorrecte, etc.) que podrien interferir amb Vitest.

**Raó**: Partir d'un projecte net i eliminar la configuració per defecte de Jest és més segur i menys propens a errors que fer un renomenament parcial.

---

### Decisió 2: Vitest en lloc de Jest

**Escollit**: Substituir la configuració Jest per defecte de NestJS per Vitest, alineat amb la resta del monorepo.

**Alternativa descartada**: Mantenir Jest al node-service. Generaria inconsistència al `pnpm test` arrel i complicaria el pipeline CI.

**Raó**: El projecte ja usa Vitest a `shared/` i `frontend/`. La coherència facilita el manteniment i evita tenir dos configs de testing.

---

### Decisió 3: ConfigModule global amb validació d'esquema

**Escollit**: `ConfigModule.forRoot({ isGlobal: true })` al `AppModule`. Variables d'entorn llegides via `ConfigService` injectada on calgui.

**Alternativa descartada**: Accedir directament a `process.env`. No permet validació i dificulta el testing.

**Raó**: `ConfigModule` de NestJS permet centralitzar la configuració, validar variables i fer-les injectables, seguint les convencions del projecte.

---

### Decisió 4: Estructura de mòduls base buits

**Escollit**: Quatre mòduls independents registrats a `AppModule`: `GatewayModule`, `SchedulerModule`, `LaravelClientModule`, `AuthModule`. Cada mòdul té el seu fitxer `.module.ts` però sense serveis ni controladors.

**Raó**: Permet implementar cada mòdul en una iteració posterior sense tocar l'`AppModule`. Redueix el risc de conflictes en PRs paral·lels.

## Risks / Trade-offs

- **[Risc] Jest vs Vitest**: La CLI de NestJS genera fitxers `jest.config.ts` i dependències Jest. Cal eliminar-los explícitament. → **Mitigació**: El `package.json` del node-service no ha d'incloure `jest`, `ts-jest` ni `@types/jest`; el script `test` apunta a `vitest run`.

- **[Risc] `@shared/*` no resolt a runtime**: El path alias TypeScript no és suficient per a la resolució a runtime de Node.js. → **Mitigació**: Per al scaffold buit, l'alias és només per a tipus; a mesura que s'implementi lògica, caldrà `tsconfig-paths` o el bundle step resoldrà les importacions.

- **[Trade-off] Scaffold mínim**: El servei arrenca però no exposa cap endpoint ni event útil. Els tests de smoke confirmen l'arrencada però no validen comportament de negoci. Acceptat perquè l'objectiu de l'US és la base, no la funcionalitat.

## Migration Plan

1. Eliminar `backend/` (directori actual buit/scaffold)
2. Crear `src/backend/node-service/` amb `nest new node-service --package-manager pnpm`
3. Eliminar dependències i config de Jest generats per la CLI
4. Afegir dependències: `@nestjs/websockets socket.io @nestjs/schedule @nestjs/axios @nestjs/jwt @nestjs/config`
5. Crear mòduls base: `GatewayModule`, `SchedulerModule`, `LaravelClientModule`, `AuthModule`
6. Registrar mòduls a `AppModule` junt amb `ConfigModule.forRoot({ isGlobal: true })`
7. Afegir `vitest.config.ts` i script `test` al `package.json`
8. Afegir àlies `@shared/*` al `tsconfig.json`
9. Actualitzar `pnpm-workspace.yaml`: `backend/node-service` en lloc de `backend`
10. Actualitzar scripts del `package.json` arrel si cal
11. Afegir `JWT_SECRET` i `PORT` (node-service) a `.env.example`
12. Verificar: `pnpm install` + `pnpm --filter node-service start:dev` arrenca sense errors

**Rollback**: El scaffold és addible; en cas de problema, es pot eliminar `src/backend/node-service/` i restaurar `backend/` des de git.

## Open Questions

- Cap pregunta oberta: el scope és clar i delimitat per la US-01-05.

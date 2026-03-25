## 1. Arrel del monorepo

- [x] 1.1 Crear `pnpm-workspace.yaml` a l'arrel amb els tres paquets: `frontend`, `backend`, `shared` *(paths finals: `src/frontend`, `src/backend/node-service`, `src/shared` — vegeu §9)*
- [x] 1.2 Crear `.nvmrc` a l'arrel amb la versió Node.js LTS (`20`)
- [x] 1.3 Crear `package.json` arrel amb `name`, `private: true`, camp `engines` (node >= 20) i scripts globals: `dev`, `lint`, `test`, `build`, `type-check`
- [x] 1.4 Verificar que `pnpm install` des de l'arrel s'executa sense errors

## 2. Paquet shared

- [x] 2.1 Crear `shared/package.json` amb `name: "shared"`, `version: "0.0.1"`, sense `dependencies`
- [x] 2.2 Crear `shared/tsconfig.json` bàsic (target ES2022, module NodeNext, strict)
- [x] 2.3 Crear `shared/types/seat.types.ts` amb l'enum `EstatSeient` (DISPONIBLE, RESERVAT, VENUT) i la interfície `ISeient`
- [x] 2.4 Crear `shared/types/event.types.ts` amb la interfície `IEvent`
- [x] 2.5 Crear `shared/types/socket.types.ts` amb `SeientCanviEstatPayload`, `ReservaConfirmadaPayload`, `ReservaRebutjadaPayload`
- [x] 2.6 Crear `shared/types/index.ts` que re-exporti tots els tipus dels tres fitxers

## 3. Scaffold backend (NestJS)

- [x] 3.1 Inicialitzar `backend/` amb `npx @nestjs/cli new backend --skip-git --package-manager pnpm` o crear manualment l'estructura mínima
- [x] 3.2 Actualitzar `backend/package.json` per afegir `"shared": "workspace:*"` a `dependencies`
- [x] 3.3 Actualitzar `backend/tsconfig.json` per afegir `paths: { "@shared/*": ["../shared/types/*"] }`
- [x] 3.4 Afegir `tsconfig-paths` com a dependència de `backend` i registrar-lo a `backend/src/main.ts`
- [x] 3.5 Crear un fitxer `backend/src/test-shared-import.ts` temporal que importi `EstatSeient` des de `@shared/seat.types` i verificar que `tsc --noEmit` passa

## 4. Scaffold frontend (Nuxt 3)

- [x] 4.1 Inicialitzar `frontend/` amb `npx nuxi@latest init frontend --no-install` o crear manualment l'estructura mínima de Nuxt 3
- [x] 4.2 Actualitzar `frontend/package.json` per afegir `"shared": "workspace:*"` a `dependencies`
- [x] 4.3 Actualitzar `frontend/tsconfig.json` (o `nuxt.config.ts` via `alias`) per afegir `@shared/*` apuntant a `../shared/types/`
- [x] 4.4 Crear un composable temporal `frontend/composables/testShared.ts` que importi `ISeient` des de `@shared/seat.types` i verificar que `nuxi typecheck` passa
- [x] 4.5 Eliminar els fitxers temporals de test d'importació (3.5 i 4.4)

## 5. Configuració de Vitest

- [x] 5.1 Afegir `vitest` com a `devDependency` a `shared/package.json` i crear `shared/vitest.config.ts` (mode node, globals: true)
- [x] 5.2 Afegir `vitest` i `vite-tsconfig-paths` com a `devDependencies` a `backend/package.json` i crear `backend/vitest.config.ts` (mode node, globals: true, plugins: [tsconfigPaths()])
- [x] 5.3 Afegir `vitest` i `@nuxt/test-utils` com a `devDependencies` a `frontend/package.json` i crear `frontend/vitest.config.ts`
- [x] 5.4 Afegir el script `"test": "vitest run"` als `package.json` de `shared`, `backend` i `frontend`
- [x] 5.5 Verificar que `pnpm test` des de l'arrel executa els tres workspaces sense errors (amb 0 tests inicialment)

## 6. Tests unitaris de shared/types

- [x] 6.1 Crear `shared/types/seat.types.spec.ts`: tests per a `EstatSeient` (valors de string correctes, exactament 3 membres)
- [x] 6.2 Crear `shared/types/event.types.spec.ts`: test que verifica que un objecte que compleix `IEvent` passa la comprovació de TypeScript (via test de tipus amb `@ts-expect-error`)
- [x] 6.3 Crear `shared/types/socket.types.spec.ts`: tests que verifiquen que `SeientCanviEstatPayload`, `ReservaConfirmadaPayload` i `ReservaRebutjadaPayload` accepten objectes vàlids
- [x] 6.4 Executar `pnpm --filter shared test` i confirmar que tots els tests passen

## 7. Verificació final (Definition of Done)

- [x] 7.1 Executar `pnpm install` des de l'arrel i confirmar que no hi ha errors
- [x] 7.2 Verificar que `pnpm --filter backend type-check` (o `tsc --noEmit`) passa sense errors de resolució `@shared/*`
- [x] 7.3 Verificar que `pnpm --filter frontend type-check` (o `nuxi typecheck`) passa sense errors de resolució `@shared/*`
- [x] 7.4 Verificar que `pnpm test` des de l'arrel passa tots els workspaces amb codi de sortida 0
- [x] 7.5 Verificar que `shared/package.json` no té `dependencies` de runtime
- [x] 7.6 Confirmar que `.nvmrc` existeix i conté la versió correcta de Node.js
- [x] 7.7 Confirmar que `pnpm-workspace.yaml` declara els tres workspaces correctament

## 8. Adaptació v2.0 — Pivotatge arquitectural (pendent, tasques de US-01-05 i EP-00)

> Les tasques 8.x deriven del pivotatge arquitectural (backend dual Node+Laravel). La 8.1-8.3 les executa US-01-05; la 8.4-8.6 les executa aquesta mateixa US com a addició a shared/types.

- [x] 8.1 Renomenar `backend/` → `backend/node-service/` (US-01-05 — PE-53)
- [x] 8.2 Actualitzar `pnpm-workspace.yaml`: canviar `backend` per `backend/node-service` (US-01-05 — PE-53)
- [x] 8.3 Verificar que `pnpm --filter node-service type-check` passa sense errors de resolució `@shared/*` amb els nous paths `../../shared/types/*`
- [x] 8.4 Crear `shared/types/auth.types.ts` amb `UserRole` enum (`COMPRADOR`, `ADMIN`) i interfícies `IUser` i `IJwtPayload`
- [x] 8.5 Crear `shared/types/auth.types.spec.ts` amb tests per a `UserRole` (valors de string, exactament 2 membres)
- [x] 8.6 Verificar que `pnpm --filter shared test` passa incloent els nous tests d'auth

## 9. Reorganització sota `src/` i fitxers arrel

> Tot el codi font de l'aplicació s'agrupa sota `src/` per separar-lo dels fitxers de configuració del monorepo.

- [x] 9.1 Moure `frontend/`, `backend/` i `shared/` dins de `src/`
- [x] 9.2 Actualitzar `pnpm-workspace.yaml`: paths `src/frontend`, `src/backend/node-service`, `src/shared`
- [x] 9.3 Verificar que els paths relatius `@shared/*` entre workspaces segueixen resolent-se correctament (els workspaces continuen sent germans dins de `src/`)
- [x] 9.4 Crear `.gitignore` a l'arrel (node_modules, dist, .nuxt, .env, vendor Laravel, logs)
- [x] 9.5 Crear `README.md` a l'arrel amb arquitectura, stack, scripts i instruccions d'instal·lació
- [x] 9.6 Verificar que `pnpm test` passa des de l'arrel amb la nova estructura

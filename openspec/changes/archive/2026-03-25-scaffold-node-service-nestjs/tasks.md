## 1. Preparació del directori

- [x] 1.1 Eliminar el contingut actual de `backend/` (scaffold buit) mantenint el directori
- [x] 1.2 Crear el projecte NestJS a `backend/node-service/` amb `nest new node-service --package-manager pnpm --skip-git`
- [x] 1.3 Eliminar dependències i configuració de Jest generats per la CLI (`jest`, `ts-jest`, `@types/jest`, `jest.config.ts`)
- [x] 1.4 Eliminar el script `test` de Jest del `package.json` de `node-service`

## 2. Dependències i configuració de paquets

- [x] 2.1 Afegir dependències: `pnpm --filter node-service add @nestjs/websockets socket.io @nestjs/schedule @nestjs/axios @nestjs/jwt @nestjs/config`
- [x] 2.2 Afegir `vite-tsconfig-paths` com a dev dependency per al suport de `@shared/*` a Vitest
- [x] 2.3 Verificar que `backend/node-service/package.json` no conté cap referència a Jest

## 3. Configuració TypeScript

- [x] 3.1 Afegir l'àlies `"@shared/*": ["../../shared/types/*"]` al camp `compilerOptions.paths` de `backend/node-service/tsconfig.json`
- [x] 3.2 Verificar que `pnpm --filter node-service build` compila sense errors

## 4. Workspace pnpm i scripts arrel

- [x] 4.1 Actualitzar `pnpm-workspace.yaml`: substituir `backend` per `backend/node-service`
- [x] 4.2 Verificar que el script `dev` del `package.json` arrel arrenca el node-service al port 3001
- [x] 4.3 Executar `pnpm install` des de l'arrel i verificar que les dependències de `node-service` s'instal·len sense errors

## 5. Mòduls base NestJS

- [x] 5.1 Crear `backend/node-service/src/gateway/gateway.module.ts` (mòdul buit)
- [x] 5.2 Crear `backend/node-service/src/scheduler/scheduler.module.ts` (mòdul buit)
- [x] 5.3 Crear `backend/node-service/src/laravel-client/laravel-client.module.ts` (mòdul buit)
- [x] 5.4 Crear `backend/node-service/src/auth/auth.module.ts` (mòdul buit)
- [x] 5.5 Actualitzar `backend/node-service/src/app.module.ts` per importar `ConfigModule.forRoot({ isGlobal: true })` i els quatre mòduls base

## 6. Variables d'entorn

- [x] 6.1 Afegir `JWT_SECRET=` i `PORT=3001` (secció node-service) al fitxer `.env.example` arrel
- [x] 6.2 Verificar que cap fitxer de `backend/node-service/src/` conté valors hardcodejats de secrets

## 7. Configuració de Vitest

- [x] 7.1 Crear `backend/node-service/vitest.config.ts` amb el plugin `vite-tsconfig-paths`
- [x] 7.2 Afegir el script `"test": "vitest run"` al `package.json` de `node-service`
- [x] 7.3 Crear el test de smoke `backend/node-service/src/app.module.spec.ts` que verifica que `AppModule` s'instancia correctament

## 8. Tests i verificació final

- [x] 8.1 Executar `pnpm --filter node-service test` i verificar que el smoke test passa
- [x] 8.2 Executar `pnpm --filter node-service build` i verificar que compila sense errors TypeScript
- [x] 8.3 Executar `pnpm --filter node-service start:dev` amb `JWT_SECRET` i `PORT` definits i verificar arrencada a `http://localhost:3001`
- [x] 8.4 Executar `pnpm test` des de l'arrel i verificar que `node-service` s'inclou en el resultat
- [x] 8.5 Executar `pnpm lint` des de l'arrel i verificar que passa sense errors

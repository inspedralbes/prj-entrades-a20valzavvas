## ADDED Requirements

### Requirement: Directori node-service operatiu com a workspace pnpm

El sistema SHALL tenir un projecte NestJS a `src/backend/node-service/` declarat com a workspace pnpm, de manera que `pnpm install` des de l'arrel instal·li les seves dependències i `pnpm --filter node-service <script>` funcioni correctament.

#### Scenario: Workspace declarat correctament

- **GIVEN** que `pnpm-workspace.yaml` existeix a l'arrel
- **WHEN** s'inspecciona el fitxer
- **THEN** conté l'entrada `src/backend/node-service`
- **THEN** NO conté l'entrada `backend` (directori anterior)

#### Scenario: Instal·lació des de l'arrel inclou node-service

- **WHEN** s'executa `pnpm install` des de l'arrel del repositori
- **THEN** les dependències de `src/backend/node-service` s'instal·len sense errors
- **THEN** no apareix cap warning de workspace no trobat

#### Scenario: Testabilitat — workspace resolt per pnpm

- **WHEN** s'executa `pnpm --filter node-service exec echo "ok"`
- **THEN** la comanda s'executa correctament i retorna "ok"

---

### Requirement: Servei NestJS arrenca sense errors

El servei SHALL arrencar correctament quan `JWT_SECRET` i `PORT` estan definits com a variables d'entorn, escoltant al port especificat per `PORT` (per defecte 3001).

#### Scenario: Arrencada correcta amb variables d'entorn definides

- **GIVEN** que `JWT_SECRET` i `PORT=3001` estan definits a l'entorn
- **WHEN** s'executa `pnpm --filter node-service start:dev`
- **THEN** el servei arrenca a `http://localhost:3001` sense errors de compilació ni d'execució
- **THEN** el log mostra "Nest application successfully started"

#### Scenario: Port configurable via variable d'entorn

- **GIVEN** que `PORT=4000` està definit a l'entorn
- **WHEN** s'executa `pnpm --filter node-service start:dev`
- **THEN** el servei escolta al port 4000, no al 3001

#### Scenario: Testabilitat — smoke test d'arrencada de l'AppModule

- **WHEN** s'executa `pnpm --filter node-service test`
- **THEN** el test de smoke `src/app.module.spec.ts` passa verificant que `AppModule` es pot instanciar sense errors

---

### Requirement: Mòduls base registrats a AppModule

L'`AppModule` SHALL importar els quatre mòduls base (`GatewayModule`, `SchedulerModule`, `LaravelClientModule`, `AuthModule`) i el `ConfigModule` global, de manera que estiguin disponibles per a implementació posterior sense modificar l'`AppModule`.

#### Scenario: Mòduls presents a l'estructura del projecte

- **WHEN** s'inspecciona `src/backend/node-service/src/`
- **THEN** existeixen els fitxers `gateway/gateway.module.ts`, `scheduler/scheduler.module.ts`, `laravel-client/laravel-client.module.ts`, `auth/auth.module.ts`

#### Scenario: AppModule importa tots els mòduls base

- **WHEN** s'inspecciona `src/backend/node-service/src/app.module.ts`
- **THEN** els imports inclouen `GatewayModule`, `SchedulerModule`, `LaravelClientModule`, `AuthModule` i `ConfigModule.forRoot({ isGlobal: true })`

#### Scenario: Testabilitat — mòduls instanciables

- **WHEN** s'executa `pnpm --filter node-service test`
- **THEN** el test de smoke comprova que cap mòdul llança excepció en inicialitzar-se

---

### Requirement: Dependències NestJS reals-time instal·lades

El `package.json` de `node-service` SHALL incloure les dependències `@nestjs/websockets`, `socket.io`, `@nestjs/schedule`, `@nestjs/axios`, `@nestjs/jwt` i `@nestjs/config`, de manera que els mòduls posteriors puguin importar-les sense afegir nous paquets.

#### Scenario: Dependències presents al package.json

- **WHEN** s'inspecciona `src/backend/node-service/package.json`
- **THEN** el camp `dependencies` inclou: `@nestjs/websockets`, `socket.io`, `@nestjs/schedule`, `@nestjs/axios`, `@nestjs/jwt`, `@nestjs/config`

#### Scenario: Compilació TypeScript sense errors de tipus

- **WHEN** s'executa `pnpm --filter node-service build`
- **THEN** la compilació finalitza sense errors de TypeScript
- **THEN** el directori `dist/` es genera correctament

#### Scenario: Testabilitat — imports resolts per Vitest

- **WHEN** s'executa `pnpm --filter node-service test`
- **THEN** Vitest resol els imports de `@nestjs/websockets`, `@nestjs/schedule`, `@nestjs/axios`, `@nestjs/jwt` i `@nestjs/config` sense errors de mòdul no trobat

---

### Requirement: ConfigModule llegeix JWT_SECRET i PORT des de l'entorn

El `ConfigModule` SHALL estar configurat com a global i el servei SHALL llegir `JWT_SECRET` i `PORT` des de variables d'entorn, sense valors hardcodejats al codi.

#### Scenario: JWT_SECRET accessible via ConfigService

- **GIVEN** que `JWT_SECRET=test-secret` està definit a l'entorn
- **WHEN** un mòdul injecta `ConfigService` i crida `configService.get('JWT_SECRET')`
- **THEN** retorna `'test-secret'`

#### Scenario: Cap credencial hardcodejada al codi

- **WHEN** s'inspecciona qualsevol fitxer de `src/backend/node-service/src/`
- **THEN** no apareix cap valor literal de secret o token

#### Scenario: .env.example documenta les variables requerides

- **WHEN** s'inspecciona `.env.example` a l'arrel del repositori
- **THEN** conté les entrades `JWT_SECRET=` i `PORT=3001` (node-service) documentades

#### Scenario: Testabilitat — ConfigService injectable en tests

- **WHEN** s'executa `pnpm --filter node-service test`
- **THEN** el test de smoke pot sobreescriure `JWT_SECRET` via `ConfigModule.forRoot({ envFilePath: '.env.test' })` o variables de procés sense errors

---

### Requirement: Vitest configurat i operatiu al workspace node-service

El workspace `node-service` SHALL tenir un `vitest.config.ts` i el script `"test": "vitest run"` al seu `package.json`, de manera que `pnpm test` des de l'arrel inclogui els tests del node-service.

#### Scenario: Script test present al package.json

- **WHEN** s'inspecciona `src/backend/node-service/package.json`
- **THEN** el camp `scripts.test` és `"vitest run"`
- **THEN** NO conté referències a `jest` ni `ts-jest`

#### Scenario: vitest.config.ts present i vàlid

- **WHEN** s'inspecciona `src/backend/node-service/vitest.config.ts`
- **THEN** el fitxer existeix i configura Vitest amb el plugin `vite-tsconfig-paths` per resoldre `@shared/*`

#### Scenario: pnpm test des de l'arrel inclou node-service

- **WHEN** s'executa `pnpm test` des de l'arrel
- **THEN** Vitest s'executa també al workspace `node-service`
- **THEN** el test de smoke `src/app.module.spec.ts` passa

---

### Requirement: Àlies @shared/* resolt al node-service

El `tsconfig.json` de `node-service` SHALL incloure un camp `paths` que mapegi `@shared/*` a `../../shared/types/*`, de manera que les importacions de tipus compartits funcionin sense rutes relatives.

#### Scenario: Importació de tipus shared compila sense errors

- **GIVEN** que existeix `shared/types/seat.types.ts`
- **WHEN** un fitxer de `node-service` importa `import { EstatSeient } from '@shared/seat.types'`
- **THEN** el compilador TypeScript resol la importació sense errors

#### Scenario: Àlies present al tsconfig.json

- **WHEN** s'inspecciona `src/backend/node-service/tsconfig.json`
- **THEN** el camp `compilerOptions.paths` conté `"@shared/*": ["../../shared/types/*"]`

#### Scenario: Testabilitat — Vitest resol @shared/*

- **WHEN** s'executa `pnpm --filter node-service test`
- **THEN** Vitest resol `@shared/*` via `vite-tsconfig-paths` sense errors de mòdul no trobat

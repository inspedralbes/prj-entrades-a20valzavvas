## MODIFIED Requirements

### Requirement: Mòduls base registrats a AppModule

L'`AppModule` SHALL importar els quatre mòduls base (`GatewayModule`, `SchedulerModule`, `LaravelClientModule`, `AuthModule`) i el `ConfigModule` global, de manera que estiguin disponibles per a implementació posterior sense modificar l'`AppModule`.

`LaravelClientModule` SHALL registrar `HttpModule` (via `registerAsync`) i exportar `LaravelClientService`, de manera que importar `LaravelClientModule` a altres mòduls proporcioni el client HTTP sense configuració addicional.

#### Scenario: Mòduls presents a l'estructura del projecte

- **GIVEN** que el projecte està configurat
- **WHEN** s'inspecciona `src/backend/node-service/src/`
- **THEN** existeixen els fitxers `gateway/gateway.module.ts`, `scheduler/scheduler.module.ts`, `laravel-client/laravel-client.module.ts`, `laravel-client/laravel-client.service.ts`, `auth/auth.module.ts`

#### Scenario: AppModule importa tots els mòduls base

- **WHEN** s'inspecciona `src/backend/node-service/src/app.module.ts`
- **THEN** els imports inclouen `GatewayModule`, `SchedulerModule`, `LaravelClientModule`, `AuthModule` i `ConfigModule.forRoot({ isGlobal: true })`

#### Scenario: LaravelClientModule exporta LaravelClientService

- **WHEN** s'inspecciona `src/backend/node-service/src/laravel-client/laravel-client.module.ts`
- **THEN** el mòdul importa `HttpModule.registerAsync(...)` i exporta `LaravelClientService`

#### Scenario: Testabilitat — mòduls instanciables

- **WHEN** s'executa `pnpm --filter node-service test`
- **THEN** el test de smoke comprova que cap mòdul llança excepció en inicialitzar-se

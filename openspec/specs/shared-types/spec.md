# Capability: shared-types

## Purpose

Defineix els requisits per als tipus TypeScript compartits entre frontend i backend, exportats des del paquet `shared/`. Inclou tipus de domini (seients, esdeveniments), payloads de Socket.IO, tipus d'autenticació JWT i les condicions del paquet shared (sense dependències de runtime, amb tests unitaris).

## Requirements

### Requirement: Enum EstatSeient exportat a shared/types/seat.types.ts

El fitxer `shared/types/seat.types.ts` SHALL exportar l'enum `EstatSeient` amb els tres valors possibles del domini (`DISPONIBLE`, `RESERVAT`, `VENUT`), i la interfície `ISeient` amb tots els camps necessaris per representar un seient al mapa.

#### Scenario: Enum EstatSeient conté els tres valors correctes

- **WHEN** s'importa `EstatSeient` des de `@shared/seat.types`
- **THEN** l'enum conté exactament tres membres: `DISPONIBLE`, `RESERVAT` i `VENUT`
- **THEN** els valors de l'enum coincideixen amb els valors de la columna `seat_status` de la BD (Eloquent migration — v2.0, Prisma eliminat)

#### Scenario: Interfície ISeient conté tots els camps obligatoris

- **WHEN** s'inspecciona la interfície `ISeient` a `shared/types/seat.types.ts`
- **THEN** conté els camps: `id: string`, `fila: string`, `numero: number`, `estat: EstatSeient`, `preu: number`, `categoria: string`, `colorHex: string`

#### Scenario: EstatSeient reutilitzable al backend sense duplicació

- **WHEN** el `SeatsService` del backend necessita comprovar l'estat d'un seient
- **THEN** utilitza `EstatSeient` importat des de `@shared/seat.types` sense redefinir l'enum localment

### Requirement: Interfície IEvent exportada a shared/types/event.types.ts

El fitxer `shared/types/event.types.ts` SHALL exportar la interfície `IEvent` amb els camps mínims necessaris per representar un esdeveniment a la portada pública i a la pàgina de l'event.

#### Scenario: IEvent conté tots els camps de la resposta de l'API pública

- **WHEN** s'inspecciona la interfície `IEvent` a `shared/types/event.types.ts`
- **THEN** conté els camps: `id: string`, `slug: string`, `nom: string`, `data: string`, `hora: string`, `recinte: string`, `imatgeUrl: string`, `totalSeients: number`, `seientsDisponibles: number`

#### Scenario: Nuxt 3 utilitza IEvent per tipar la resposta de l'API

- **WHEN** un composable de Nuxt 3 crida `GET /api/events` i rep la resposta
- **THEN** pot assignar la resposta al tipus `IEvent[]` sense errors TypeScript

#### Scenario: Node-service utilitza IEvent com a forma del DTO de resposta

- **WHEN** `EventsController` del node-service (o el LaravelClientService) retorna la llista d'esdeveniments
- **THEN** el tipus de retorn és compatible amb `IEvent[]` importat des de `@shared/event.types`

### Requirement: Tipus de missatges Socket.IO exportats a shared/types/socket.types.ts

El fitxer `shared/types/socket.types.ts` SHALL exportar les interfícies de tots els payloads d'events Socket.IO del protocol del sistema, tant dels events client→servidor com dels events servidor→client.

#### Scenario: Payload de seient:canvi-estat tipat

- **WHEN** el `SeatsGateway` emet un event `seient:canvi-estat`
- **THEN** el payload s'ha de conformar a la interfície `SeientCanviEstatPayload` que conté: `seatId: string`, `estat: EstatSeient`, `fila: string`, `numero: number`

#### Scenario: Payload de reserva:confirmada tipat

- **WHEN** el servidor envia una confirmació de reserva al client
- **THEN** el payload s'ha de conformar a la interfície `ReservaConfirmadaPayload` que conté: `seatId: string`, `expiraEn: string`

#### Scenario: Payload de reserva:rebutjada tipat

- **WHEN** el servidor rebutja una sol·licitud de reserva
- **THEN** el payload s'ha de conformar a la interfície `ReservaRebutjadaPayload` que conté: `seatId: string`, `motiu: string`

#### Scenario: Socket.IO plugin del frontend utilitza els tipus compartits

- **WHEN** `plugins/socket.client.ts` gestiona l'event `seient:canvi-estat`
- **THEN** el paràmetre del handler és tipat com a `SeientCanviEstatPayload` importat des de `@shared/socket.types`

### Requirement: Paquet shared sense dependències de runtime

El paquet `shared/` SHALL contenir únicament fitxers de tipus TypeScript (`.ts` amb `export type` o `export enum`) i NO SHALL tenir dependències de runtime (cap `dependencies` al seu `package.json`), per garantir que sigui lleuger i no introdueixi riscos de seguretat per dependències transitives.

#### Scenario: package.json de shared no té dependencies

- **WHEN** s'inspecciona `shared/package.json`
- **THEN** el camp `dependencies` és absent o buit
- **THEN** el camp `devDependencies` pot contenir únicament `typescript` i `vitest`

#### Scenario: shared no importa mòduls externs

- **WHEN** s'inspeccionen tots els fitxers a `shared/types/`
- **THEN** cap `import` dels fitxers de tipus referencia un paquet extern (tots els imports apunten a fitxers interns del workspace `shared`)

### Requirement: Interfície User i JwtPayload exportades a shared/types/auth.types.ts

> **NOU — v2.0.** El sistema d'autenticació JWT requereix tipus compartits entre el frontend (Pinia store auth) i el node-service (JWT guard). Laravel emet el token; node-service i frontend el consumeixen.

El fitxer `shared/types/auth.types.ts` SHALL exportar la interfície `IUser` amb els camps de l'usuari autenticat i la interfície `IJwtPayload` amb els camps del token JWT.

#### Scenario: IUser conté els camps del perfil autenticat

- **WHEN** s'inspecciona la interfície `IUser` a `shared/types/auth.types.ts`
- **THEN** conté els camps: `id: string`, `name: string`, `email: string`, `role: UserRole`

#### Scenario: UserRole enum conté els dos rols del sistema

- **WHEN** s'importa `UserRole` des de `@shared/auth.types`
- **THEN** l'enum conté exactament dos membres: `COMPRADOR = 'comprador'` i `ADMIN = 'admin'`

#### Scenario: IJwtPayload tipat per al guard de NestJS

- **WHEN** el `JwtGuard` del node-service verifica un token
- **THEN** el payload decodificat és assignable a `IJwtPayload` que conté: `sub: string` (userId), `email: string`, `role: UserRole`, `iat: number`, `exp: number`

#### Scenario: Frontend Pinia store auth utilitza IUser

- **WHEN** la store `auth.ts` de Nuxt rep la resposta del login
- **THEN** el camp `user` de l'estat és tipat com a `IUser` importat des de `@shared/auth.types`

### Requirement: Tests unitaris dels tipus de shared

Cada fitxer de tipus de `shared/types/` SHALL tenir un fitxer `*.spec.ts` co-localitzat que verifiqui, com a mínim, els valors dels enums i la forma dels objectes, de manera que cap refactor canviï accidentalment un valor que el backend o el frontend esperen.

#### Scenario: EstatSeient té els valors de string correctes

- **WHEN** s'executa el test de `shared/types/seat.types.spec.ts`
- **THEN** `EstatSeient.DISPONIBLE === 'DISPONIBLE'`
- **THEN** `EstatSeient.RESERVAT === 'RESERVAT'`
- **THEN** `EstatSeient.VENUT === 'VENUT'`

#### Scenario: EstatSeient té exactament tres membres

- **WHEN** s'executa el test de `shared/types/seat.types.spec.ts`
- **THEN** `Object.values(EstatSeient)` retorna exactament 3 elements

#### Scenario: ISeient té tots els camps obligatoris en temps de compilació

- **WHEN** un codi intenta crear un objecte `ISeient` sense el camp `estat`
- **THEN** el compilador TypeScript reporta error de tipus
- **THEN** el test de tipus (via `@ts-expect-error`) verifica que l'error és el comportament esperat

#### Scenario: Tests de shared passen sense necessitat de Docker ni BD

- **WHEN** s'executa `pnpm --filter shared test` en un entorn net sense base de dades
- **THEN** tots els tests passen amb codi de sortida 0 (els tests de shared no depenen de cap servei extern)

# Backlog Jira — Sala Onirica

## Plataforma de Venda d'Entrades en Temps Real

> **Projecte fictici inspirat en un cinema de culte de Barcelona.**  
> Sala Onirica és un cinema independent que ofereix projeccions en 4K, Dolby Atmos i sessions especials de cinema de culte. Les seves sessions s'esgoten en minuts, cosa que fa imprescindible una plataforma robusta de venda en temps real.

---

## Taula de dependències

> **v2.0 — Pivotatge arquitectural:** S'afegeix EP-00 (Auth) i nous tickets d'infraestructura (US-01-05 a US-01-08) per al backend dual Node+Laravel i el proxy Nginx. US-01-03 passa de Prisma a Eloquent (Laravel).

| ID       | Títol                                        | Depèn de                                         | Bloqueja                                                                       |
| -------- | -------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------ |
| US-01-01 | Inicialització del monorepo pnpm             | —                                                | Totes les altres                                                               |
| US-01-02 | Entorn local Docker Compose (5 serveis)      | US-01-01                                         | US-01-03, US-01-04 i tot el dev                                                |
| US-01-05 | Scaffold Node Service (NestJS temps real)    | US-01-01                                         | US-01-08, US-03-02, US-04-01                                                   |
| US-01-06 | Scaffold Laravel Service (API + BD)          | US-01-02                                         | US-01-03, US-00-01, US-02-01                                                   |
| US-01-07 | Configuració Nginx proxy invers              | US-01-02                                         | US-01-08, US-00-01                                                             |
| US-01-08 | Client HTTP intern Node → Laravel            | US-01-05, US-01-06                               | US-03-02, US-04-01, US-04-05                                                   |
| US-01-03 | Esquema BD amb Eloquent (Laravel migrations) | US-01-06                                         | US-01-04, US-02-01, US-03-01, US-04-01, US-05-01, US-06-01                     |
| US-01-04 | Seed de dades inicials (Laravel seeder)      | US-01-03                                         | US-03-01, US-04-01, US-07-01                                                   |
| US-00-01 | Configuració Laravel Sanctum JWT             | US-01-06, US-01-03                               | US-00-02, US-00-03, US-00-06                                                   |
| US-00-02 | Endpoint register (POST /api/auth/register)  | US-00-01                                         | US-00-04                                                                       |
| US-00-03 | Endpoint login (POST /api/auth/login)        | US-00-01                                         | US-00-04                                                                       |
| US-00-04 | Middleware auth frontend (Nuxt)              | US-00-02, US-00-03                               | US-04-06, US-05-01, US-02-01                                                   |
| US-00-05 | Pàgines /auth/login i /auth/register (Nuxt)  | US-00-02, US-00-03                               | US-00-04                                                                       |
| US-00-06 | Validació JWT al Node Service (WS guard)     | US-00-01, US-01-05                               | US-03-02, US-04-01                                                             |
| US-02-01 | Llistat d'esdeveniments (admin)              | US-01-03, US-00-04                               | US-02-02, US-02-03, US-02-04, US-02-05                                         |
| US-02-02 | Crear esdeveniment                           | US-02-01                                         | US-02-03, US-02-05, US-03-01, US-07-03                                         |
| US-02-03 | Editar esdeveniment                          | US-02-02                                         | —                                                                              |
| US-02-04 | Eliminar esdeveniment                        | US-02-01                                         | —                                                                              |
| US-02-05 | Publicar / despublicar                       | US-02-02                                         | US-03-01 (requereix event publicat)                                            |
| US-03-01 | Visualització del mapa de seients            | US-01-03, US-01-04, US-02-02                     | US-03-02, US-04-01, US-07-01                                                   |
| US-03-02 | Sincronització d'estat en temps real         | US-03-01, US-01-08, US-00-06                     | US-03-03, US-04-01, US-04-08, US-06-01, US-09-03, US-09-04                     |
| US-03-03 | Indicador de connexió WS                     | US-03-02                                         | —                                                                              |
| US-04-01 | Reserva temporal d'un seient                 | US-03-01, US-03-02, US-00-06                     | US-04-02, US-04-03, US-04-04, US-04-05, US-04-06, US-04-08, US-07-01, US-07-04 |
| US-04-02 | Límit de seients per usuari                  | US-04-01                                         | —                                                                              |
| US-04-03 | Temporitzador visible de reserva             | US-04-01                                         | US-04-05, US-07-02                                                             |
| US-04-04 | Alliberament voluntari d'una reserva         | US-04-01                                         | —                                                                              |
| US-04-05 | Expiració automàtica al servidor (cron)      | US-04-01, US-04-03, US-01-08                     | US-09-04                                                                       |
| US-04-06 | Formulari de checkout                        | US-04-01, US-00-04                               | US-04-07                                                                       |
| US-04-07 | Confirmació de compra                        | US-04-06                                         | US-05-01, US-06-01, US-06-02, US-09-02                                         |
| US-04-08 | Gestió de conflicte concurrent               | US-04-01, US-03-02                               | —                                                                              |
| US-05-01 | Consulta d'entrades de l'usuari              | US-04-07, US-00-04                               | —                                                                              |
| US-06-01 | Dashboard admin en temps real                | US-03-02, US-04-07                               | US-06-02, US-09-01                                                             |
| US-06-02 | Informe de vendes per categoria              | US-04-07, US-06-01                               | US-09-02                                                                       |
| US-07-01 | Tests unitaris stores Pinia                  | US-03-01, US-04-01                               | US-08-01                                                                       |
| US-07-02 | Tests unitaris composables                   | US-04-03                                         | US-08-01                                                                       |
| US-07-03 | Tests de rutes i navegació                   | US-02-02                                         | US-08-01                                                                       |
| US-07-04 | Test de concurrència                         | US-04-01                                         | US-08-01                                                                       |
| US-07-05 | Configuració ESLint i Prettier               | US-01-01                                         | US-08-01                                                                       |
| US-08-01 | Pipeline CI (GitHub Actions)                 | US-07-01, US-07-02, US-07-03, US-07-04, US-07-05 | US-08-02, US-08-03, US-08-05                                                   |
| US-08-02 | Workflow deploy Node Service                 | US-08-01                                         | —                                                                              |
| US-08-03 | Workflow deploy frontend                     | US-08-01                                         | —                                                                              |
| US-08-04 | Migració automàtica BD en deploy             | US-08-01                                         | —                                                                              |
| US-08-05 | Workflow deploy Laravel Service              | US-08-01                                         | US-08-04                                                                       |
| US-09-01 | Gràfic d'ocupació en temps real              | US-06-01                                         | —                                                                              |
| US-09-02 | Gràfic d'evolució de vendes                  | US-06-02                                         | —                                                                              |
| US-09-03 | Animacions de canvi d'estat de seients       | US-03-02                                         | —                                                                              |
| US-09-04 | Reconnexió WS amb recuperació d'estat        | US-04-05, US-03-02                               | —                                                                              |

### Ordre de desenvolupament recomanat

```
Fase 1 — Fonaments
  US-01-01 → US-01-02 → US-01-03 → US-01-04 → US-07-05

Fase 2 — CRUD d'esdeveniments (admin)
  US-02-01 → US-02-02 → US-02-03 → US-02-04 → US-02-05

Fase 3 — Mapa de seients i temps real
  US-03-01 → US-03-02 → US-03-03

Fase 4 — Flux de reserva i compra (nucli crític)
  US-04-01 → US-04-02 → US-04-03 → US-04-04
           → US-04-05 → US-04-06 → US-04-07 → US-04-08

Fase 5 — Consulta i panell admin
  US-05-01 || US-06-01 → US-06-02

Fase 6 — Testing i CI/CD
  US-07-01 → US-07-02 → US-07-03 → US-07-04
  US-08-01 → US-08-02 → US-08-03 → US-08-04

Fase 7 — Opcionals
  US-09-01 || US-09-02 || US-09-03 || US-09-04
```

---

## Estructura d'Èpiques

```
EP-00  Autenticació i seguretat (JWT — NOU v2.0)
EP-01  Infraestructura i configuració inicial del monorepo (actualitzat v2.0)
EP-02  Gestió d'esdeveniments (CRUD Admin)
EP-03  Mapa de seients en temps real
EP-04  Flux de reserva i compra
EP-05  Consulta d'entrades
EP-06  Panell d'administració i informes
EP-07  Testing i qualitat de codi
EP-08  Infraestructura, CI/CD i desplegament (actualitzat v2.0)
EP-09  Funcionalitats opcionals (gràfics i UX avançada)
```

### Ordre de desenvolupament recomanat (v2.0)

```
Fase 1 — Fonaments
  US-01-01 → US-01-02 → US-01-05 + US-01-06 (paral·lel) → US-01-07 → US-01-08 → US-07-05

Fase 2 — Esquema BD i Auth (nucli de seguretat)
  US-01-03 → US-01-04
  US-00-01 → US-00-02 + US-00-03 (paral·lel) → US-00-04 + US-00-05 + US-00-06 (paral·lel)

Fase 3 — CRUD d'esdeveniments (admin)
  US-02-01 → US-02-02 → US-02-03 → US-02-04 → US-02-05

Fase 4 — Mapa de seients i temps real
  US-03-01 → US-03-02 → US-03-03

Fase 5 — Flux de reserva i compra (nucli crític)
  US-04-01 → US-04-02 → US-04-03 → US-04-04
           → US-04-05 → US-04-06 → US-04-07 → US-04-08

Fase 6 — Consulta i panell admin
  US-05-01 || US-06-01 → US-06-02

Fase 7 — Testing i CI/CD
  US-07-01 → US-07-02 → US-07-03 → US-07-04
  US-08-01 → US-08-02 + US-08-03 + US-08-04 + US-08-05

Fase 8 — Opcionals
  US-09-01 || US-09-02 || US-09-03 || US-09-04
```

---

## EP-00 — Autenticació i seguretat

> **NOU — v2.0.** Implementar el sistema d'autenticació JWT complet: register i login via Laravel Sanctum, middleware de protecció de rutes al frontend Nuxt, i validació de JWT al Node Service per a connexions WebSocket. Tots els fluxos de reserva i compra requeriran un token JWT vàlid.

---

### US-00-01 — Configuració Laravel Sanctum per a JWT

#### CONTEXT

Laravel Sanctum és el paquet oficial de Laravel per a autenticació API via tokens. Ha de quedar configurat com a base per als endpoints de register i login, i generar tokens JWT compatibles amb el secret compartit que també usarà el Node Service.

#### USER STORY

**Com a** enginyera del projecte,
**vull** tenir Laravel Sanctum instal·lat i configurat per emetre tokens JWT,
**per tal de** que tots els serveis (Laravel + Node) puguin validar tokens sense consultar la BD en cada petició.

#### ESPECIFICACIONS

**Requisits funcionals**

- Instal·lar `laravel/sanctum` via composer
- Configurar `sanctum.php` amb el TTL del token (configurable via env)
- El model `User` ha de tenir `HasApiTokens`
- `JWT_SECRET` compartit definit a `.env` i accessible via `config('sanctum.secret')`
- Migració de la taula `personal_access_tokens` (inclosa per Sanctum)

**Requisits no funcionals**

- `JWT_SECRET` mai hardcoded; injectat via variable d'entorn
- El secret ha de ser idèntic a la variable `JWT_SECRET` del Node Service

#### CRITERIS D'ACCEPTACIÓ

**Criteri 1 — Sanctum operatiu**

- DONAT que `JWT_SECRET` existeix al `.env` de Laravel
- QUAN s'executa `php artisan migrate`
- ALESHORES la taula `personal_access_tokens` existeix i el paquet Sanctum retorna tokens

---

### US-00-02 — Endpoint register (POST /api/auth/register)

#### CONTEXT

Qualsevol persona que vulgui comprar entrades ha de poder crear un compte. El formulari recull nom, email i contrasenya. El servidor valida, crea l'usuari i retorna el token JWT per iniciar sessió directament.

#### USER STORY

**Com a** visitant sense compte,
**vull** poder registrar-me amb nom, email i contrasenya,
**per tal de** obtenir un token JWT i poder reservar seients.

#### ESPECIFICACIONS

**Requisits funcionals**

- `POST /api/auth/register` accessible sense autenticació
- Validació: `name` (required), `email` (required, unique, valid format), `password` (required, min 8, confirmed)
- Crear usuari amb `role = comprador` per defecte
- Retornar `{ token, user: { id, name, email, role } }` amb codi `201`
- Errors de validació retornen `422` amb missatges per camp

**Requisits no funcionals**

- La contrasenya s'emmagatzema com a hash bcrypt (Laravel ho fa per defecte)
- L'endpoint és accessible des del proxy Nginx (`/api/auth/register`)

#### CRITERIS D'ACCEPTACIÓ

**Criteri 1 — Registre correcte**

- DONAT un payload vàlid (`name`, `email`, `password`, `password_confirmation`)
- QUAN es fa `POST /api/auth/register`
- ALESHORES es retorna `201` amb un `token` JWT i les dades de l'usuari

**Criteri 2 — Validació d'email duplicat**

- DONAT un email ja registrat a la BD
- QUAN es fa `POST /api/auth/register` amb el mateix email
- ALESHORES es retorna `422` amb l'error `email: The email has already been taken.`

---

### US-00-03 — Endpoint login (POST /api/auth/login)

#### CONTEXT

Els usuaris registrats han de poder autenticar-se per obtenir un token JWT fresc. El token s'usarà en totes les crides REST i en el handshake WebSocket.

#### USER STORY

**Com a** usuari registrat,
**vull** poder fer login amb el meu email i contrasenya,
**per tal de** obtenir un token JWT i accedir a les funcionalitats protegides.

#### ESPECIFICACIONS

**Requisits funcionals**

- `POST /api/auth/login` accessible sense autenticació
- Validació: `email` (required), `password` (required)
- Verificar credencials contra la BD (`Hash::check`)
- Retornar `{ token, user: { id, name, email, role } }` amb codi `200`
- Credencials incorrectes retornen `401` amb `{ message: "Credencials incorrectes" }`

#### CRITERIS D'ACCEPTACIÓ

**Criteri 1 — Login correcte**

- DONAT un email i contrasenya vàlids
- QUAN es fa `POST /api/auth/login`
- ALESHORES es retorna `200` amb un `token` JWT vàlid

**Criteri 2 — Login fallit**

- DONAT una contrasenya incorrecta
- QUAN es fa `POST /api/auth/login`
- ALESHORES es retorna `401`

---

### US-00-04 — Middleware d'autenticació al frontend (Nuxt)

#### CONTEXT

Les rutes protegides del frontend (`/checkout`, `/entrades`, `/admin/*`) han de redirigir a `/auth/login` si l'usuari no té un token JWT vàlid emmagatzemat. El token es desa a `localStorage` i s'exposa via la store `auth` de Pinia.

#### USER STORY

**Com a** sistema,
**vull** que les rutes protegides del frontend validen el JWT i redirigeixen si no existeix,
**per tal de** que cap usuari no autenticat pugui accedir a funcionalitats de compra o administració.

#### ESPECIFICACIONS

**Requisits funcionals**

- `stores/auth.ts`: estat `{ token, user, isAuthenticated }`, accions `login()`, `logout()`, `register()`
- `middleware/auth.ts`: comprova `auth.isAuthenticated`; si és fals, redirigeix a `/auth/login`
- `middleware/admin.ts`: comprova `auth.user.role === 'admin'`; si no, redirigeix a `/`
- Rutes protegides: `/checkout`, `/entrades` → middleware `auth`
- Rutes d'admin: `/admin/**` → middleware `admin`
- El token es persista a `localStorage` i es recupera en `app.vue` al muntar

#### CRITERIS D'ACCEPTACIÓ

**Criteri 1 — Redirecció sense token**

- DONAT un usuari sense token JWT
- QUAN navega a `/checkout`
- ALESHORES és redirigit a `/auth/login`

**Criteri 2 — Accés admin sense rol**

- DONAT un usuari autenticat amb rol `comprador`
- QUAN navega a `/admin`
- ALESHORES és redirigit a `/`

---

### US-00-05 — Pàgines /auth/login i /auth/register (Nuxt)

#### CONTEXT

Cal una interfície d'usuari per al login i el registre. Són les úniques pàgines accessibles sense autenticació (a part de la portada i la pàgina d'un esdeveniment en mode lectura).

#### USER STORY

**Com a** visitant,
**vull** tenir formularis de login i registre clars i funcionals,
**per tal de** poder crear un compte o autenticar-me abans de reservar entrades.

#### ESPECIFICACIONS

**Requisits funcionals**

- `/auth/register`: camps `name`, `email`, `password`, `password_confirmation`; crida `auth.register()`; en èxit redirigeix a `/`
- `/auth/login`: camps `email`, `password`; crida `auth.login()`; en èxit redirigeix a la ruta anterior o `/`
- Mostrar errors de validació del servidor per camp
- Mostrar estat de càrrega durant la petició

#### CRITERIS D'ACCEPTACIÓ

**Criteri 1 — Registre i redirecció**

- DONAT el formulari de registre amb dades vàlides
- QUAN l'usuari fa submit
- ALESHORES es crida `POST /api/auth/register`, el token es desa, i l'usuari és redirigit a `/`

---

### US-00-06 — Validació JWT al Node Service (WebSocket Guard)

#### CONTEXT

Les connexions WebSocket al Node Service (NestJS) han de verificar que el client porta un token JWT vàlid. Sense accés a la BD, el Node Service valida la signatura JWT usant el `JWT_SECRET` compartit amb Laravel.

#### USER STORY

**Com a** sistema,
**vull** que el Node Service rebutgi connexions WebSocket sense token JWT vàlid,
**per tal de** que cap usuari no autenticat pugui emetre events `seient:reservar`.

#### ESPECIFICACIONS

**Requisits funcionals**

- `JwtGuard` a NestJS: extreu token del handshake (query param `token` o header)
- Valida la signatura JWT amb `JWT_SECRET` (via `@nestjs/jwt` o `jsonwebtoken`)
- Extreu `userId` i `role` del payload i els afegeix al context del socket
- Connexions sense token vàlid reben `disconnect` amb codi `401`
- El client Nuxt envia el token al connectar: `io(url, { auth: { token } })`

#### CRITERIS D'ACCEPTACIÓ

**Criteri 1 — Connexió autenticada**

- DONAT un client amb JWT vàlid
- QUAN es connecta al WebSocket
- ALESHORES la connexió s'estableix i `socket.data.userId` conté l'ID de l'usuari

**Criteri 2 — Connexió rebutjada**

- DONAT un client sense JWT o amb JWT expirat
- QUAN intenta connectar-se al WebSocket
- ALESHORES rep un error de connexió `401`

---

## EP-01 — Infraestructura i configuració inicial del monorepo

> **Actualitzat v2.0.** Preparar l'esquelet del projecte: monorepo pnpm, Docker Compose amb 5 serveis (postgres, node-service, laravel-service, frontend, nginx), scaffold de Node Service (NestJS) i scaffold de Laravel Service, configuració del proxy Nginx i client HTTP intern Node→Laravel.

---

### US-01-01 — Inicialització del monorepo pnpm

#### CONTEXT

El projecte és un monorepo que conté frontend (Nuxt 3), backend (NestJS) i tipus compartits (TypeScript). Sense una configuració inicial correcta, el desenvolupament en paral·lel és inviable i la reutilització de tipus entre capes és impossible. Aquesta història és el fonament zero de tot el projecte.

#### USER STORY

**Com a** enginyera del projecte, responsable de tota l'arquitectura,  
**vull** tenir un monorepo pnpm amb `frontend/`, `backend/` i `shared/` configurats i operatius,  
**per tal de** poder treballar amb un sol `pnpm install`, compartir tipus TypeScript entre front i back, i executar scripts globals de manera unificada.

#### ESPECIFICACIONS

**Requisits funcionals**

- `pnpm-workspace.yaml` ha de declarar els tres paquets: `frontend`, `backend`, `shared`
- El directori `shared/types/` ha de contenir: `seat.types.ts`, `event.types.ts`, `socket.types.ts` amb els enums i interfícies base del domini
- Els `tsconfig.json` de `frontend` i `backend` han de tenir un `path alias` que resolgui `@shared/*`
- Scripts arrel: `pnpm dev` (arrenca front i back), `pnpm lint`, `pnpm test`, `pnpm build`

**Requisits no funcionals**

- Seguretat: N/A en aquesta fase
- Consideracions tècniques: versió de Node.js fixada via `.nvmrc` o `engines` al `package.json` arrel per garantir consistència entre entorns locals i CI

#### ALCANCE

**Inclòs**

- Estructura de directoris del monorepo
- Configuració pnpm workspaces
- Paquet `shared` amb tipus base del domini
- Scripts globals al `package.json` arrel

**Fora d'abast**

- Implementació de cap funcionalitat de negoci
- Configuració de Docker (US-01-02)
- Esquema de BD (US-01-03)

#### DEPENDÈNCIES

Cap. Aquesta és la història zero del projecte.

#### ÍNDEX DE RETRABAJO

**Baix.** L'estructura de directoris és difícilment canviable un cop el projecte estigui en marxa, però els canvis en tipus de `shared` tindran impacte a ambdues capes. El risc s'és amb bones interfícies des del principi.

#### CRITERIS D'ACCEPTACIÓ

**Criteri 1 — Instal·lació unificada**

- DONAT que existeix el `pnpm-workspace.yaml` a l'arrel
- QUAN s'executa `pnpm install` des de l'arrel del projecte
- ALESHORES s'instal·len les dependències dels tres workspaces sense errors i existeix un únic `node_modules` a l'arrel

**Criteri 2 — Tipus compartits resolts**

- DONAT que `shared/types/seat.types.ts` exporta l'enum `EstatSeient`
- QUAN s'importa `EstatSeient` des de `backend/src` o `frontend/` usant l'àlies `@shared/seat.types`
- ALESHORES el compilador TypeScript resol la importació sense errors

---

### US-01-02 — Entorn local amb Docker Compose (5 serveis + Nginx)

#### CONTEXT

**Actualitzat v2.0.** El projecte ara té 5 serveis: PostgreSQL, Laravel Service (API + BD), Node Service (temps real), Nuxt Frontend i Nginx com a proxy invers. Nginx és l'únic punt d'entrada i delega: `/ws` → Node, `/api` → Laravel, `/` → Nuxt. Sense Nginx, el frontend hauria de gestionar múltiples URLs i els CORS serien complexos.

#### USER STORY

**Com a** enginyera del projecte,
**vull** tenir un `docker-compose.yml` amb els 5 serveis i Nginx configurat com a proxy invers,
**per tal de** tenir un únic punt d'entrada (`http://localhost`) que delegui correctament a cada servei.

#### ESPECIFICACIONS

**Requisits funcionals**

- Servei `postgres`: imatge `postgres:16`, healthcheck per garantir que els altres serveis no arrenquin fins que la BD estigui llesta
- Servei `laravel-service`: `build: ./backend/laravel-service`, port intern `8000`, `depends_on: postgres (healthy)`
- Servei `node-service`: `build: ./backend/node-service`, port intern `3001`, `depends_on: laravel-service`
- Servei `frontend`: `build: ./frontend`, port intern `3000`
- Servei `nginx`: imatge `nginx:alpine`, **únic servei amb port extern** `80:80`, `volumes: ./nginx/nginx.conf`
- `nginx.conf` amb: `/ws` → node-service (WebSocket upgrade), `/api` → laravel-service, `/` → frontend
- Fitxer `.env.example` amb totes les variables: `JWT_SECRET`, `LARAVEL_APP_KEY`, `DB_*`, `RESERVATION_TTL_MINUTES`
- Xarxa Docker interna `backend-net` que connecta node-service i laravel-service sense exposar ports

**Requisits no funcionals**

- Cap credencial hardcoded al `docker-compose.yml`
- El `JWT_SECRET` és el mateix per a laravel-service i node-service (secret compartit)
- `backend-net` aïlla la comunicació interna de l'exterior

#### ALCANCE

**Inclòs**

- `docker-compose.yml` a l'arrel
- `nginx/nginx.conf` bàsic (desenvolupament)
- `.env.example` documentat amb totes les variables
- Dockerfiles de desenvolupament (no optimitzats per producció)

**Fora d'abast**

- Dockerfiles multi-stage per a producció (US-08-02, US-08-03, US-08-05)

#### DEPENDÈNCIES

- **US-01-01**: estructura del monorepo amb els directoris `backend/node-service/`, `backend/laravel-service/`, `nginx/`

#### CRITERIS D'ACCEPTACIÓ

**Criteri 1 — Arrencada unificada**

- DONAT un fitxer `.env` basat en `.env.example`
- QUAN s'executa `docker compose up --build`
- ALESHORES els 5 serveis arrenquen sense errors; `http://localhost` retorna el frontend Nuxt; `http://localhost/api/health` retorna `200` des de Laravel; `ws://localhost/ws` accepta connexions WebSocket

**Criteri 2 — Proxy correcte**

- DONAT que tots els serveis estan actius
- QUAN el frontend fa `fetch('/api/events')`
- ALESHORES Nginx ho delega a laravel-service sense que el client conegui el port intern

**Criteri 3 — Sense credencials en codi**

- DONAT que el repositori és públic
- QUAN s'inspecciona `docker-compose.yml` i `nginx.conf`
- ALESHORES no hi ha cap contrasenya, secret ni clau hardcoded

---

### US-01-03 — Esquema de base de dades amb Eloquent (Laravel Migrations)

#### CONTEXT

**Actualitzat v2.0.** L'accés a la BD és responsabilitat exclusiva del Laravel Service. Per tant, l'esquema es defineix amb **Eloquent migrations** (Laravel), no amb Prisma. S'afegeix la taula `users` per a l'autenticació. El `user_id` substitueix el `session_token` en `reservations` i `orders`.

#### USER STORY

**Com a** enginyera del projecte,
**vull** tenir les migrations Laravel completes amb totes les entitats, relacions i enums,
**per tal de** poder executar `php artisan migrate` i tenir la BD preparada per a tots els serveis.

#### ESPECIFICACIONS

**Requisits funcionals**

- Entitats amb migrations individuals: `users`, `events`, `price_categories`, `seats`, `reservations`, `orders`, `order_items`
- Taula `users`: `id` (UUID), `name`, `email` (unique), `password`, `role` (enum: `comprador`, `admin`), timestamps
- Enum `seat_status`: `DISPONIBLE`, `RESERVAT`, `VENUT` (implementat com a string amb check constraint o enum MySQL/PG)
- `Reservation.user_id` (FK → users) substitueix `session_token`
- `Order.user_id` (FK → users) substitueix `session_token`
- `Reservation.expires_at` indexat per al cron d'expiració
- `Event.slug` unique
- Models Eloquent corresponents amb relacions definides (`hasMany`, `belongsTo`, etc.)

**Requisits no funcionals**

- Totes les PKs són UUID (`Str::uuid()` o `$table->uuid('id')->primary()`)
- Les credencials de BD mai hardcoded; s'injecten via `.env`
- Migrations ordenades (timestamps en el nom de fitxer) per garantir ordre d'aplicació correcte

#### ALCANCE

**Inclòs**

- Fitxers de migració a `backend/laravel-service/database/migrations/`
- Models Eloquent a `backend/laravel-service/app/Models/`
- Execució de `php artisan migrate` en el contenidor `laravel-service`

**Fora d'abast**

- Dades de prova (US-01-04)
- Lògica de negoci als models (validació, scopes avançats)

#### DEPENDÈNCIES

- **US-01-06**: scaffold de Laravel Service operatiu
- **US-01-02**: Docker amb PostgreSQL accessible per executar migrations

#### CRITERIS D'ACCEPTACIÓ

**Criteri 1 — Migració exitosa**

- DONAT que PostgreSQL és accessible i el `.env` té les credencials correctes
- QUAN s'executa `php artisan migrate` al contenidor `laravel-service`
- ALESHORES totes les taules es creen sense errors

**Criteri 2 — Models amb relacions**

- DONAT que les migrations s'han aplicat
- QUAN es consulta `Event::with(['seats', 'priceCategories'])->first()`
- ALESHORES Eloquent retorna les relacions correctament
- ALESHORES s'exporta el tipus `Seat` amb el camp `estat` tipat com a `SeatStatus` (enum TypeScript)

---

### US-01-04 — Seed de dades inicials

#### CONTEXT

Durant el desenvolupament i les demos del projecte cal disposar d'un estat inicial consistent: un esdeveniment real amb seients, categories i preus sense haver de crear-ho manualment cada vegada. El seed és també la base dels tests automatitzats.

#### USER STORY

**Com a** enginyera del projecte,  
**vull** tenir un script de seed que creï un esdeveniment complet de Sala Onirica,  
**per tal de** poder iniciar el desenvolupament i les demos amb dades coherents de manera reproducible.

#### ESPECIFICACIONS

**Requisits funcionals**

- El seed crea (o upsert si ja existeix):
  - 1 Event: _"Dune: Projecció Especial 4K Dolby Atmos"_, slug `dune-4k-dolby-2026`, 15/06/2026, 21:00h, recinte Sala Onirica, max 4 seients per usuari, publicat: true
  - 2 PriceCategories: VIP (50€, color `#7C3AED`, files A–B) i General (25€, color `#16A34A`, files C–J)
  - 200 Seats (10 files × 20 seients), tots amb `estat: DISPONIBLE`
- El seed és idempotent: executar-lo dues vegades no duplica dades

**Requisits no funcionals**

- El seed s'executa amb: `php artisan db:seed` al contenidor `laravel-service`
- Ha d'executar-se en < 10 segons
- Afegir també 1 usuari admin i 1 usuari comprador de prova

#### ALCANCE

**Inclòs**

- `backend/laravel-service/database/seeders/DatabaseSeeder.php`

**Fora d'abast**

- Seeds per a múltiples esdeveniments (N/A en aquesta fase)
- Dades de reservations o orders (les creen els tests)

#### DEPENDÈNCIES

- **US-01-03**: l'esquema ha d'existir i les migracions han d'estar aplicades

#### ÍNDEX DE RETRABAJO

**Baix.** El seed és independent de la lògica de negoci. Si l'esquema canvia, el seed s'actualitza puntualment.

#### CRITERIS D'ACCEPTACIÓ

**Criteri 1 — Seed executat correctament**

- DONAT que les migracions s'han aplicat i PostgreSQL és accessible
- QUAN s'executa `php artisan db:seed` al contenidor laravel-service
- ALESHORES existeixen a la BD: 1 Event, 2 PriceCategories, 200 Seats, 1 usuari admin i 1 usuari comprador

**Criteri 2 — Idempotència**

- DONAT que el seed s'ha executat una primera vegada
- QUAN s'executa el seed una segona vegada
- ALESHORES el nombre de seients a la BD continua sent 200 (no es dupliquen)

---

### US-01-05 — Scaffold del Node Service (NestJS temps real)

#### CONTEXT

El Node Service és responsable de tota la capa de temps real: Socket.IO Gateway, Scheduler de crons i client HTTP intern cap a Laravel. Cal crear el projecte NestJS net (renomenant i adaptant l'actual `backend/` que és un scaffold buit) amb els mòduls base però sense lògica de negoci.

#### USER STORY

**Com a** enginyera del projecte,
**vull** tenir el Node Service (NestJS) amb els mòduls base configurats,
**per tal de** poder implementar el Gateway de Socket.IO, el Scheduler i el client HTTP intern en iteracions posteriors.

#### ESPECIFICACIONS

**Requisits funcionals**

- Directori: `backend/node-service/` (reorganitzar l'actual `backend/` que és un scaffold NestJS buit)
- Mòduls creats (buits, sense lògica): `GatewayModule`, `SchedulerModule`, `LaravelClientModule`, `AuthModule` (JWT guard)
- `@nestjs/websockets` i `socket.io` instal·lats
- `@nestjs/schedule` instal·lat (per al cron)
- `@nestjs/axios` instal·lat (per al client HTTP intern)
- `@nestjs/jwt` instal·lat (per a la validació JWT)
- Variable d'entorn `JWT_SECRET` llegida via `ConfigModule`
- `pnpm-workspace.yaml` actualitzat: `backend/node-service` en lloc de `backend`

**Requisits no funcionals**

- El servei arrenca correctament amb `pnpm dev` sense errors
- Port configurable via `PORT` env var

#### CRITERIS D'ACCEPTACIÓ

**Criteri 1 — Arrencada correcta**

- DONAT que `JWT_SECRET` i `PORT` estan definits
- QUAN s'executa `pnpm --filter node-service start:dev`
- ALESHORES el servei arrenca a `http://localhost:3001` sense errors

---

### US-01-06 — Scaffold del Laravel Service (API + BD)

#### CONTEXT

El Laravel Service és el nou servei responsable de tot l'accés a la BD, l'autenticació i els endpoints REST. Cal crear el projecte Laravel net amb la configuració base i les dependències necessàries (Sanctum).

#### USER STORY

**Com a** enginyera del projecte,
**vull** tenir el Laravel Service creat amb la configuració base i Sanctum instal·lat,
**per tal de** poder implementar les migrations, els controllers i l'autenticació en iteracions posteriors.

#### ESPECIFICACIONS

**Requisits funcionals**

- Directori: `backend/laravel-service/`
- Crear projecte Laravel via `composer create-project laravel/laravel laravel-service`
- Instal·lar `laravel/sanctum` via composer
- `config/database.php` configurat per a PostgreSQL
- Totes les variables de BD i `JWT_SECRET` llegides de `.env`
- Endpoint de health check: `GET /api/health` → `{ status: "ok" }` (per al Docker healthcheck)
- Configurar CORS per permetre peticions des del frontend (via Nginx)
- Rutes base: `routes/api.php` (públiques + auth) i `routes/internal.php` (xarxa Docker interna)

**Requisits no funcionals**

- El servei arrenca correctament amb `php artisan serve` o dins del contenidor Docker
- `APP_KEY` generada i emmagatzemada al `.env` (mai al repositori)

#### CRITERIS D'ACCEPTACIÓ

**Criteri 1 — Arrencada i health check**

- DONAT que les variables d'entorn estan configurades
- QUAN es fa `GET /api/health`
- ALESHORES retorna `200 { status: "ok" }`

---

### US-01-07 — Configuració Nginx com a proxy invers

#### CONTEXT

Nginx és el punt d'entrada únic de l'aplicació. Delega `/ws` al Node Service (amb suport WebSocket), `/api` al Laravel Service, i `/` al frontend Nuxt. Sense Nginx, el frontend hauria de conèixer els ports interns de cada servei, i els CORS i els WebSockets serien difícils de gestionar.

#### USER STORY

**Com a** enginyera del projecte,
**vull** tenir Nginx configurat com a proxy invers amb les regles de routing correctes,
**per tal de** que el browser pugui accedir a tots els serveis des del port 80 amb una URL única.

#### ESPECIFICACIONS

**Requisits funcionals**

- `nginx/nginx.conf` amb:
  - `location /ws`: `proxy_pass http://node-service:3001`, headers de WebSocket upgrade (`Upgrade`, `Connection`)
  - `location /api`: `proxy_pass http://laravel-service:8000`, headers `Authorization`, `X-Real-IP`
  - `location /`: `proxy_pass http://frontend:3000`
- El fitxer s'injecta al contenidor nginx via volume a `docker-compose.yml`
- Timeouts configurats per a connexions WebSocket llargues (`proxy_read_timeout 3600s`)

#### CRITERIS D'ACCEPTACIÓ

**Criteri 1 — Proxy REST**

- DONAT que tots els serveis estan actius
- QUAN el browser fa `GET http://localhost/api/health`
- ALESHORES Nginx delega a Laravel i retorna `200`

**Criteri 2 — Proxy WebSocket**

- DONAT que node-service i nginx estan actius
- QUAN un client Socket.IO es connecta a `ws://localhost/ws`
- ALESHORES la connexió WebSocket s'estableix correctament a través de Nginx

---

### US-01-08 — Client HTTP intern Node → Laravel

#### CONTEXT

El Node Service necessita cridar Laravel per executar operacions de BD (reservar seient, alliberar reserva, obtenir estadístiques). Aquesta comunicació és interna a la xarxa Docker (no passa per Nginx) i és el nexe crític entre els dos serveis de backend.

#### USER STORY

**Com a** enginyera del projecte,
**vull** tenir un `LaravelClient` a NestJS que faci crides HTTP a Laravel de manera consistent,
**per tal de** que el Gateway i el Scheduler puguin delegar operacions de BD a Laravel.

#### ESPECIFICACIONS

**Requisits funcionals**

- `LaravelClientService` a `backend/node-service/src/laravel-client/`
- Usarà `HttpService` de `@nestjs/axios` configurat amb `LARAVEL_INTERNAL_URL` (base URL del contenidor laravel-service)
- Mètodes a implementar (buits en aquesta US, s'ompliran en US-03-02 i US-04-01):
  - `reserveSeat(seatId, userId)` → POST `/internal/seats/reserve`
  - `releaseSeat(seatId)` → DELETE `/internal/seats/{id}/reserve`
  - `expireReservations()` → POST `/internal/seats/expire`
  - `getStats(eventId)` → GET `/internal/stats/{eventId}`
- Gestió d'errors HTTP: si Laravel retorna `4xx` o `5xx`, el client ha de llançar l'excepció corresponent a NestJS

**Requisits no funcionals**

- `LARAVEL_INTERNAL_URL` llegit via `ConfigModule`
- Timeout configurable (per defecte 5s)
- Les crides internes no passen per Nginx (xarxa Docker directa)

#### CRITERIS D'ACCEPTACIÓ

**Criteri 1 — Health check intern**

- DONAT que laravel-service i node-service estan a la mateixa xarxa Docker
- QUAN el `LaravelClientService` fa una crida a `GET /api/health`
- ALESHORES rep `200` de Laravel sense passar per Nginx

---

## EP-02 — Gestió d'esdeveniments (CRUD Admin)

> L'administrador de Sala Onirica pot crear i gestionar les projeccions especials des del panell d'admin.

---

### US-02-01 — Llistat d'esdeveniments al panell d'admin

#### CONTEXT

L'administradora necessita un punt d'entrada per veure i gestionar tota la programació de Sala Onirica. Sense aquest llistat, no és possible accedir a les accions de CRUD ni tenir visió de l'estat global del catàleg.

#### USER STORY

**Com a** administradora de Sala Onirica, amb accés total al panell de gestió,  
**vull** veure una llista de tots els esdeveniments (publicats i esborranys),  
**per tal de** tenir una visió global de la programació i accedir a les accions de gestió.

#### ESPECIFICACIONS

**Requisits funcionals**

- `GET /api/admin/events` retorna tots els esdeveniments independentment de `publicat`
- Camps mostrats: nom, data, hora, recinte, estat (Publicat / Esborrany), seients disponibles / reservats / venuts
- Accions per fila: Editar, Eliminar, Publicar/Despublicar
- Paginació N/A en aquesta fase (volum acadèmic)

**Requisits no funcionals**

- Seguretat: l'endpoint `/api/admin/*` requereix autenticació JWT vàlida i rol `admin`. El middleware `admin.ts` del frontend redirigeix a `/` si el token no és present o el rol no és `admin`. El backend Laravel aplica `auth:sanctum` + validació de rol a tots els endpoints `/api/admin/*`.
- Consideració: la ruta `/admin` ha de ser `ssr: false` per evitar exposar dades d'admin en el HTML inicial

#### ALCANCE

**Inclòs**

- Endpoint `GET /api/admin/events`
- Pàgina `/admin/events` amb la taula d'esdeveniments
- Middleware d'admin bàsic al backend

**Fora d'abast**

- Formulari de creació (US-02-02)

#### DEPENDÈNCIES

- **US-01-03**: l'entitat `Event` ha d'existir a la BD
- **US-00-04**: el middleware `admin.ts` al frontend ha d'estar configurat

#### ÍNDEX DE RETRABAJO

**Baix.** El llistat és una lectura simple; quan s'afegeixi autenticació real, el middleware s'adapta sense tocar la lògica de presentació.

#### CRITERIS D'ACCEPTACIÓ

**Criteri 1 — Llistat complet**

- DONAT que existeixen 3 esdeveniments (2 publicats, 1 esborrany)
- QUAN s'accedeix a `GET /api/admin/events`
- ALESHORES la resposta retorna els 3 esdeveniments, incloent l'esborrany

**Criteri 2 — Distinció visual d'estat**

- DONAT que la pàgina `/admin/events` ha carregat
- QUAN hi ha un esdeveniment amb `publicat: false`
- ALESHORES es mostra amb una etiqueta/badge visual diferent als publicats

---

### US-02-02 — Crear un nou esdeveniment

#### CONTEXT

La principal funcionalitat de l'admin és afegir noves projeccions a la cartellera. El formulari de creació és complex perquè genera no sols l'Event, sinó també les categories de preu i tots els seients associats en una sola operació transaccional.

#### USER STORY

**Com a** administradora de Sala Onirica,  
**vull** poder crear un nou esdeveniment amb categories de preu i seients des d'un formulari,  
**per tal de** posar en venda noves projeccions especials sense intervenció tècnica directa.

#### ESPECIFICACIONS

**Requisits funcionals**

- Camps de l'Event: nom, slug (auto-generat des del nom, editable), data, hora, recinte, descripció, URL imatge, max seients per usuari, publicat (toggle)
- Secció categories: llista dinàmica de categories (nom, preu, color hex, files assignades com a text: `A,B`)
- Camp `seients_per_fila`: enter que genera automàticament els seients en backend (fila A–Z × 1..N)
- Regla de negoci: la suma de files de totes les categories ha de cobrir totes les files definides (validació backend)
- `POST /api/admin/events` retorna `201` amb l'Event creat incloent el recompte de seients generats

**Validacions**

- Slug únic (retorna `409` si duplicat)
- Data ha de ser futura
- Preu > 0 per a cada categoria
- Almenys una categoria de preu

**Requisits no funcionals**

- La creació de l'Event + categories + seients s'ha de fer en una sola transacció Eloquent (si falla la creació de seients, no es crea l'Event)

#### ALCANCE

**Inclòs**

- Endpoint `POST /api/admin/events`
- Pàgina `/admin/events/new` amb el formulari complet
- Generació automàtica de seients al backend

**Fora d'abast**

- Edició posterior de seients individuals
- Upload d'imatge al servidor (s'usa URL externa per ara)

#### DEPENDÈNCIES

- **US-02-01**: navegació i layout de l'admin
- **US-01-03**: entitats de BD necessàries

#### ÍNDEX DE RETRABAJO

**Mig.** Si en el futur s'afegeix upload d'imatge o un editor de plànol custom, cal modificar el formulari. El backend (lògica de creació transaccional) és estable.

#### CRITERIS D'ACCEPTACIÓ

**Criteri 1 — Creació exitosa**

- DONAT que el formulari té tots els camps vàlids (nom, data futura, 1 categoria, 5 seients per fila)
- QUAN s'envia `POST /api/admin/events`
- ALESHORES la resposta és `201`, l'Event existeix a la BD i s'han creat tots els seients amb `estat: DISPONIBLE`

**Criteri 2 — Slug duplicat**

- DONAT que ja existeix un Event amb `slug: dune-4k-dolby-2026`
- QUAN s'envia `POST /api/admin/events` amb el mateix slug
- ALESHORES la resposta és `409 Conflict` amb un missatge clar; l'usuari veu l'error inline al camp slug

---

### US-02-03 — Editar un esdeveniment existent

#### CONTEXT

Les dades d'una projecció (hora, descripció, imatge) poden canviar abans de la venda. L'administradora necessita poder corregir informació sense haver de recrear l'esdeveniment.

#### USER STORY

**Com a** administradora de Sala Onirica,  
**vull** poder editar les dades generals d'un esdeveniment,  
**per tal de** corregir o actualitzar informació sense afectar les reserves existents.

#### ESPECIFICACIONS

**Requisits funcionals**

- `PUT /api/admin/events/:id` actualitza camps generals (nom, hora, descripció, imatge, publicat)
- La pàgina `/admin/events/[id]` carrega les dades actuals del formulari
- No es permet modificar categories o seients si hi ha `reserves` o `order_items` associats (retorna `422` amb avís)
- Feedback visual de confirmació en guardar

**Requisits no funcionals**

- N/A — operació CRUD estàndard sense requisits de seguretat addicionals en aquesta fase

#### ALCANCE

**Inclòs**

- Endpoint `PUT /api/admin/events/:id`
- Pàgina `/admin/events/[id]` amb formulari pre-emplenat

**Fora d'abast**

- Edició de seients individuals
- Historial de canvis / audit log

#### DEPENDÈNCIES

- **US-02-02**: l'Event ha d'existir prèviament

#### ÍNDEX DE RETRABAJO

**Baix.** Edició estàndard. Si s'afegeix upload d'imatge en el futur, és una extensió del formulari, no un refactor.

#### CRITERIS D'ACCEPTACIÓ

**Criteri 1 — Edició correcta**

- DONAT que existeix un Event i la pàgina d'edició ha carregat amb les dades actuals
- QUAN es modifica la descripció i es guarda
- ALESHORES `PUT /api/admin/events/:id` retorna `200` i la nova descripció es mostra al formulari

**Criteri 2 — Bloqueig amb reserves actives**

- DONAT que l'Event té seients amb reserves actives
- QUAN s'intenta canviar les categories de preu
- ALESHORES el backend retorna `422` i l'admin veu el missatge: "No és possible modificar les categories mentre hi ha reserves actives"

---

### US-02-04 — Eliminar un esdeveniment

#### CONTEXT

Cal poder esborrar esdeveniments creats per error o que mai s'activaran. La protecció davant de l'eliminació d'esdeveniments amb vendes actives és crítica per a la integritat de les dades.

#### USER STORY

**Com a** administradora de Sala Onirica,  
**vull** poder eliminar un esdeveniment en esborrany,  
**per tal de** mantenir el catàleg net i evitar confusions en la programació.

#### ESPECIFICACIONS

**Requisits funcionals**

- `DELETE /api/admin/events/:id` retorna `204` si l'eliminació és possible
- Si l'Event té `OrderItems` associats: retorna `409` (no es pot eliminar)
- Si l'Event té reserves actives però no comandes: retorna `422` amb avís, i l'admin pot confirmar si vol procedir (elimina reservations en cascada)
- Diàleg de confirmació obligatori al frontend abans d'enviar la petició

**Requisits no funcionals**

- L'eliminació ha de ser en cascada: Event → Seats → Reservations (però no OrderItems; aquí bloqueja)

#### ALCANCE

**Inclòs**

- Endpoint `DELETE /api/admin/events/:id` amb protecció per OrderItems
- Diàleg de confirmació al frontend
- Eliminació en cascada de Seats i Reservations

**Fora d'abast**

- Soft-delete / arxivat d'esdeveniments (N/A en aquesta fase)

#### DEPENDÈNCIES

- **US-02-01**: accés al llistat d'on es dispara l'acció

#### ÍNDEX DE RETRABAJO

**Baix.** Si en el futur s'implementa soft-delete, l'endpoint REST canvia però la UI no.

#### CRITERIS D'ACCEPTACIÓ

**Criteri 1 — Eliminació exitosa**

- DONAT que existeix un Event sense comandes ni seients venuts, i l'administradora confirma el diàleg
- QUAN s'executa `DELETE /api/admin/events/:id`
- ALESHORES la resposta és `204` i l'Event no apareix al llistat

**Criteri 2 — Bloqueig per comandes existents**

- DONAT que l'Event té almenys un `OrderItem`
- QUAN s'executa `DELETE /api/admin/events/:id`
- ALESHORES la resposta és `409` i l'Event persisteix a la BD

---

### US-02-05 — Publicar / despublicar un esdeveniment

#### CONTEXT

El cicle de vida d'una projecció a Sala Onirica passa per un període intern (esborrany) fins a la data d'anunci oficial al públic. L'administradora necessita control explícit sobre quan l'esdeveniment és visible a la cartellera pública.

#### USER STORY

**Com a** administradora de Sala Onirica,  
**vull** controlar quan un esdeveniment és visible al públic general,  
**per tal de** preparar la projecció internament abans de posar-la en venda.

#### ESPECIFICACIONS

**Requisits funcionals**

- Toggle de publicació accessible des de la llista i des del formulari d'edició
- Esdeveniments amb `publicat: false` no apareixen a `GET /api/events` (portada pública)
- El canvi s'aplica reutilitzant `PUT /api/admin/events/:id` amb `{ publicat: true/false }`
- Feedback visual immediat (l'etiqueta de l'estat canvia sense recarregar la pàgina)

**Requisits no funcionals**

- N/A — operació de toggle sense complexitat addicional

#### ALCANCE

**Inclòs**

- Toggle de publicació UI + crida al backend

**Fora d'abast**

- Publicació programada per data/hora (N/A)

#### DEPENDÈNCIES

- **US-02-02**: l'Event ha d'existir

#### ÍNDEX DE RETRABAJO

**Baix.** Reutilitza `PUT /api/admin/events/:id`. Cap impacte addicional.

#### CRITERIS D'ACCEPTACIÓ

**Criteri 1 — Despublicar oculta l'event al públic**

- DONAT que un Event té `publicat: true`
- QUAN l'administradora activa el toggle a `false` i el canvi es guarda
- ALESHORES `GET /api/events` ja no inclou aquell Event a la resposta

---

## EP-03 — Mapa de seients en temps real

> Els fans de Sala Onirica veuen l'estat de tots els seients en directe i poden seleccionar els seus.

---

### US-03-01 — Visualització del mapa de seients

#### CONTEXT

El mapa de seients és el component central de l'experiència d'usuari. Per a les sessions especials de Sala Onirica (Dune 4K, 2001 Odissea...), els usuaris necessiten veure exactament quins seients estan disponibles. La claredat visual de l'estat de cada seient és crítica per a la presa de decisió.

#### USER STORY

**Com a** usuari de Sala Onirica que vol assistir a una projecció especial,  
**vull** veure un mapa de seients complet amb l'estat visual de cada seient en carregar la pàgina,  
**per tal de** poder escollir la millor ubicació disponible de manera informada.

#### ESPECIFICACIONS

**Requisits funcionals**

- Dades inicials dels seients carregades via `GET /api/events/:slug/seats`
- L'estat inicial s'emmagatzema a la store Pinia `seients`
- El component `MapaSeients.vue` renderitza les files i seients en grid
- El component `Seient.vue` representa cada seient individual amb el color corresponent a l'estat:
  - `DISPONIBLE`: verd (`#16A34A`)
  - `RESERVAT` (per un altre): groc/taronja (`#D97706`)
  - `SELECCIONAT PER MI`: blau/violeta (`#7C3AED`)
  - `VENUT`: gris fosc (`#374151`)
- El component `LlegendaEstats.vue` és sempre visible
- El component `NotificacioEstat.vue` mostra missatges no bloquejants
- La informació de l'esdeveniment (nom, data, hora, recinte, preus) es mostra sobre el mapa

**Requisits no funcionals**

- El mapa ha de ser responsiu: funcionar en mòbil (scroll horitzontal si hi ha moltes files) i escriptori
- No s'utilitzen CDN externs per a cap recurs visual

#### ALCANCE

**Inclòs**

- Component `MapaSeients.vue`, `Seient.vue`, `LlegendaEstats.vue`
- Pàgina `/events/[slug]` amb renderització client-side
- Store Pinia `seients.ts` amb `inicialitzar()`

**Fora d'abast**

- Actualitzacions en temps real (US-03-02)
- Interacció de reserva (US-04-01)

#### DEPENDÈNCIES

- **US-01-03, US-01-04**: BD amb dades
- **US-02-02, US-02-05**: un Event publicat amb seients ha d'existir

#### ÍNDEX DE RETRABAJO

**Baix.** El component `Seient.vue` és estable; si es volen afegir animacions (US-09-03), s'afegeix CSS, no es refactoritza la lògica.

#### CRITERIS D'ACCEPTACIÓ

**Criteri 1 — Mapa carregat correctament**

- DONAT que existeix l'Event `dune-4k-dolby-2026` amb 200 seients
- QUAN l'usuari accedeix a `/events/dune-4k-dolby-2026`
- ALESHORES el mapa mostra 200 seients distribuïts en 10 files, tots de color verd (disponibles)

**Criteri 2 — Llegenda visible**

- DONAT que la pàgina ha carregat
- QUAN l'usuari inspecciona la UI
- ALESHORES el component `LlegendaEstats` és visible amb els 4 estats i els seus colors

---

### US-03-02 — Sincronització d'estat en temps real

#### CONTEXT

El requisit central del projecte és que múltiples usuaris vegin els mateixos seients en el mateix estat simultàniament. Si l'usuari A reserva el seient B5, l'usuari B ha de veure'l com a reservat en menys de 200ms, sense recarregar la pàgina. Sense aquesta sincronització, el sistema no compleix el seu objectiu fonamental.

#### USER STORY

**Com a** usuari de Sala Onirica connectat a la pàgina d'una projecció,  
**vull** que l'estat dels seients s'actualitzi automàticament quan canvia per qualsevol causa,  
**per tal de** tenir sempre una visió fidel de la disponibilitat real i evitar conflictes de reserva innecessaris.

#### ESPECIFICACIONS

**Requisits funcionals**

- En carregar la pàgina `/events/[slug]`, el plugin `socket.client.ts` connecta al Socket.IO amb el JWT de la store `auth` i emet `event:unir` amb `{ eventId }` (el `userId` s'extreu del token al servidor)
- El servidor (`JwtGuard`) valida el JWT al handshake; connexions sense token vàlid reben `disconnect 401`
- El servidor afegeix el socket a la room `event:{eventId}`
- L'event `seient:canvi-estat` rebut executa `seients.actualitzarEstat(seatId, estat)` a la store Pinia
- El canvi es reflecteix immediatament al component `Seient.vue` per reactivitat de Vue
- En sortir de la pàgina (`onUnmounted`), el socket abandona la room
- La store `connexio.ts` reflecteix `connectat: true/false` i `reconnectant: boolean`

**Requisits no funcionals**

- Latència objectiu: < 200ms entre emissió del broadcast al servidor i actualització visual al client
- El JWT s'envia al connectar: `io(url, { auth: { token } })`; el servidor no consulta la BD per validar-lo (secret compartit)

#### ALCANCE

**Inclòs**

- Plugin `socket.client.ts`
- Store Pinia `connexio.ts` i acció `actualitzarEstat` a `seients.ts`
- Connexió i desconnexió de rooms

**Fora d'abast**

- Reconnexió automàtica amb recuperació d'estat (US-09-04)
- Emissió de reserves (US-04-01)

#### DEPENDÈNCIES

- **US-03-01**: el mapa ha d'existir per reflectir els canvis visualment
- El backend ha d'implementar el Gateway Socket.IO i emetre `seient:canvi-estat` (implementació paral·lela)

#### ÍNDEX DE RETRABAJO

**Baix.** El plugin de Socket.IO és estable. Les stores Pinia creixeran amb noves accions però no es refactoritzen.

#### CRITERIS D'ACCEPTACIÓ

**Criteri 1 — Actualització en temps real entre dos clients**

- DONAT que dos navegadors estan oberts a `/events/dune-4k-dolby-2026`
- QUAN des del navegador A es reserva el seient B5 (via Socket.IO)
- ALESHORES en menys de 200ms el navegador B mostra el seient B5 de color taronja (RESERVAT)

**Criteri 2 — Indicador de connexió reactiu**

- DONAT que l'usuari és a la pàgina de l'event
- QUAN la connexió Socket.IO es perd
- ALESHORES la store `connexio.connectat` passa a `false` i la UI reflecteix l'estat de desconnexió visualment

---

### US-03-03 — Indicador de connexió Socket.IO

#### CONTEXT

Un usuari de Sala Onirica en plena compra de nit no sap si el canvi de xarxa (wifi → mòbil) ha interromput la sincronització. Sense un indicador clar, podria creure que el mapa és actual quan en realitat no ho és, i fer decisions basades en dades obsoletes.

#### USER STORY

**Com a** usuari de Sala Onirica a la pàgina d'una projecció,  
**vull** saber en tot moment si estic connectat al servidor en temps real,  
**per tal de** confiar que els estats dels seients que veig són acurats i actuals.

#### ESPECIFICACIONS

**Requisits funcionals**

- Indicador visual permanent (punt o icona) a la UI: verd si `connectat`, vermell si `desconnectat`
- En desconnexió: banner o badge "Reconnectant..." visible
- En reconnexió exitosa: indicador torna a verd (sense recarregar la pàgina)
- L'estat de connexió prové de la store `connexio.ts` (reactivitat automàtica)

**Requisits no funcionals**

- N/A — component purament presentacional

#### ALCANCE

**Inclòs**

- Component d'indicador de connexió (pot ser part de la capçalera de la pàgina d'event)

**Fora d'abast**

- Lògica de reconnexió amb recuperació d'estat (US-09-04)

#### DEPENDÈNCIES

- **US-03-02**: la store `connexio.ts` ha d'existir i actualitzar-se

#### ÍNDEX DE RETRABAJO

**Nul.** Component presentacional pur, sense lògica de negoci.

#### CRITERIS D'ACCEPTACIÓ

**Criteri 1 — Indicador reactiu**

- DONAT que l'usuari és a la pàgina de l'event amb connexió activa
- QUAN el cable de xarxa es desconnecta (o es simula `socket.disconnect()`)
- ALESHORES l'indicador canvia a vermell i apareix el text "Reconnectant..." en menys de 1 segon

---

## EP-04 — Flux de reserva i compra

> El flux crític: un fan de Sala Onirica vol assegurar-se un seient per a la projecció especial.

---

### US-04-01 — Reserva temporal d'un seient

#### CONTEXT

La reserva temporal és el mecanisme central del sistema i on rau tota la complexitat de concurrència. Quan les entrades de Sala Onirica surten a la venda, desenes d'usuaris cliquen simultàniament. Cal garantir que el servidor és l'única autoritat i que el `SELECT FOR UPDATE` impedeix que dues reserves coincideixin al mateix seient.

#### USER STORY

**Com a** usuari de Sala Onirica a la pàgina d'una projecció,  
**vull** poder clicar un seient disponible per reservar-lo temporalment al meu nom,  
**per tal de** tenir un marge de temps garantit per completar la compra sense que ningú me'l prengui.

#### ESPECIFICACIONS

**Requisits funcionals**

- En clicar un seient `DISPONIBLE`, el frontend emet `seient:reservar { seatId }` via Socket.IO (el `userId` s'extreu del JWT validat al `JwtGuard`)
- El Node Service delega a Laravel via `LaravelClientService.reserveSeat(seatId, userId)` (POST `/internal/seats/reserve`)
- Laravel executa la reserva dins d'una transacció Eloquent amb `SELECT ... FOR UPDATE`
- Si `estat != DISPONIBLE`: retorna error, el Node Service emet `reserva:rebutjada { seatId, motiu }` al client
- Si ok: `UPDATE seat SET estat=RESERVAT`, `INSERT reservation { seatId, user_id, expires_at: NOW() + TTL }`, `COMMIT`; Laravel retorna `{ ok: true, expira_en }`
- El client que reserva rep `reserva:confirmada { seatId, expira_en }`
- Broadcast a tota la room: `seient:canvi-estat { seatId, estat: RESERVAT }`
- La store `seients.ts` marca el seient com `SELECCIONAT PER MI` (estat local del client propietari)

**Regla de negoci clau**

- El `SELECT FOR UPDATE` serialitza les escriptures. Dos sockets simultanis mai poden reservar el mateix seient: el segon trobarà `estat != DISPONIBLE` un cop adquireixi el lock.

**Requisits no funcionals**

- Seguretat: el servidor mai confia en l'estat del seient reportat pel client; sempre consulta la BD
- El `userId` s'extreu del JWT al `JwtGuard`; connexions sense JWT vàlid reben `disconnect 401` (US-00-06)

#### ALCANCE

**Inclòs**

- `SeatsGateway` handler `seient:reservar` al Node Service (NestJS)
- `LaravelClientService.reserveSeat()` al Node Service
- `SeatReservationController` a Laravel amb transacció Eloquent `SELECT FOR UPDATE`
- Actualització de les stores Pinia `seients` i `reserva`

**Fora d'abast**

- Temporitzador visual al client (US-04-03)
- Límit de seients per usuari (US-04-02, validació separada)

#### DEPENDÈNCIES

- **US-03-01, US-03-02**: mapa i connexió WS han d'estar operatius

#### ÍNDEX DE RETRABAJO

**Baix.** La lògica de `SELECT FOR UPDATE` és estable i no canvia si s'afegeix autenticació; simplement s'afegirà la validació del JWT al gateway sense tocar la transacció.

#### CRITERIS D'ACCEPTACIÓ

**Criteri 1 — Reserva exitosa**

- DONAT que el seient B5 té `estat: DISPONIBLE` i l'usuari té un JWT vàlid
- QUAN l'usuari emet `seient:reservar { seatId: B5 }`
- ALESHORES el client rep `reserva:confirmada`, la BD mostra `estat: RESERVAT`, `reservation.user_id` conté l'ID de l'usuari i `reservation.expires_at` és en `RESERVATION_TTL_MINUTES` minuts

**Criteri 2 — Conflicte simultani (el nucli del sistema)**

- DONAT que dos clients autenticats emeten `seient:reservar { seatId: B5 }` simultàniament
- QUAN el servidor processa ambdues peticions
- ALESHORES exactament un client rep `reserva:confirmada` i l'altre rep `reserva:rebutjada`; la BD conté exactament una reserva per B5

---

### US-04-02 — Límit de seients per usuari

#### CONTEXT

Per evitar l'acaparament d'entrades (un comportament detectat a molts sistemes de venda d'entrades de concerts), l'administrador de Sala Onirica configura un màxim de N seients per usuari autenticat per a cada projecció.

#### USER STORY

**Com a** administradora de Sala Onirica,  
**vull** que cada usuari pugui reservar un màxim de N seients per sessió,  
**per tal de** garantir accés equitatiu a les entrades de les projeccions d'alta demanda.

#### ESPECIFICACIONS

**Requisits funcionals**

- `max_seients_per_usuari` és un camp de l'Event configurat en creació
- Laravel comprova el nombre de reserves actives del `user_id` per a aquell Event abans d'executar la transacció
- Si el límit és assolit: Laravel retorna error → el Node Service emet `reserva:rebutjada { motiu: "Has assolit el màxim de N entrades per a aquesta sessió" }`
- El frontend desactiva visualment els seients disponibles quan s'ha assolit el límit (via getter de la store `reserva`)

**Requisits no funcionals**

- La comprovació del límit es fa al servidor, no al client (el client és indicatiu)

#### ALCANCE

**Inclòs**

- Validació al `SeatsService.reservar()` prèvia a la transacció
- Getter `limitAssolit` a la store `reserva.ts`
- Estil visual de seients bloquejats per límit al component `Seient.vue`

**Fora d'abast**

- Límits per IP o per email (N/A en aquesta fase)

#### DEPENDÈNCIES

- **US-04-01**: el mecanisme de reserva ha d'estar implementat

#### ÍNDEX DE RETRABAJO

**Baix.** La validació s'afegeix al service existent. El `user_id` extret del JWT identifica l'usuari sense cap canvi addicional a la lògica de negoci.

#### CRITERIS D'ACCEPTACIÓ

**Criteri 1 — Bloqueig en assolir el límit**

- DONAT que l'Event té `max_seients_per_usuari: 4` i l'usuari autenticat ja té 4 reserves actives
- QUAN l'usuari emet `seient:reservar` per a un cinquè seient
- ALESHORES el servidor retorna `reserva:rebutjada` amb el motiu de límit assolit, sense modificar la BD

---

### US-04-03 — Temporitzador visible de reserva

#### CONTEXT

Un usuari de Sala Onirica que reserva seients per a la projecció de _Dune_ necessita saber quant temps li queda per completar la compra. Sense temporitzador, podria perdre la reserva per sorpresa i recomençar des de zero.

#### USER STORY

**Com a** usuari de Sala Onirica amb seients reservats,  
**vull** veure un compte enrere clar que m'indiqui el temps restant per completar la compra,  
**per tal de** gestionar el meu temps i saber si he d'actuar ràpid.

#### ESPECIFICACIONS

**Requisits funcionals**

- El composable `useTemporitzador.ts` pren el `expira_en` de la store `reserva` i calcula els segons restants cada segon
- El component `TemporitzadorReserva.vue` mostra el compte enrere en format `mm:ss`
- Quan queden ≤ 60 segons: el component canvia a estil d'urgència (color vermell)
- Quan arriba a `00:00`: el composable emet un event intern, la store `reserva.netejarReserves()` s'invoca i es mostra el missatge "La reserva ha expirat"
- El temporitzador es basa en `expira_en` del servidor (no en temps local del dispositiu)

**Requisits no funcionals**

- El composable ha de ser testejable de manera aïllada (US-07-02)

#### ALCANCE

**Inclòs**

- Composable `useTemporitzador.ts`
- Component `TemporitzadorReserva.vue`
- Integració a la pàgina `/events/[slug]` i `/checkout`

**Fora d'abast**

- Recuperació del timer en reconnexió (US-09-04)

#### DEPENDÈNCIES

- **US-04-01**: el `expira_en` prové de la resposta de reserva

#### ÍNDEX DE RETRABAJO

**Baix.** El composable és pur (sense side-effects externs). La recuperació en reconnexió (US-09-04) l'estén, no el modifica.

#### CRITERIS D'ACCEPTACIÓ

**Criteri 1 — Compte enrere precís**

- DONAT que la reserva té `expira_en: T+300s`
- QUAN passen 10 segons
- ALESHORES el temporitzador mostra `04:50`

**Criteri 2 — Estil d'urgència**

- DONAT que el temporitzador s'executa
- QUAN els segons restants arriben a 60
- ALESHORES el component canvia visualment al mode d'urgència (color vermell o similar)

**Criteri 3 — Expiració al client**

- DONAT que el temporitzador arriba a `00:00`
- QUAN passa el temps
- ALESHORES la store `reserva` es neteja i es mostra el missatge d'expiració

---

### US-04-04 — Alliberament voluntari d'una reserva

#### CONTEXT

Un usuari pot canviar d'opinió i voler un seient diferent. Sense la possibilitat d'alliberar voluntàriament, hauria d'esperar l'expiració del timer (5 minuts) per poder seleccionar alternatives, bloquejant innecessàriament seients per a altres usuaris.

#### USER STORY

**Com a** usuari de Sala Onirica amb seients reservats,  
**vull** poder desseleccionar un seient prement-lo de nou,  
**per tal de** canviar la meva selecció lliurement abans de confirmar la compra.

#### ESPECIFICACIONS

**Requisits funcionals**

- En clicar un seient `SELECCIONAT PER MI`, el frontend emet `seient:alliberar { seatId }` (el `userId` s'extreu del JWT al `JwtGuard`)
- El Node Service crida `LaravelClientService.releaseSeat(seatId)` → DELETE `/internal/seats/{id}/reserve`
- Laravel valida que `reservation.user_id === userId` extret del JWT; si no coincideix: retorna `403`
- Si ok: `UPDATE seat SET estat=DISPONIBLE`, `DELETE reservation`, el Node Service emet broadcast `seient:canvi-estat { DISPONIBLE }` a la room
- La store `reserva.ts` elimina el seient alliberat

**Requisits no funcionals**

- Seguretat: el servidor sempre valida propietat de la reserva; el client no pot alliberar reserves d'altri

#### ALCANCE

**Inclòs**

- Handler `seient:alliberar` al Gateway
- `ReservationsService.eliminar()` amb validació de propietat

**Fora d'abast**

- Cancel·lació de comandes ja confirmades (fora d'abast del projecte)

#### DEPENDÈNCIES

- **US-04-01**: la reserva ha d'existir

#### ÍNDEX DE RETRABAJO

**Baix.** Reutilitza la infraestructura de `seient:reservar`. No genera retraballo.

#### CRITERIS D'ACCEPTACIÓ

**Criteri 1 — Alliberament correcte**

- DONAT que l'usuari A té reservat el seient C3 i emet `seient:alliberar { seatId: C3 }` amb el seu JWT
- ALESHORES la BD mostra `C3.estat: DISPONIBLE`, la reserva s'elimina i tots els clients veuen el seient verd

**Criteri 2 — Protecció de propietat**

- DONAT que l'usuari B intenta alliberar el seient C3 que pertany a l'usuari A
- QUAN emet `seient:alliberar { seatId: C3 }` amb el JWT de l'usuari B
- ALESHORES Laravel retorna `403` i la reserva de C3 no es modifica

---

### US-04-05 — Expiració automàtica de reserves al servidor

#### CONTEXT

Si un usuari tanca el navegador o perd la connexió amb seients reservats, sense un mecanisme de neteja al servidor aquells seients quedarien bloquejats indefinidament. Per a les projeccions de Sala Onirica amb aforament limitat, cada seient comptat és crític.

#### USER STORY

**Com a** sistema de gestió de Sala Onirica,  
**vull** alliberar automàticament les reserves que hagin superat el temps màxim,  
**per tal de** que cap seient quedi bloquejat per usuaris que han abandonat el procés de compra.

#### ESPECIFICACIONS

**Requisits funcionals**

- `ReservationsScheduler` (NestJS `@Cron`) s'executa cada 30 segons
- Crida `LaravelClientService.expireReservations()` → POST `/internal/seats/expire`
- Laravel cerca reserves amb `expires_at < NOW()`, i per cada una (en transacció): `UPDATE seats SET estat=DISPONIBLE`, `DELETE reservation`; retorna la llista de `seatId` i `eventId` alliberats
- El Node Service emet `seient:canvi-estat { seatId, estat: DISPONIBLE }` via el Gateway a la room `event:{eventId}` per cada seient alliberat
- El cron funciona encara que el servidor s'hagi reiniciat (no `setTimeout`)

**Requisits no funcionals**

- El cron no ha de crear condicions de race amb reserves actives. La comprovació `expires_at < NOW()` amb un index és suficient.

#### ALCANCE

**Inclòs**

- `ReservationsScheduler` amb `@nestjs/schedule`
- Emissió de broadcasts des del scheduler via injecció del Gateway

**Fora d'abast**

- Notificació push o email a l'usuari quan expira (N/A)

#### DEPENDÈNCIES

- **US-04-01, US-04-03**: les reserves i el timer han d'existir

#### ÍNDEX DE RETRABAJO

**Baix.** El scheduler és independent. Si el TTL canvia, és una variable d'entorn.

#### CRITERIS D'ACCEPTACIÓ

**Criteri 1 — Alliberament automàtic**

- DONAT que existeix una reserva amb `expires_at` en el passat
- QUAN el cron s'executa (o esperant fins a 30s)
- ALESHORES la BD mostra el seient amb `estat: DISPONIBLE`, la reserva s'ha eliminat i tots els clients connectats veuen el seient verd

---

### US-04-06 — Formulari de compra (checkout)

#### CONTEXT

Quan un usuari de Sala Onirica ha seleccionat els seus seients, necessita un formulari senzill per completar la compra. En aquesta fase, no hi ha pagament real, però cal capturar nom i email per poder consultar les entrades posteriorment.

#### USER STORY

**Com a** usuari de Sala Onirica amb seients reservats,  
**vull** un formulari clar per introduir el meu nom i email i confirmar la compra,  
**per tal de** formalitzar l'adquisició de les meves entrades de manera senzilla.

#### ESPECIFICACIONS

**Requisits funcionals**

- La pàgina `/checkout` mostra:
  - Resum dels seients reservats (fila + número + categoria + preu)
  - Preu total
  - El temporitzador de reserva (actiu)
  - Formulari: nom complet (requerit), email (requerit, format válid)
- Si no hi ha reserves actives a `reserva.seients` en carregar `/checkout`: redirigir a `/`
- Botó "Confirmar compra" crida `POST /api/orders` (US-04-07)

**Validacions**

- Nom: no buit, max 100 caràcters
- Email: format RFC valid
- Errors inline per camp

**Requisits no funcionals**

- N/A — formulari client-side estàndard

#### ALCANCE

**Inclòs**

- Pàgina `/checkout`
- Validació de formulari client-side

**Fora d'abast**

- Pagament real (N/A)
- Dades de facturació (N/A)

#### DEPENDÈNCIES

- **US-04-01, US-04-03**: hi ha d'haver reserves actives i timer visible

#### ÍNDEX DE RETRABAJO

**Baix.** Si s'afegeix pagament, el formulari s'amplia però no es refactoritza.

#### CRITERIS D'ACCEPTACIÓ

**Criteri 1 — Redirecció sense reserves**

- DONAT que l'usuari no té reserves actives
- QUAN accedeix directament a `/checkout`
- ALESHORES és redirigit a `/`

**Criteri 2 — Validació d'email**

- DONAT que el formulari té el camp email amb el valor `"no-es-un-email"`
- QUAN l'usuari prem "Confirmar compra"
- ALESHORES es mostra un error inline "Introdueix un email vàlid" i no s'envia cap petició al servidor

---

### US-04-07 — Confirmació de compra

#### CONTEXT

La confirmació és el moment en què els seients passen de `RESERVAT` a `VENUT` permanentment. El servidor ha de validar que la reserva segueix vigent i que pertany al `user_id` del token JWT del comprador, i tot ha de passar en una sola transacció per evitar inconsistències.

#### USER STORY

**Com a** usuari de Sala Onirica que ha omplert el formulari de checkout,  
**vull** confirmar la compra i rebre una confirmació clara,  
**per tal de** saber que les meves entrades estan assegurades i no podran ser eliminades.

#### ESPECIFICACIONS

**Requisits funcionals**

- `POST /api/orders { client_nom, client_email }` (requereix JWT — `Authorization: Bearer <token>`):
  1. Extreu `user_id` del JWT
  2. Cerca totes les `reservations` del `user_id` que no hagin expirat
  3. Valida que els `seats` associats tenen `estat: RESERVAT`
  4. En transacció Eloquent: `UPDATE seats SET estat=VENUT`, `INSERT order`, `INSERT order_items`, `DELETE reservations`
  5. Retorna `201 { order_id, seients[], total }`
  6. El Node Service emet broadcast `seient:canvi-estat { estat: VENUT }` per cada seient a la room
- Si qualsevol seient ha expirat durant el checkout: `409 Conflict { message, seients_expirats[] }`
- Pàgina de confirmació amb: resum de seients, event, total

**Requisits no funcionals**

- Tot el procés de validació + escriptura és una sola transacció Eloquent (Laravel)

#### ALCANCE

**Inclòs**

- Endpoint `POST /api/orders`
- `OrdersService.confirmar()` transaccional
- Pàgina de confirmació amb resum

**Fora d'abast**

- Enviament d'email de confirmació (N/A)
- PDF d'entrada (N/A)

#### DEPENDÈNCIES

- **US-04-06**: el formulari ha d'existir i enviar les dades

#### ÍNDEX DE RETRABAJO

**Mig.** Si s'afegeix pagament real, el `OrdersService` s'ha d'estendre amb la lògica de pago before commit. El patró transaccional existent facilita l'extensió.

#### CRITERIS D'ACCEPTACIÓ

**Criteri 1 — Compra exitosa**

- DONAT que l'usuari autenticat té 2 reserves actives (B5, B6), no expirades
- QUAN `POST /api/orders` amb JWT vàlid i dades vàlides
- ALESHORES la resposta és `201`, B5 i B6 passen a `estat: VENUT`, s'ha creat una `Order` amb 2 `OrderItems` i els altres clients veuen els seients en gris (venuts)

**Criteri 2 — Reserva expirada durant checkout**

- DONAT que l'usuari autenticat tenia reservat B5, però el cron l'ha alliberat durant el procés
- QUAN s'envia `POST /api/orders`
- ALESHORES la resposta és `409` amb `{ seients_expirats: ["B5"] }` i no es crea cap `Order`

---

### US-04-08 — Gestió de conflicte de reserva concurrent

#### CONTEXT

Quan un usuari intenta reservar un seient que acaba de ser agafat per un altre, l'experiència del conflicte és tan important com el mecanisme tècnic. A Sala Onirica, on la competència per seients és alta, un missatge confús o absent pot fer que l'usuari abandoni la compra.

#### USER STORY

**Com a** usuari de Sala Onirica que ha intentat reservar un seient ja ocupat,  
**vull** rebre un missatge clar i immediat sobre el conflicte,  
**per tal de** poder escollir un altre seient ràpidament sense confusió ni necessitat de recarregar la pàgina.

#### ESPECIFICACIONS

**Requisits funcionals**

- En rebre `reserva:rebutjada { seatId, motiu }`, el component `NotificacioEstat.vue` mostra un toast no bloquejant
- El missatge és específic: `"El seient [fila][numero] acaba de ser reservat. Escull un altre seient."`
- El seient en qüestió es mostra immediatament com a `RESERVAT` a la UI (l'event `seient:canvi-estat` ja l'actualitzarà, però si arriba primer `reserva:rebutjada`, la store ha d'actualitzar-lo localment)
- L'usuari pot clicar un altre seient immediatament, sense cap acció addicional

**Requisits no funcionals**

- El toast desapareix al cap de 4 segons o en clicar-lo

#### ALCANCE

**Inclòs**

- Handler `reserva:rebutjada` al plugin de Socket.IO
- Toast de notificació via `NotificacioEstat.vue`

**Fora d'abast**

- Reintent automàtic de reserva (N/A)

#### DEPENDÈNCIES

- **US-04-01**: el mecanisme de rebuig existeix al backend
- **US-03-02**: la sincronització en temps real actualitza el seient

#### ÍNDEX DE RETRABAJO

**Baix.** Component purament reactiu. No genera deute tècnic.

#### CRITERIS D'ACCEPTACIÓ

**Criteri 1 — Notificació de conflicte**

- DONAT que el seient D4 acaba de ser reservat per un altre usuari mentre l'usuari actual el clicava
- QUAN el servidor retorna `reserva:rebutjada { seatId: D4 }`
- ALESHORES apareix un toast amb el text específic del conflicte i el seient D4 es mostra taronja (RESERVAT) sense recarregar la pàgina

---

## EP-05 — Consulta d'entrades

---

### US-05-01 — Consulta d'entrades de l'usuari autenticat

#### CONTEXT

Un cop comprades les entrades, l'usuari autenticat necessita poder consultar-les des de la pàgina `/entrades`. Com el sistema té autenticació JWT, les comandes s'associen al `user_id` i l'endpoint retorna només les del token actiu, sense necessitat d'introduir cap email.

#### USER STORY

**Com a** comprador de Sala Onirica autenticat que ha realitzat una compra prèviament,  
**vull** poder veure les meves entrades a la pàgina `/entrades`,  
**per tal de** accedir als detalls de les meves compres en qualsevol moment i des de qualsevol dispositiu.

#### ESPECIFICACIONS

**Requisits funcionals**

- `GET /api/orders` (requereix JWT) retorna totes les `Order` de l'usuari autenticat
- Camps per `Order`: nom de la projecció, data, hora, recinte, llista de seients (`[fila][numero]`), preu total, data de compra
- Si no hi ha entrades: resposta `[]` (no `404`) i el frontend mostra "No tens cap entrada comprada"
- La pàgina `/entrades` és protegida pel middleware `auth.ts` (requereix JWT vàlid)

**Requisits no funcionals**

- Seguretat: l'endpoint usa el `user_id` del JWT per filtrar les comandes; cap usuari pot veure les comandes d'un altre
- Limitació: si l'usuari té més de 50 comandes (improbable en context acadèmic), retornar les 50 més recents

#### ALCANCE

**Inclòs**

- Endpoint `GET /api/orders` (protegit per JWT)
- Pàgina `/entrades` amb llistat de les comandes de l'usuari

**Fora d'abast**

- Descàrrega de PDF (N/A)
- Enviament per email (N/A)
- Cancel·lació d'entrades (N/A)

#### DEPENDÈNCIES

- **US-04-07**: les `Order` s'han de crear prèviament

#### ÍNDEX DE RETRABAJO

**Baix.** Cerca read-only simple. Estable.

#### CRITERIS D'ACCEPTACIÓ

**Criteri 1 — Consulta amb resultats**

- DONAT que l'usuari autenticat ha comprat entrades per a _Dune 4K_
- QUAN accedeix a la pàgina `/entrades` amb JWT vàlid
- ALESHORES la resposta conté les seves comandes amb els seients comprats i el total correcte

**Criteri 2 — Usuàri sense compres**

- DONAT que l'usuari autenticat no té cap compra
- QUAN accedeix a la pàgina `/entrades`
- ALESHORES es mostra el missatge "No tens cap entrada comprada" (no una pàgina d'error)

---

## EP-06 — Panell d'administració i informes

---

### US-06-01 — Dashboard en temps real

#### CONTEXT

L'administradora de Sala Onirica necessita supervisar en directe com es venen les entrades per a una projecció especial. Quan les entrades d'una estrena surten a la venda, els comptadors canvien cada pocs segons i la visió en temps real és essencial per prendre decisions.

#### USER STORY

**Com a** administradora de Sala Onirica,  
**vull** veure en temps real el nombre de seients disponibles, reservats i venuts, així com els usuaris connectats,  
**per tal de** monitorar l'evolució de la venda sense haver de recarregar la pàgina.

#### ESPECIFICACIONS

**Requisits funcionals**

- La pàgina `/admin` mostra comptadors en temps real per a l'Event actiu:
  - Seients disponibles / reservats / venuts (xifres + percentatge)
  - Usuaris connectats a la room en aquell moment
  - Reserves actives
  - Recaptació total fins ara
- Les dades s'actualitzen en rebre l'event Socket.IO `stats:actualitzacio`
- El backend emet `stats:actualitzacio` a la room `event:{id}` cada vegada que un seient canvia d'estat (després de `seient:reservar`, `seient:alliberar`, confirmació de compra i cron)
- `GET /api/admin/events/:id/stats` proporciona l'estat inicial en carregar la pàgina

**Requisits no funcionals**

- L'admin s'uneix a la room `event:{id}` via Socket.IO igual que un usuari normal

#### ALCANCE

**Inclòs**

- Emissió de `stats:actualitzacio` al backend en cada canvi d'estat
- Pàgina `/admin` amb comptadors reactius via Pinia

**Fora d'abast**

- Gràfics (US-09-01, US-09-02)
- Selecció d'Event actiu (en aquesta fase, es mostra l'últim event creat)

#### DEPENDÈNCIES

- **US-03-02**: la connexió Socket.IO i les rooms han d'estar operatives
- **US-04-07**: les comandes generen canvis d'estat de vendes

#### ÍNDEX DE RETRABAJO

**Baix.** El `stats:actualitzacio` s'afegeix als handlers existents sense canviar la lògica principal.

#### CRITERIS D'ACCEPTACIÓ

**Criteri 1 — Actualització automàtica**

- DONAT que l'admin és a `/admin` i un usuari compra 2 entrades en un altre navegador
- QUAN la compra es confirma
- ALESHORES els comptadors del dashboard mostren +2 venuts, -2 disponibles i la recaptació incrementada, sense que l'administradora recarregui la pàgina

---

### US-06-02 — Informe de vendes per categoria

#### CONTEXT

Conèixer quines categories de preu han funcionat millor (VIP vs General) permet a l'administradora planificar millor la distribució de seients en futures projeccions de Sala Onirica.

#### USER STORY

**Com a** administradora de Sala Onirica,  
**vull** veure la recaptació i ocupació desglossades per categoria de preu,  
**per tal de** analitzar el rendiment de cada zona i prendre decisions per a futures programacions.

#### ESPECIFICACIONS

**Requisits funcionals**

- `GET /api/admin/reports` retorna per cada categoria: nom, total seients, seients venuts, % ocupació, recaptació total
- La pàgina `/admin` mostra una taula d'informes
- Fórmula: `% ocupació = (seients_venuts / total_seients) * 100`
- Fórmula: `recaptació = seients_venuts * preu_categoria`
- No cal actualització en temps real en aquesta US (és una consulta estàtica)

**Requisits no funcionals**

- N/A

#### ALCANCE

**Inclòs**

- Endpoint `GET /api/admin/reports`
- Taula d'informes a `/admin`

**Fora d'abast**

- Evolució temporal de vendes (US-09-02)
- Exportació CSV (N/A)

#### DEPENDÈNCIES

- **US-04-07**: les vendes han d'existir
- **US-06-01**: la pàgina `/admin` s'ha de compartir

#### ÍNDEX DE RETRABAJO

**Baix.** Informe agregat simple. Si s'afegeix gràfic (US-09-02), s'usa el mateix endpoint.

#### CRITERIS D'ACCEPTACIÓ

**Criteri 1 — Informe correcte**

- DONAT que s'han venut 10 seients VIP (50€) i 30 seients General (25€)
- QUAN es consulta `GET /api/admin/reports`
- ALESHORES la resposta mostra: VIP → 10 venuts, 500€; General → 30 venuts, 750€; i els percentatges d'ocupació calculats correctament

---

## EP-07 — Testing i qualitat de codi

---

### US-07-01 — Tests unitaris de stores Pinia

#### CONTEXT

Les stores Pinia contenen la lògica de transformació d'estat que és el cor de la reactivitat del frontend. Sense tests, un canvi aparentment innocent a `actualitzarEstat()` podria trencar la sincronització en temps real sense que ningú se n'adonés fins a la demo.

#### USER STORY

**Com a** enginyera del projecte,  
**vull** tenir tests unitaris per a les accions de les stores Pinia de seients i reserves,  
**per tal de** detectar regressions en la lògica d'estat sense dependre de proves manuals.

#### ESPECIFICACIONS

**Requisits funcionals**

- `seients.spec.ts`:
  - `inicialitzar([])` → el Map de seients queda buit
  - `inicialitzar([seat1, seat2])` → el Map té 2 entrades
  - `actualitzarEstat(id, 'RESERVAT')` → el seient canvia d'estat al Map
  - `marcarComMeu(id)` → afegeix a `seientsMeus` Set
- `reserva.spec.ts`:
  - `afegirReserva(seatId, expira_en)` → s'afegeix a l'array i `expira_en` s'estableix
  - `eliminarReserva(seatId)` → s'elimina de l'array
  - `netejarReserves()` → l'array queda buit i `expira_en` és `null`
- Execució: `pnpm --filter frontend test`

**Requisits no funcionals**

- Tests s'executen amb Vitest
- No requereixen connexió a BD ni a Socket.IO (mocks purs)

#### ALCANCE

**Inclòs**

- `stores/seients.spec.ts`, `stores/reserva.spec.ts`

**Fora d'abast**

- Tests de components Vue (N/A en aquesta US)

#### DEPENDÈNCIES

- **US-03-01, US-04-01**: les stores han d'estar implementades

#### ÍNDEX DE RETRABAJO

**Baix.** Els tests han d'actualitzar-se si canvien les interfícies de les stores, però és manteniment esperat.

#### CRITERIS D'ACCEPTACIÓ

**Criteri 1 — Tests passen**

- DONAT que les stores estan implementades
- QUAN s'executa `pnpm --filter frontend test`
- ALESHORES tots els tests de `seients.spec.ts` i `reserva.spec.ts` passen en verd

**Criteri 2 — Cobertura mínima**

- DONAT que els tests s'executen amb `--coverage`
- QUAN es genera l'informe de cobertura
- ALESHORES les stores `seients.ts` i `reserva.ts` tenen ≥ 80% de cobertura de línies

---

### US-07-02 — Tests unitaris de composables

#### CONTEXT

El composable `useTemporitzador` és una funció amb lògica temporal crítica. Un error en el càlcul dels segons restants podria fer que el timer expirés massa aviat o massa tard, generant reserves alliberades incorrectament al client.

#### USER STORY

**Com a** enginyera del projecte,  
**vull** tenir tests unitaris per al composable `useTemporitzador`,  
**per tal de** garantir que el càlcul del temps restant és matemàticament correcte i que el comportament en expirar és l'esperat.

#### ESPECIFICACIONS

**Requisits funcionals**

- `useTemporitzador.spec.ts`:
  - Donat `expira_en = NOW + 300s`, els `segonsRestants` inicials són ≥ 299
  - Donat `expira_en = NOW - 1s` (ja expirat), `segonsRestants` és 0
  - El composable emet un event intern quan arriba a 0
- Tests usen `vi.useFakeTimers()` de Vitest per controlar el temps

**Requisits no funcionals**

- N/A

#### ALCANCE

**Inclòs**

- `composables/useTemporitzador.spec.ts`

**Fora d'abast**

- Tests de la renderització del component `TemporitzadorReserva.vue`

#### DEPENDÈNCIES

- **US-04-03**: el composable ha d'estar implementat

#### ÍNDEX DE RETRABAJO

**Baix.**

#### CRITERIS D'ACCEPTACIÓ

**Criteri 1 — Càlcul precís**

- DONAT `expira_en = T+300s` i `vi.useFakeTimers()`
- QUAN el timer avança 10 segons
- ALESHORES `segonsRestants` és `290`

---

### US-07-03 — Tests de rutes i navegació

#### CONTEXT

Les rutes dinàmiques de Nuxt i les redireccions condicionals (checkout sense reserves → `/`) defineixen fluxos de navegació crítics. Una ruta trencada podria bloquejar l'usuari en un estat inconsistent.

#### USER STORY

**Com a** enginyera del projecte,  
**vull** tests que verifiquin el comportament de les rutes dinàmiques i les redireccions,  
**per tal de** detectar errors de navegació de manera automàtica.

#### ESPECIFICACIONS

**Requisits funcionals**

- Test 1: `GET /events/dune-4k-dolby-2026` → el paràmetre `slug` és `"dune-4k-dolby-2026"` al component
- Test 2: accedir a `/checkout` amb la store `reserva.seients` buida → redirigeix a `/`
- Test 3: accedir a `/admin` sense JWT vàlid o amb rol diferent d'`admin` → redirigeix a `/`
- Tests usen Nuxt Testing Utils (`@nuxt/test-utils`)

**Requisits no funcionals**

- N/A

#### ALCANCE

**Inclòs**

- Fitxer de test de rutes al directori `frontend/tests/`

**Fora d'abast**

- Tests E2E (Cypress, US-07-04)

#### DEPENDÈNCIES

- **US-02-02**: les pàgines han d'estar implementades

#### ÍNDEX DE RETRABAJO

**Baix.**

#### CRITERIS D'ACCEPTACIÓ

**Criteri 1 — Ruta dinàmica**

- DONAT que existeix la pàgina `/events/[slug].vue`
- QUAN es renderitza la ruta `/events/dune-4k-dolby-2026`
- ALESHORES el component rep `slug === "dune-4k-dolby-2026"` als seus params

---

### US-07-04 — Test de concurrència (obligatori)

#### CONTEXT

El requisit acadèmic més important del projecte és demostrar que el sistema gestiona la concurrència correctament. Sense un test automatitzat i reproductible, la validació es fa manualment, cosa que no és acceptable per a un sistema CI/CD.

#### USER STORY

**Com a** enginyera del projecte,  
**vull** un test automatitzat que demostri que dos clients Socket.IO simultanis no poden reservar el mateix seient,  
**per tal de** validar el mecanisme de `SELECT FOR UPDATE` de manera objectiva i integrar-ho al pipeline CI.

#### ESPECIFICACIONS

**Requisits funcionals**

- El test obre dos clients Socket.IO contra el servidor de test
- Ambdós emeten `seient:reservar { seatId: seed_seat_id, token: uuid }` en paral·lel via `Promise.all`
- El test espera la resposta de cada socket (`reserva:confirmada` o `reserva:rebutjada`)
- Assertions:
  - `[resA.ok, resB.ok]` conté exactament un `true` i un `false`
  - `resA.ok !== resB.ok` (mai els dos iguals)
  - La BD té exactament 1 reserva per aquell seient

**Requisits no funcionals**

- El test ha de ser determinista: no pot fallar o passar aleatòriament
- El test necessita un servidor NestJS real arrencant-se en mode test (o en Docker)

#### ALCANCE

**Inclòs**

- Fitxer `backend/test/concurrencia.spec.ts`
- Helpers per crear clients Socket.IO en tests

**Fora d'abast**

- Test amb >2 clients simultanis (extensió possible però no requerida)

#### DEPENDÈNCIES

- **US-04-01**: el mecanisme de `SELECT FOR UPDATE` ha d'estar implementat
- **US-01-04**: el seed proporciona el seient per al test

#### ÍNDEX DE RETRABAJO

**Baix.** El test és independent de la UI. Si canvia el nom de l'event Socket.IO, s'actualitza el test.

#### CRITERIS D'ACCEPTACIÓ

**Criteri 1 — Exactament un èxit**

- DONAT que dos clients Socket.IO emeten `seient:reservar` per al mateix seient simultàniament
- QUAN ambdues peticions es resolen
- ALESHORES exactament un client ha rebut `reserva:confirmada` i l'altre `reserva:rebutjada`, i la BD confirma una sola reserva

**Criteri 2 — Test al CI**

- DONAT que es fa push a qualsevol branca
- QUAN el pipeline CI arriba al pas de test de concurrència
- ALESHORES el test s'executa i bloqueja el merge si falla

---

### US-07-05 — Configuració ESLint i Prettier

#### CONTEXT

Treballar sola en un projecte complex amb un termini de lliurament ajustat fa que la consistència del codi sigui crítica. ESLint detecta patrons problemàtics i Prettier evita discussions de format, deixant tot el focus en la lògica.

#### USER STORY

**Com a** enginyera del projecte,  
**vull** tenir ESLint i Prettier configurats al monorepo,  
**per tal de** mantenir un codi consistent, detectar errors estàtics i no perdre temps en decisions de format.

#### ESPECIFICACIONS

**Requisits funcionals**

- `pnpm lint` executa ESLint als tres workspaces: `frontend`, `backend`, `shared`
- `pnpm format` executa Prettier sobre tots els fitxers `.ts`, `.vue`, `.json`
- Regles ESLint: Vue 3 recommended + TypeScript recommended
- Prettier integrat com a regla d'ESLint (no com a eina separada)
- `.eslintrc` i `.prettierrc` a l'arrel del monorepo

**Requisits no funcionals**

- El CI executa `pnpm lint` com a primer pas; si falla, els tests no s'executen

#### ALCANCE

**Inclòs**

- Configuració d'ESLint i Prettier al monorepo

**Fora d'abast**

- Hooks de pre-commit (opcionalment afegibles però no requerits)

#### DEPENDÈNCIES

- **US-01-01**: estructura del monorepo

#### ÍNDEX DE RETRABAJO

**Nul.** Configuració pura de tooling.

#### CRITERIS D'ACCEPTACIÓ

**Criteri 1 — Lint sense errors**

- DONAT que el codi del projecte és consistent
- QUAN s'executa `pnpm lint`
- ALESHORES la sortida no conté cap error ni warning crític

---

## EP-08 — Infraestructura, CI/CD i desplegament

---

### US-08-01 — Pipeline CI (GitHub Actions)

#### CONTEXT

Integrar de manera automàtica tots els tests al pipeline de CI és el que transforma el projecte d'acadèmic a professional. Sense CI, el test de concurrència podria ometre's accidentalment, i el codi podria arribar a producció trencat.

#### USER STORY

**Com a** enginyera del projecte,  
**vull** un workflow de CI que executi lint, type-check i tots els tests en cada push i PR,  
**per tal de** garantir que el codi a `main` sempre és correcte i que el test de concurrència no es pot saltar.

#### ESPECIFICACIONS

**Requisits funcionals**

- `.github/workflows/ci.yml` s'activa en `push` i `pull_request` a qualsevol branca
- Passos en seqüència:
  1. `pnpm install`
  2. `pnpm lint` + `pnpm --filter backend tsc --noEmit` + `pnpm --filter frontend tsc --noEmit`
  3. `pnpm --filter frontend test`
  4. `pnpm --filter backend test` (inclou test de concurrència)
- Si qualsevol pas falla: el workflow marca `failure` i bloqueja merge a `main`
- Temps total objectiu: < 5 minuts

**Requisits no funcionals**

- El pas de tests del backend necessita un PostgreSQL de test (GitHub Actions service container: `postgres:16`)

#### ALCANCE

**Inclòs**

- `.github/workflows/ci.yml` complet

**Fora d'abast**

- Desplegament (US-08-02, US-08-03)

#### DEPENDÈNCIES

- **US-07-01, US-07-02, US-07-03, US-07-04, US-07-05**: tots els tests han d'existir i passar

#### ÍNDEX DE RETRABAJO

**Baix.** El workflow creix afegint passos; no es refactoritza.

#### CRITERIS D'ACCEPTACIÓ

**Criteri 1 — Bloqueig en test fallit**

- DONAT que el test de concurrència falla per un canvi al `SeatsService`
- QUAN es fa push a una branca i s'obra PR
- ALESHORES el workflow marca `failure` i GitHub bloqueja el merge a `main`

---

### US-08-02 — Workflow de desplegament del backend

#### CONTEXT

El desplegament manual és propens a errors. Automatitzar-lo garanteix que el VPS del centre sempre executa el codi de `main` que ha passat el CI, i que la imatge Docker és reproducible.

#### USER STORY

**Com a** enginyera del projecte,  
**vull** un workflow que construeixi i desplegui el backend al VPS automàticament en fer push a `main`,  
**per tal de** eliminar el desplegament manual i garantir que el servidor sempre executa el codi verificat.

#### ESPECIFICACIONS

**Requisits funcionals**

- `.github/workflows/deploy-backend.yml` s'activa en push a `main` (i requereix que `ci.yml` hagi passat)
- Passos:
  1. Build de la imatge Docker del backend (multi-stage: build + runtime)
  2. Push de la imatge a GHCR (`ghcr.io/{owner}/{repo}-backend:latest`)
  3. SSH al VPS: `docker compose pull backend && docker compose up -d backend`
- Variables sensibles (SSH key, host, user) guardades com a GitHub Secrets

**Requisits no funcionals**

- Seguretat: la clau SSH és exclusiva per a CI/CD i té només els permisos necessaris al VPS
- La imatge Docker no conté `.env` ni secrets hardcodats; variables d'entorn injectades en runtime

#### ALCANCE

**Inclòs**

- `.github/workflows/deploy-backend.yml`
- Dockerfile de producció del backend (multi-stage)

**Fora d'abast**

- Rolling deploy / zero-downtime (N/A en VPS acadèmic)

#### DEPENDÈNCIES

- **US-08-01**: el CI ha de passar abans del deploy

#### ÍNDEX DE RETRABAJO

**Baix.** Quan es proporcioni la IP del VPS, s'afegeix als Secrets sense canviar el workflow.

#### CRITERIS D'ACCEPTACIÓ

**Criteri 1 — Deploy automàtic**

- DONAT que tots els tests del CI passen en push a `main`
- QUAN el workflow de deploy s'activa
- ALESHORES el VPS executa la nova versió del backend en menys de 3 minuts des del push

---

### US-08-03 — Workflow de desplegament del frontend

#### CONTEXT

El frontend i el backend es despleguen de manera independent, cosa que permet actualitzar el frontend sense reiniciar el backend (i viceversa), evitant interrupcions del servei innecessàries.

#### USER STORY

**Com a** enginyera del projecte,  
**vull** un workflow que construeixi i desplegui el frontend Nuxt al VPS de manera independent del backend,  
**per tal de** poder actualitzar la UI sense afectar el servei de venda actiu.

#### ESPECIFICACIONS

**Requisits funcionals**

- `.github/workflows/deploy-frontend.yml` s'activa en push a `main`
- Passos:
  1. Build de la imatge Docker de Nuxt (mode SSR, `nuxt build`)
  2. Push a GHCR (`ghcr.io/{owner}/{repo}-frontend:latest`)
  3. SSH al VPS: `docker compose pull frontend && docker compose up -d frontend`
- Variables d'entorn de producció (`NUXT_PUBLIC_API_URL`, `NUXT_PUBLIC_WS_URL`) injectades en build time via `ARG` del Dockerfile

**Requisits no funcionals**

- El Dockerfile ha de ser multi-stage per minimitzar la mida de la imatge de producció

#### ALCANCE

**Inclòs**

- `.github/workflows/deploy-frontend.yml`
- Dockerfile de producció del frontend

**Fora d'abast**

- CDN o edge deployment (N/A)

#### DEPENDÈNCIES

- **US-08-01**: el CI ha de passar

#### ÍNDEX DE RETRABAJO

**Baix.**

#### CRITERIS D'ACCEPTACIÓ

**Criteri 1 — Deploy independent**

- DONAT que el backend no ha canviat
- QUAN es fa push a `main` amb un canvi de CSS al frontend
- ALESHORES el frontend es redesplegua sense reiniciar el contenidor del backend

---

### US-08-05 — Workflow de desplegament del Laravel Service

#### CONTEXT

El Laravel Service és el responsable de tota la capa de persistència i autenticació. Cal desplegar-lo de manera independent del Node Service i del frontend, amb la seva pròpia imatge Docker, per poder aplicar migracions i actualitzar l'API sense afectar la capa de temps real.

#### USER STORY

**Com a** enginyera del projecte,
**vull** un workflow que construeixi i desplegui el Laravel Service al VPS automàticament en fer push a `main`,
**per tal de** garantir que el servei d'API i autenticació sempre executa el codi verificat sense desplegament manual.

#### ESPECIFICACIONS

**Requisits funcionals**

- `.github/workflows/deploy-laravel.yml` s'activa en push a `main` (i requereix que `ci.yml` hagi passat)
- Passos:
  1. Build de la imatge Docker de Laravel (multi-stage: composer install + runtime PHP-FPM o Octane)
  2. Push de la imatge a GHCR (`ghcr.io/{owner}/{repo}-laravel:latest`)
  3. SSH al VPS: `docker compose pull laravel-service && docker compose up -d laravel-service`
- Variables sensibles (SSH key, host, user, `LARAVEL_APP_KEY`, `JWT_SECRET`) guardades com a GitHub Secrets

**Requisits no funcionals**

- La imatge Docker no conté `.env` ni secrets hardcodats; variables d'entorn injectades en runtime
- La migració automàtica s'executa via `docker-entrypoint.sh` (US-08-04), no al workflow

#### ALCANCE

**Inclòs**

- `.github/workflows/deploy-laravel.yml`
- Dockerfile de producció del Laravel Service (multi-stage)

**Fora d'abast**

- Zero-downtime deploy (N/A en VPS acadèmic)

#### DEPENDÈNCIES

- **US-08-01**: el CI ha de passar
- **US-08-04**: el `docker-entrypoint.sh` amb `php artisan migrate --force` ha d'existir

#### ÍNDEX DE RETRABAJO

**Baix.** Quan es proporcioni la IP del VPS, s'afegeix als Secrets sense canviar el workflow.

#### CRITERIS D'ACCEPTACIÓ

**Criteri 1 — Deploy automàtic del Laravel Service**

- DONAT que tots els tests del CI passen en push a `main`
- QUAN el workflow de deploy-laravel s'activa
- ALESHORES el VPS executa la nova versió del Laravel Service en menys de 5 minuts, les migracions s'han aplicat i `GET /api/health` retorna `200`

---

### US-08-04 — Migració automàtica de BD en desplegament

#### CONTEXT

Si el Laravel Service es desplegua amb un esquema de BD nou però sense executar les migracions, el servidor falla en arrancar. Automatitzar `php artisan migrate --force` com a pas previ a l'inici del servidor garanteix la consistència BD-codi en tot moment.

#### USER STORY

**Com a** enginyera del projecte,  
**vull** que les migracions Eloquent s'apliquin automàticament cada vegada que el Laravel Service es desplegua,  
**per tal de** que l'esquema de BD estigui sempre sincronitzat amb el codi sense intervenció manual.

#### ESPECIFICACIONS

**Requisits funcionals**

- El `docker-entrypoint.sh` del contenidor `laravel-service` executa, en ordre:
  1. `php artisan migrate --force` (aplica migracions pendents en producció)
  2. `php artisan serve --host=0.0.0.0 --port=8000` (arrenca el servidor)
- Si `php artisan migrate --force` falla (BD no accessible o migració amb error), el contenidor no arrenca (fail-fast)

**Requisits no funcionals**

- `--force` és obligatori en producció amb Laravel per acceptar migracions sense prompt interactiu
- No executa el seed en producció

#### ALCANCE

**Inclòs**

- `docker-entrypoint.sh` al `backend/laravel-service/`
- `ENTRYPOINT` al Dockerfile de `laravel-service` apuntant a l'script

**Fora d'abast**

- Backup de BD pre-migració (N/A en context acadèmic)

#### DEPENDÈNCIES

- **US-08-05**: el Dockerfile de producció del Laravel Service ha d'existir

#### ÍNDEX DE RETRABAJO

**Nul.**

#### CRITERIS D'ACCEPTACIÓ

**Criteri 1 — Migració automàtica en deploy**

- DONAT que hi ha una nova migració Eloquent al repositori
- QUAN el contenidor `laravel-service` s'inicia al VPS
- ALESHORES `php artisan migrate --force` s'executa primer i aplica la migració; el servidor arrenca correctament

---

## EP-09 — Funcionalitats opcionals (gràfics i UX avançada)

---

### US-09-01 — Gràfic d'ocupació en temps real (admin)

#### CONTEXT

Una representació visual de l'ocupació és més intuïtiva que xifres soltes per a l'administradora de Sala Onirica. En un donut chart, el percentatge de seients venuts es percep immediatament.

#### USER STORY

**Com a** administradora de Sala Onirica,  
**vull** veure un gràfic de donut que representi l'ocupació actual dels seients en temps real,  
**per tal de** tenir una percepció visual i immediata de l'evolució de la venda.

#### ESPECIFICACIONS

**Requisits funcionals**

- Gràfic donut (Vue ChartJS) al dashboard `/admin`
- 3 seccions: Disponibles (verd), Reservats (groc), Venuts (blau/gris)
- El gràfic s'actualitza quan la store rep l'event `stats:actualitzacio`
- Tooltip mostra xifra i percentatge per secció

**Requisits no funcionals**

- Vue ChartJS s'instal·la com a paquet local (no CDN)

#### ALCANCE

**Inclòs**

- Component de gràfic donut al dashboard

**Fora d'abast**

- Gràfic d'evolució temporal (US-09-02)

#### DEPENDÈNCIES

- **US-06-01**: dashboard i `stats:actualitzacio` han d'existir

#### ÍNDEX DE RETRABAJO

**Baix.** Component independent.

#### CRITERIS D'ACCEPTACIÓ

**Criteri 1 — Actualització automàtica**

- DONAT que el dashboard mostra el gràfic
- QUAN un usuari compra 3 entrades en un altre navegador
- ALESHORES el donut s'actualitza reflectint els 3 nous venuts, sense recarregar

---

### US-09-02 — Gràfic d'evolució de vendes (admin)

#### CONTEXT

Saber en quins moments es concentren les compres permet a Sala Onirica planificar futures obertes de venda i entendre el comportament dels seus fans.

#### USER STORY

**Com a** administradora de Sala Onirica,  
**vull** veure una gràfica de línies amb l'evolució de vendes per franja horària,  
**per tal de** identificar els moments de màxima demanda i optimitzar futures obertes de venda.

#### ESPECIFICACIONS

**Requisits funcionals**

- Gràfic de línies (Vue ChartJS) a la secció d'informes de `/admin`
- Eix X: franges de 15 minuts des de la primera venda
- Eix Y: nombre acumulat de vendes
- Dades de `GET /api/admin/reports` (el backend calcula l'agregació per franja)

#### ALCANCE

**Inclòs**

- Component de gràfic de línies + endpoint agregat

**Fora d'abast**

- Exportació de dades

#### DEPENDÈNCIES

- **US-06-02**: l'endpoint d'informes ha d'existir

#### ÍNDEX DE RETRABAJO

**Baix.**

#### CRITERIS D'ACCEPTACIÓ

**Criteri 1 — Dades correctes**

- DONAT que hi ha vendes en 3 franges horàries
- QUAN es renderitza el gràfic
- ALESHORES la línia mostra un valor creixent i culmina al total de vendes

---

### US-09-03 — Animacions de canvi d'estat de seients

#### CONTEXT

Les animacions visuals en el mapa de seients fan l'experiència de Sala Onirica més immersiva i ajuden l'usuari a percebre immediatament quins seients han canviat d'estat.

#### USER STORY

**Com a** usuari de Sala Onirica a la pàgina d'una projecció,  
**vull** que els seients mostrin una animació subtil quan canvien d'estat,  
**per tal de** percebre visualment i sense esforç quins seients acaben de canviar mentre estic decidint.

#### ESPECIFICACIONS

**Requisits funcionals**

- Transició CSS `scale + background-color` quan el component `Seient.vue` canvia d'estat
- Durada: 300ms (no interfereix amb la rapidesa d'ús)
- S'aplica a totes les transicions: disponible→reservat, reservat→disponible, reservat→venut

**Requisits no funcionals**

- L'animació usa `transition` CSS pur, no JS; no afecta el rendiment

#### ALCANCE

**Inclòs**

- Afegir `transition` CSS al component `Seient.vue`

#### DEPENDÈNCIES

- **US-03-02**: la reactivitat de l'estat ha d'existir

#### ÍNDEX DE RETRABAJO

**Nul.**

#### CRITERIS D'ACCEPTACIÓ

**Criteri 1 — Transició visible**

- DONAT que el seient A1 és verd (DISPONIBLE)
- QUAN un altre usuari el reserva
- ALESHORES el seient A1 transiciona visualment a taronja en ~300ms, amb un efecte `scale` perceptible

---

### US-09-04 — Reconnexió Socket.IO amb recuperació d'estat

#### CONTEXT

Un usuari de Sala Onirica que perd la connexió wifi momentàniament durant el procés de compra a `/checkout` no ha de perdre les seves reserves ni el timer. La recuperació transparent de l'estat és el que diferencia una aplicació robusta d'una de fràgil.

#### USER STORY

**Com a** usuari de Sala Onirica que ha perdut la connexió momentàniament,  
**vull** que el sistema es recuperi automàticament i restauri el meu estat de reserva,  
**per tal de** no perdre les entrades que havia reservat per culpa d'una interrupció de xarxa.

#### ESPECIFICACIONS

**Requisits funcionals**

- El handler `connect` de Socket.IO (s'activa en reconnexió) re-emet automàticament `event:unir { eventId }` amb el JWT existent a la store `auth`
- El backend, en rebre `event:unir` per a un `user_id` que ja té reserva activa, retorna l'estat de les reserves amb els `expira_en` actuals
- El frontend re-sincronitza la store `reserva.ts` (actualitza `expira_en` sense reiniciar el timer a 5 minuts)
- El frontend demana l'estat actual de tots els seients (`GET /api/events/:slug/seats`) i actualitza la store `seients.ts`
- L'usuari veu el banner "Connexió recuperada" durant 3 segons

**Requisits no funcionals**

- El timer de `useTemporitzador` s'ha de recalcular des del `expira_en` real, no reiniciar des de 5 minuts

#### ALCANCE

**Inclòs**

- Lògica de reconnexió al plugin `socket.client.ts` + handler de re-sync al backend

**Fora d'abast**

- Persistència de l'estat en `localStorage` més enllà del JWT (N/A)

#### DEPENDÈNCIES

- **US-04-05**: l'`expira_en` real ha d'existir a la BD
- **US-03-02**: la room i el plugin de Socket.IO han d'estar operatius

#### ÍNDEX DE RETRABAJO

**Mig.** Modifica el plugin `socket.client.ts` i el handler `event:unir` al backend. Si es fa bé, no cal retraballo posterior.

#### CRITERIS D'ACCEPTACIÓ

**Criteri 1 — Recuperació de reserves**

- DONAT que l'usuari té 2 reserves actives amb 3 minuts restants i perd la connexió 30 segons
- QUAN la connexió es restaura (el handler `connect` s'activa)
- ALESHORES el timer mostra ~2:30 restants (no 5:00) i els seients continuen marcats com a propis a la UI

---

## Resum del backlog

| Èpica | Títol                               | User Stories        | Prioritat    |
| ----- | ----------------------------------- | ------------------- | ------------ |
| EP-00 | Autenticació i seguretat (JWT)      | US-00-01 a US-00-06 | Must Have    |
| EP-01 | Infraestructura i monorepo          | US-01-01 a US-01-08 | Must Have    |
| EP-02 | Gestió d'esdeveniments (Admin CRUD) | US-02-01 a US-02-05 | Must Have    |
| EP-03 | Mapa de seients en temps real       | US-03-01 a US-03-03 | Must Have    |
| EP-04 | Flux de reserva i compra            | US-04-01 a US-04-08 | Must Have    |
| EP-05 | Consulta d'entrades                 | US-05-01            | Must Have    |
| EP-06 | Panell d'administració i informes   | US-06-01 a US-06-02 | Must Have    |
| EP-07 | Testing i qualitat                  | US-07-01 a US-07-05 | Must Have    |
| EP-08 | Infraestructura i CI/CD             | US-08-01 a US-08-05 | Must Have    |
| EP-09 | Funcionals opcionals                | US-09-01 a US-09-04 | Nice to Have |

**Total: 10 èpiques · 39 user stories**

> **v2.0** — S'han afegit EP-00 (6 US d'autenticació JWT) i US-01-05 a US-01-08 (scaffold Node Service, scaffold Laravel Service, Nginx proxy i client HTTP intern). US-08-05 cobreix el deploy del Laravel Service. Totes les referències a `sessionToken`, `prisma.$transaction` i `X-Admin-Token` han estat substituïdes per JWT, Eloquent i middleware `admin.ts`.

---

_Backlog refinat amb plantilla completa. Cada US-XX-XX pot importar-se com a Issue de tipus "Story" associada a la seva Épica a Jira._

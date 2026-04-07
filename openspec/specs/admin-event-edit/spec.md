## Purpose

Especificació de la funcionalitat d'edició d'events per a l'administradora. Cobreix els endpoints de backend Laravel per consultar i actualitzar un event existent, les validacions de negoci associades (reserves actives, slug duplicat) i la pàgina de frontend Nuxt 3 amb el formulari d'edició.

---

## Requirements

### Requirement: Endpoint GET /api/admin/events/:id retorna les dades d'un event existent

El sistema SHALL exposar `GET /api/admin/events/:id` al backend Laravel, protegit per `auth:sanctum` i el middleware `admin`. L'endpoint SHALL retornar `200 OK` amb el cos de l'event (incloent `id`, `name`, `slug`, `description`, `date`, `venue`, `published`, `price_categories`). SHALL retornar `404 Not Found` si l'event no existeix, i `401 Unauthorized` si no s'inclou el header `Authorization: Bearer <token>`.

#### Scenario: Show retorna l'event amb 200

- **GIVEN** que l'administradora envia `GET /api/admin/events/:id` amb header `Authorization: Bearer <token>` vàlid
- **GIVEN** l'event existeix
- **WHEN** s'envia la petició
- **THEN** la resposta té status `200 OK`
- **THEN** el cos JSON conté `id`, `name`, `slug`, `description`, `date`, `venue`, `published`, `price_categories`

#### Scenario: Show retorna 404 per event inexistent

- **GIVEN** que l'id de la URL no correspon a cap event existent
- **WHEN** s'envia `GET /api/admin/events/:id` amb token vàlid
- **THEN** la resposta té status `404 Not Found`

#### Scenario: Show retorna 401 sense token

- **GIVEN** que no s'inclou el header `Authorization`
- **WHEN** s'envia `GET /api/admin/events/:id`
- **THEN** la resposta té status `401 Unauthorized`

---

### Requirement: Endpoint PUT /api/admin/events/:id actualitza les metadades d'un event existent

El sistema SHALL exposar `PUT /api/admin/events/:id` al backend Laravel, protegit per `auth:sanctum` i el middleware `admin`. L'endpoint SHALL acceptar un body parcial amb els camps `name`, `slug`, `description`, `date` i `venue`. La resposta SHALL ser `200 OK` amb el cos de l'event actualitzat. L'endpoint SHALL retornar `404 Not Found` si l'event no existeix.

#### Scenario: Actualització exitosa de descripció

- **GIVEN** que l'administradora envia `PUT /api/admin/events/:id` amb header `Authorization: Bearer <token>` vàlid
- **GIVEN** el payload conté `{ "description": "Nova descripció" }` i l'event existeix
- **WHEN** s'envia la petició
- **THEN** la resposta té status `200 OK`
- **THEN** el cos JSON conté l'event amb la nova `description`

#### Scenario: Actualització exitosa de data futura

- **GIVEN** que l'administradora envia el payload `{ "date": "<data futura vàlida>" }` amb token vàlid
- **WHEN** s'envia `PUT /api/admin/events/:id`
- **THEN** la resposta té status `200 OK`
- **THEN** l'event a la BD té la nova `date`

#### Scenario: Event no trobat retorna 404

- **GIVEN** que l'id de la URL no correspon a cap event existent
- **WHEN** s'envia `PUT /api/admin/events/:id` amb token vàlid
- **THEN** la resposta té status `404 Not Found`

#### Scenario: Petició sense Authorization header retorna 401

- **GIVEN** que no s'inclou el header `Authorization: Bearer`
- **WHEN** s'envia `PUT /api/admin/events/:id`
- **THEN** la resposta té status `401 Unauthorized`

#### Scenario: Petició amb rol comprador retorna 403

- **GIVEN** que el token pertany a un usuari amb `role = 'comprador'`
- **WHEN** s'envia `PUT /api/admin/events/:id`
- **THEN** la resposta té status `403 Forbidden`

#### Scenario: Testabilitat del endpoint d'actualització

- **GIVEN** un entorn de test Laravel amb base de dades PostgreSQL de test i PHPUnit
- **WHEN** s'executen els Feature tests de `AdminEventController`
- **THEN** tots els tests de `show` i `update` passen sense errors

---

### Requirement: PUT /api/admin/events/:id retorna 422 si s'intenten modificar categories amb reserves actives

El sistema SHALL retornar `422 Unprocessable Entity` amb el missatge `"No és possible modificar les categories mentre hi ha reserves actives"` si el body de la petició inclou el camp `price_categories` i l'event té almenys una `Reservation` activa (no expirada) o `OrderItem` associat als seus seients.

#### Scenario: Rebuig de modificació de categories amb reserves actives

- **GIVEN** que l'event té seients amb `Reservation` no expirades (`expires_at > now()`)
- **GIVEN** el payload inclou el camp `price_categories`
- **WHEN** s'envia `PUT /api/admin/events/:id` amb token vàlid
- **THEN** la resposta té status `422 Unprocessable Entity`
- **THEN** el cos conté `{ "message": "No és possible modificar les categories mentre hi ha reserves actives" }`

#### Scenario: Rebuig de modificació de categories amb order_items existents

- **GIVEN** que l'event té seients associats a `OrderItem` (seients venuts)
- **GIVEN** el payload inclou el camp `price_categories`
- **WHEN** s'envia `PUT /api/admin/events/:id` amb token vàlid
- **THEN** la resposta té status `422 Unprocessable Entity`

#### Scenario: Actualització de metadades sense price_categories no és bloquejada

- **GIVEN** que l'event té reserves actives
- **GIVEN** el payload **no** inclou el camp `price_categories`
- **WHEN** s'envia `PUT /api/admin/events/:id` amb token vàlid
- **THEN** la resposta té status `200 OK`
- **THEN** les reserves actives no es veuen afectades

#### Scenario: Testabilitat del guard de reserves actives

- **GIVEN** un entorn de Feature test Laravel amb reserves actives i `order_items` a la BD de test
- **WHEN** s'executen els tests de `AdminEventUpdateTest` amb `price_categories` al payload
- **THEN** el service llança la resposta `422` i tots els tests passen

---

### Requirement: PUT /api/admin/events/:id retorna 409 si el nou slug ja existeix

El sistema SHALL retornar `409 Conflict` si el payload inclou un `slug` que ja pertany a un altre event diferent.

#### Scenario: Slug duplicat en edició

- **GIVEN** que ja existeix un event amb `slug: "dune-4k-2026"` (id diferent)
- **GIVEN** el payload conté `{ "slug": "dune-4k-2026" }`
- **WHEN** s'envia `PUT /api/admin/events/:id` amb token vàlid
- **THEN** la resposta té status `409 Conflict`
- **THEN** l'event original no s'ha modificat (el seu `slug` continua sent l'original)

#### Scenario: Mantenir el mateix slug de l'event actual és permès

- **GIVEN** que el payload conté el mateix `slug` que ja té l'event amb el mateix `:id`
- **WHEN** s'envia `PUT /api/admin/events/:id` amb token vàlid
- **THEN** la resposta té status `200 OK`

#### Scenario: Testabilitat de la detecció de slug duplicat

- **GIVEN** un entorn de Feature test Laravel amb dos events a la BD de test
- **WHEN** s'executa `test_update_returns_409_for_duplicate_slug`
- **THEN** el test verifica el `409` i que el slug original de l'event no s'ha modificat

---

### Requirement: Pàgina /admin/events/[id] mostra formulari de edició d'un event

El sistema SHALL disposar d'una pàgina Nuxt 3 a `pages/admin/events/[id].vue` amb `definePageMeta({ ssr: false, middleware: 'admin' })` que carregui les dades actuals de l'event via `GET /api/admin/events/:id` i mostri un formulari reactiu per editar: `name`, `slug`, `description`, `date` i `venue`. En enviar el formulari amb èxit (`200`), SHALL redirigir a `/admin/events`.

#### Scenario: Formulari carrega les dades actuals de l'event

- **GIVEN** que l'administradora navega a `/admin/events/[id]`
- **WHEN** la pàgina es munta (CSR)
- **THEN** el formulari mostra els valors actuals de `name`, `date`, `venue` i `description`

#### Scenario: Edició exitosa redirigeix a /admin/events

- **GIVEN** que l'administradora modifica la descripció i envia el formulari
- **GIVEN** que l'API retorna `200 OK`
- **WHEN** el formulari s'envia
- **THEN** el router redirigeix a `/admin/events`

#### Scenario: Error 422 mostra missatge inline

- **GIVEN** que l'API retorna `422 Unprocessable Entity` amb el missatge de reserves actives
- **WHEN** l'administradora ha enviat el formulari
- **THEN** es mostra el missatge d'error inline a la pàgina

#### Scenario: La ruta no exposa dades en el HTML inicial

- **GIVEN** que es fa una petició HTTP directa a `/admin/events/[id]`
- **WHEN** s'analitza el HTML retornat
- **THEN** el HTML no conté dades de l'event ni de l'admin (ssr: false)

#### Scenario: Testabilitat de la pàgina d'edició

- **GIVEN** un entorn de test Nuxt amb `@nuxt/test-utils` i Vitest
- **WHEN** s'executa `pnpm test` al workspace `frontend`
- **THEN** tots els tests de `pages/admin/events/[id].spec.ts` passen sense errors

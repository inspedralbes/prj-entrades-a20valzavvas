# Spec: admin-event-create

## Purpose

Defineix el comportament de la funcionalitat de creació d'events per part de l'administrador, incloent l'endpoint backend `POST /api/admin/events` (creació transaccional d'event, categories de preu i seients) i la pàgina frontend `/admin/events/new`.

---

## Requirements

### Requirement: Endpoint POST /api/admin/events crea transaccionalment Event, categories de preu i seients

El sistema SHALL exposar `POST /api/admin/events` al backend Laravel que, dins d'una única transacció de base de dades, creï un registre `Event`, els registres `PriceCategory` associats i tots els registres `Seat` (un per combinació fila × número) amb `estat: DISPONIBLE`. La resposta SHALL ser `201 Created` amb el cos de l'event creat incloent les categories i el recompte de seients per categoria. L'endpoint SHALL estar protegit per `auth:sanctum` i pel middleware `admin`.

#### Scenario: Creació exitosa amb totes les dades vàlides

- **GIVEN** que l'administradora fa `POST /api/admin/events` amb un JWT vàlid i rol `admin`
- **GIVEN** el payload conté `name`, `date` (futura), `venue`, i `price_categories` amb `rows` i `seats_per_row` vàlids
- **WHEN** s'envia la petició
- **THEN** la resposta té status `201 Created`
- **THEN** el cos JSON conté `id`, `name`, `slug`, `date`, `venue`, `published: false`, `total_capacity` i `price_categories`
- **THEN** a la BD existeix un registre a `events`, registres a `price_categories` i tots els seients a `seats` amb `estat: DISPONIBLE`

#### Scenario: Tots els seients creats amb estat DISPONIBLE

- **GIVEN** que el payload conté una categoria amb `rows: ["A", "B"]` i `seats_per_row: 5`
- **WHEN** s'envia `POST /api/admin/events` amb èxit
- **THEN** s'han creat exactament 10 seients a `seats` (A1–A5, B1–B5) tots amb `estat: DISPONIBLE`

#### Scenario: Creació transaccional — rollback en cas d'error

- **GIVEN** que es produeix un error intern durant la inserció del segon lot de seients
- **WHEN** la transacció falla
- **THEN** cap registre ha quedat a les taules `events`, `price_categories` ni `seats`

#### Scenario: Rebutjat sense autenticació

- **GIVEN** que no s'envia cap header `Authorization`
- **WHEN** es fa `POST /api/admin/events`
- **THEN** la resposta té status `401 Unauthorized`

#### Scenario: Rebutjat amb rol comprador

- **GIVEN** un usuari autenticat amb rol `comprador`
- **WHEN** fa `POST /api/admin/events` amb el seu JWT vàlid
- **THEN** la resposta té status `403 Forbidden`

#### Scenario: Testabilitat del endpoint de creació

- **GIVEN** un entorn de test Laravel amb BD de test i les migrations aplicades
- **WHEN** s'executa el test de feature de `AdminEventController@store`
- **THEN** tots els tests passen sense errors

---

### Requirement: Slug únic — 409 si ja existeix

El sistema SHALL retornar `409 Conflict` si el `slug` enviat (o generat a partir del `name`) ja existeix a la taula `events`. El cos de la resposta SHALL contenir `{ "message": "Slug already exists" }`. La BD no SHALL contenir cap registre nou d'aquest intent frustrat (rollback garantit per la transacció).

#### Scenario: Creació rebutjada per slug duplicat

- **GIVEN** que ja existeix un event amb `slug: dune-4k-dolby-2026`
- **WHEN** s'envia `POST /api/admin/events` amb el mateix slug
- **THEN** la resposta té status `409 Conflict`
- **THEN** el cos conté `{ "message": "Slug already exists" }`
- **THEN** no s'ha creat cap registre nou a `events`

#### Scenario: Slug generat automàticament a partir del nom quan no es proporciona

- **GIVEN** que el payload no inclou el camp `slug`
- **GIVEN** el `name` és `"Blade Runner 2049 4K"`
- **WHEN** s'envia `POST /api/admin/events` amb èxit
- **THEN** el registre creat té `slug: "blade-runner-2049-4k"`

#### Scenario: Slug existent detectat abans d'iniciar la transacció

- **GIVEN** que ja existeix un event amb `slug: existing-slug`
- **WHEN** s'envia una petició amb el mateix slug
- **THEN** la resposta és `409` sense afectar cap altra taula

---

### Requirement: Validació de data futura obligatòria

El sistema SHALL rebutjar qualsevol petició on `date` sigui igual o anterior a `now()`. La resposta SHALL ser `422 Unprocessable Entity` amb errors de validació. El camp `date` SHALL ser obligatori.

#### Scenario: Data en el passat rebutjada

- **GIVEN** que el payload conté `"date": "2020-01-01T10:00:00"`
- **WHEN** s'envia `POST /api/admin/events`
- **THEN** la resposta té status `422 Unprocessable Entity`
- **THEN** el cos inclou un error de validació per al camp `date`

#### Scenario: Data absent rebutjada

- **GIVEN** que el payload no inclou el camp `date`
- **WHEN** s'envia `POST /api/admin/events`
- **THEN** la resposta té status `422 Unprocessable Entity`
- **THEN** el cos inclou `"date": ["The date field is required."]`

#### Scenario: Data futura vàlida acceptada

- **GIVEN** que el payload conté una `date` posterior a `now()` (ex. un any en el futur)
- **WHEN** s'envia `POST /api/admin/events` amb la resta de camps vàlids
- **THEN** la resposta té status `201 Created`

---

### Requirement: Pàgina /admin/events/new mostra formulari de creació d'events

El sistema SHALL disposar d'una pàgina Nuxt 3 a `pages/admin/events/new.vue` amb `definePageMeta({ ssr: false, middleware: 'admin' })` que mostri un formulari reactiu per crear un event. El formulari SHALL incloure els camps: `name`, `slug` (opcional, autocompletat), `description` (opcional), `date`, `venue`, i una secció dinàmica per afegir categories de preu (cadascuna amb `name`, `price`, `rows`, `seats_per_row`). En enviar el formulari amb èxit, SHALL redirigir a `/admin/events`.

#### Scenario: Formulari accessible per a administradora autenticada

- **GIVEN** que l'usuari té el middleware `admin` satisfet
- **WHEN** navega a `/admin/events/new`
- **THEN** el formulari de creació es mostra correctament

#### Scenario: Feedback d'error inline per slug duplicat

- **GIVEN** que l'API retorna `409 Conflict`
- **WHEN** l'usuari ha enviat el formulari
- **THEN** es mostra un missatge d'error inline indicant que el slug ja existeix

#### Scenario: Redirecció a /admin/events després de creació exitosa

- **GIVEN** que l'API retorna `201 Created`
- **WHEN** l'usuari ha enviat el formulari
- **THEN** el router redirigeix a `/admin/events`

#### Scenario: La ruta no exposa dades en el HTML inicial

- **GIVEN** que es fa una petició HTTP directa a `/admin/events/new` des d'un crawler
- **WHEN** s'analitza el HTML retornat
- **THEN** el HTML no conté dades d'autenticació ni de l'admin (ssr: false)

#### Scenario: Testabilitat de la pàgina admin/events/new

- **GIVEN** un entorn de test Nuxt amb `@nuxt/test-utils` i Vitest
- **WHEN** s'executa `pnpm test` al workspace `frontend`
- **THEN** tots els tests de `pages/admin/events/new.spec.ts` passen sense errors

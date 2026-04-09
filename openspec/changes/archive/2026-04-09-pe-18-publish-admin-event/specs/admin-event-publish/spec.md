## ADDED Requirements

### Requirement: PUT /api/admin/events/:id accepta el camp `published` i canvia la visibilitat pública d'un event

El sistema SHALL permetre que `PUT /api/admin/events/:id` rebi el camp `published` (boolean) al body de la petició. El sistema SHALL persistir el valor a la taula `events` i retornar l'event actualitzat amb el camp `published` al cos de la resposta amb status `200 OK`. L'endpoint SHALL estar protegit per `auth:sanctum` i el middleware `admin`.

#### Scenario: Publicar un event en esborrany

- **GIVEN** que existeix un event amb `published = false`
- **GIVEN** que l'administradora envia `PUT /api/admin/events/:id` amb `{ "published": true }` i header `Authorization: Bearer <token>` vàlid
- **WHEN** s'envia la petició
- **THEN** la resposta té status `200 OK`
- **THEN** el cos JSON conté `"published": true`
- **THEN** la BD té l'event amb `published = true`

#### Scenario: Despublicar un event publicat

- **GIVEN** que existeix un event amb `published = true`
- **GIVEN** que l'administradora envia `PUT /api/admin/events/:id` amb `{ "published": false }` i header `Authorization: Bearer <token>` vàlid
- **WHEN** s'envia la petició
- **THEN** la resposta té status `200 OK`
- **THEN** el cos JSON conté `"published": false`
- **THEN** la BD té l'event amb `published = false`

#### Scenario: Petició sense token retorna 401

- **GIVEN** que no s'inclou el header `Authorization`
- **WHEN** s'envia `PUT /api/admin/events/:id` amb `{ "published": true }`
- **THEN** la resposta té status `401 Unauthorized`

#### Scenario: Testabilitat del toggle de publicació

- **GIVEN** un entorn de Feature test Laravel amb BD de test i migrations aplicades
- **WHEN** s'executen tests de `AdminEventUpdateTest` amb payload `{ "published": true }` i `{ "published": false }`
- **THEN** tots els tests passen sense errors

---

### Requirement: GET /api/events retorna únicament els events publicats (accés públic)

El sistema SHALL exposar `GET /api/events` sense autenticació. L'endpoint SHALL retornar un array JSON amb els events que tinguin `published = true`, ordenats per data ascendent. Cada element SHALL incloure: `id`, `name`, `slug`, `date`, `venue`. L'endpoint SHALL retornar un array buit si no hi ha events publicats.

#### Scenario: Retorna només events publicats

- **GIVEN** que existeixen 3 events a la BD (2 amb `published = true`, 1 amb `published = false`)
- **WHEN** un visitant fa `GET /api/events` sense autenticació
- **THEN** la resposta té status `200 OK`
- **THEN** el cos conté un array de 2 elements, tots amb `published: true` implícit
- **THEN** l'event amb `published = false` no és inclòs

#### Scenario: Retorna array buit si no hi ha events publicats

- **GIVEN** que tots els events a la BD tenen `published = false`
- **WHEN** es fa `GET /api/events`
- **THEN** la resposta té status `200 OK`
- **THEN** el cos és un array buit `[]`

#### Scenario: Events ordenats per data ascendent

- **GIVEN** que hi ha 2 events publicats: event A amb data futura gran i event B amb data futura propera
- **WHEN** es fa `GET /api/events`
- **THEN** event B apareix abans que event A a la resposta

#### Scenario: Testabilitat del endpoint públic d'events

- **GIVEN** un entorn de Feature test Laravel amb BD de test i events publicats i no publicats
- **WHEN** s'executen els tests de `EventControllerTest`
- **THEN** tots els tests passen sense errors

---

### Requirement: Pàgina /admin/events inclou un botó de toggle de publicació funcional per a cada event

El sistema SHALL mostrar un botó "Publicar" o "Despublicar" per a cada fila de la taula d'events de la pàgina `/admin/events` (Nuxt 3, CSR). En fer clic, el sistema SHALL enviar `PUT /api/admin/events/:id` amb `{ published: !currentValue }`. En resposta exitosa, el sistema SHALL actualitzar el badge d'estat de la fila de forma reactiva (sense recarregar la pàgina). El botó SHALL mostrar "Publicar" si l'event té `publicat: false`, i "Despublicar" si té `publicat: true`.

#### Scenario: Clic "Publicar" publica l'event i actualitza el badge

- **GIVEN** que la pàgina `/admin/events` mostra un event amb `publicat: false` i badge "Esborrany"
- **WHEN** l'administradora fa clic al botó "Publicar" de la fila
- **THEN** s'envia `PUT /api/admin/events/:id` amb body `{ published: true }`
- **THEN** el badge canvia a "Publicat" sense recarregar la pàgina
- **THEN** el botó passa a mostrar "Despublicar"

#### Scenario: Clic "Despublicar" despublica l'event i actualitza el badge

- **GIVEN** que la pàgina mostra un event amb `publicat: true` i badge "Publicat"
- **WHEN** l'administradora fa clic al botó "Despublicar"
- **THEN** s'envia `PUT /api/admin/events/:id` amb body `{ published: false }`
- **THEN** el badge canvia a "Esborrany" sense recarregar la pàgina

#### Scenario: Testabilitat del toggle al frontend

- **GIVEN** un entorn de test Vitest amb `$fetch` mockat
- **WHEN** s'executa el test del component `pages/admin/events/index`
- **THEN** el test verifica que el clic al botó crida `$fetch` amb `{ published: true/false }` i que el badge s'actualitza reactivament

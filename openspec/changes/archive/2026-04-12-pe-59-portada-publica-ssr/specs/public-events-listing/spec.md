## ADDED Requirements

### Requirement: GET /api/events retorna la llista d'events publicats amb tots els camps necessaris per a la portada

El sistema SHALL exposar `GET /api/events` sense autenticació, retornant un array JSON dels events amb `published = true` ordenats per data ASC. Cada element SHALL incloure: `id`, `slug`, `name`, `date`, `venue`, `description`, `image_url` i `available_seats` (recompte de seients amb `status = 'DISPONIBLE'`).

#### Scenario: Retorna events publicats amb tots els camps

- **GIVEN** que existeixen 3 events a la BD, 2 amb `published = true` i 1 amb `published = false`
- **WHEN** s'envia `GET /api/events` sense cap header d'autenticació
- **THEN** la resposta té codi HTTP `200`
- **THEN** la resposta conté exactament 2 events
- **THEN** cada event conté els camps `id`, `slug`, `name`, `date`, `venue`, `description`, `image_url`, `available_seats`

#### Scenario: available_seats reflecteix només seients amb status DISPONIBLE

- **GIVEN** un event publicat amb 10 seients: 6 DISPONIBLE, 3 RESERVAT, 1 VENUT
- **WHEN** s'envia `GET /api/events`
- **THEN** l'event apareix a la resposta amb `available_seats = 6`

#### Scenario: Events ordenats per data ASC

- **GIVEN** que existeixen events publicats amb dates `2026-06-20` i `2026-05-10`
- **WHEN** s'envia `GET /api/events`
- **THEN** l'event del `2026-05-10` apareix abans que el del `2026-06-20`

#### Scenario: Accessible sense token (endpoint públic)

- **GIVEN** que no s'envia cap header `Authorization`
- **WHEN** s'envia `GET /api/events`
- **THEN** la resposta té codi HTTP `200` (no `401`)

### Requirement: Portada / renderitza la llista d'events com a pàgina SSR pública

La pàgina `pages/index.vue` SHALL renderitzar-se en mode SSR (sense `definePageMeta({ ssr: false })`), fer `useFetch('/api/events')` i mostrar un component `EventCard.vue` per cada event retornat, sense redirigir els visitants no autenticats.

#### Scenario: Visitant no autenticat veu la llista d'events

- **GIVEN** que un usuari no té token JWT (Visitant)
- **WHEN** navega a `/`
- **THEN** veu la llista d'events publicats sense ser redirigit a `/auth/login`

#### Scenario: Portada renderitzada per SSR (sense JavaScript)

- **GIVEN** que la pàgina `/` es sol·licita sense JavaScript
- **WHEN** el servidor processa la petició
- **THEN** el HTML retornat conté el nom dels events (no un `<div>` buit)

#### Scenario: Estat de càrrega mentre la petició és pendent

- **GIVEN** que la petició a `GET /api/events` és pendent
- **WHEN** la pàgina s'està carregant
- **THEN** es mostra un esquelet de càrrega (skeleton) en comptes d'un espai buit

#### Scenario: Pàgina buida si no hi ha events publicats

- **GIVEN** que no existeix cap event amb `published = true`
- **WHEN** un visitant navega a `/`
- **THEN** es mostra el missatge "No hi ha projeccions programades"

### Requirement: Component EventCard.vue mostra la informació d'un event amb tema fosc cinema

El component `EventCard.vue` SHALL acceptar les props `{ id, slug, name, date, venue, description?, available_seats }` i mostrar-les amb un tema fosc cinema (background `#1a2235`, text `#f1f5f9`, accent `#7c3aed`). SHALL incloure un badge de disponibilitat i un `<NuxtLink>` cap a `/events/{slug}`.

#### Scenario: Badge verd si hi ha molts seients disponibles

- **GIVEN** un `EventCard` amb `available_seats = 50`
- **WHEN** es renderitza el component
- **THEN** el badge mostra color verd (`#16A34A`)

#### Scenario: Badge groc si la disponibilitat és baixa

- **GIVEN** un `EventCard` amb `available_seats = 5`
- **WHEN** es renderitza el component
- **THEN** el badge mostra color groc/ambre (`#D97706`)

#### Scenario: Badge vermell si no hi ha seients disponibles

- **GIVEN** un `EventCard` amb `available_seats = 0`
- **WHEN** es renderitza el component
- **THEN** el badge mostra color vermell (`#DC2626`) i indica "Esgotat"

#### Scenario: Link a la pàgina del mapa de seients

- **GIVEN** un `EventCard` amb `slug = "dune-4k-2026"`
- **WHEN** es renderitza el component
- **THEN** conté un element `<a>` amb `href = "/events/dune-4k-2026"`

#### Scenario: Testabilitat del component

- **WHEN** s'executa el test `EventCard.spec.ts` amb props mock
- **THEN** el component es munta sense errors i renderitza el nom de l'event al DOM

### Requirement: Fix de redirecció post-login per a compradors

La pàgina `pages/auth/login.vue` SHALL redirigir els usuaris amb rol `comprador` a `/` (portada) en lloc de `/entrades` després d'un login correcte.

#### Scenario: Comprador redirigit a la portada després del login

- **GIVEN** un usuari amb rol `comprador` que fa login correctament
- **WHEN** el login retorna codi `200`
- **THEN** l'usuari és redirigit a `/` i veu la llista d'events

#### Scenario: Admin continua sent redirigit al panell

- **GIVEN** un usuari amb rol `admin` que fa login correctament
- **WHEN** el login retorna codi `200`
- **THEN** l'usuari és redirigit a `/admin/events`

## ADDED Requirements

### Requirement: Endpoint GET /api/admin/events retorna tots els esdeveniments

El sistema SHALL exposar `GET /api/admin/events` al backend Laravel que retorni tots els events de la taula `events` independentment del valor del camp `publicat`, ordenats per data ascendent. La resposta SHALL ser un array JSON amb els camps: `id`, `nom`, `data`, `hora`, `recinte`, `publicat`, `seients_disponibles`, `seients_reservats`, `seients_venuts`. L'endpoint SHALL estar protegit per `auth:sanctum` i pel middleware `admin` (rol `admin`).

#### Scenario: Llistat complet incloent esborranys

- **GIVEN** que existeixen 3 events a la BD (2 amb `publicat: true`, 1 amb `publicat: false`)
- **WHEN** l'administradora fa `GET /api/admin/events` amb un JWT vàlid i rol `admin`
- **THEN** la resposta té status 200
- **THEN** el cos conté un array de 3 elements
- **THEN** l'element amb `publicat: false` és inclòs a la resposta

#### Scenario: Rebutjat sense autenticació

- **GIVEN** que no s'envia cap header `Authorization`
- **WHEN** es fa `GET /api/admin/events`
- **THEN** la resposta té status 401

#### Scenario: Rebutjat amb rol comprador

- **GIVEN** un usuari autenticat amb rol `comprador`
- **WHEN** fa `GET /api/admin/events` amb el seu JWT vàlid
- **THEN** la resposta té status 403

#### Scenario: Testabilitat del controlador admin

- **GIVEN** un entorn de test Laravel amb BD de test i les migrations aplicades
- **WHEN** s'executa el test unitari/de feature de `AdminEventController@index`
- **THEN** tots els tests passen sense errors

### Requirement: Middleware de backend EnsureAdmin protegeix totes les rutes /api/admin/*

El sistema SHALL disposar d'un middleware Laravel `EnsureAdmin` a `app/Http/Middleware/EnsureAdmin.php` que comprovi que `$request->user()->role === 'admin'`. Si no, SHALL retornar una resposta JSON `{ "message": "Forbidden" }` amb status 403. El middleware SHALL estar registrat com a middleware nomenat `admin` i aplicat a tot el grup de rutes `/api/admin` (juntament amb `auth:sanctum`).

#### Scenario: Accés permès amb rol admin

- **GIVEN** un usuari autenticat amb `role = 'admin'`
- **WHEN** fa una petició a qualsevol ruta del grup `/api/admin/*`
- **THEN** el middleware deixa passar la petició al controlador

#### Scenario: Accés denegat amb rol comprador

- **GIVEN** un usuari autenticat amb `role = 'comprador'`
- **WHEN** fa una petició a qualsevol ruta del grup `/api/admin/*`
- **THEN** el middleware retorna 403 amb `{ "message": "Forbidden" }`

#### Scenario: Accés denegat sense autenticació

- **GIVEN** que no hi ha usuari autenticat (`auth:sanctum` actua primer)
- **WHEN** es fa una petició a `/api/admin/events` sense JWT
- **THEN** la resposta és 401 (retornada per `auth:sanctum` abans que `EnsureAdmin`)

#### Scenario: Testabilitat del middleware EnsureAdmin

- **GIVEN** un entorn de test Laravel
- **WHEN** s'executa el test unitari de `EnsureAdmin`
- **THEN** el middleware retorna 403 per a usuaris no admin i deixa passar els admin

### Requirement: Pàgina /admin/events mostra taula d'esdeveniments amb badge d'estat i accions

El sistema SHALL disposar d'una pàgina Nuxt 3 a `pages/admin/events.vue` amb `ssr: false` i `middleware: 'admin'` que mostri una taula amb les columnes: Nom, Data, Hora, Recinte, Estat, Seients (disponibles/reservats/venuts) i Accions (Editar, Eliminar, Publicar/Despublicar). L'estat SHALL mostrar-se com un badge visual: verd per a "Publicat" i gris/groc per a "Esborrany".

#### Scenario: Distinció visual d'estat

- **GIVEN** que la pàgina `/admin/events` ha carregat
- **WHEN** hi ha un event amb `publicat: false`
- **THEN** es mostra amb un badge "Esborrany" visualment diferent al badge "Publicat"

#### Scenario: Taula renderitzada amb tots els events

- **GIVEN** que l'API retorna 3 events (2 publicats, 1 esborrany)
- **WHEN** la pàgina ha carregat
- **THEN** la taula mostra 3 files, una per cada event

#### Scenario: La ruta no exposa dades en el HTML inicial (SSR desactivat)

- **GIVEN** que es fa una petició HTTP directa a `/admin/events` des d'un crawler
- **WHEN** s'analitza el HTML retornat pel servidor
- **THEN** el HTML no conté dades d'events (la renderització és purament CSR)

#### Scenario: Testabilitat de la pàgina admin/events

- **GIVEN** un entorn de test Nuxt amb `@nuxt/test-utils` i Vitest
- **WHEN** s'executa `pnpm test` al workspace `frontend`
- **THEN** tots els tests de `pages/admin/events.spec.ts` passen sense errors

## ADDED Requirements

### Requirement: Endpoint retorna dades de l'event i els seients agrupats per fila

El sistema SHALL proporcionar un endpoint públic `GET /api/events/{slug}/seats` que retorni la informació de l'event i la llista de seients agrupats per fila, sense requerir autenticació.

#### Scenario: Consulta amb slug vàlid i event publicat

- **GIVEN** que existeix l'event `dune-4k-dolby-2026` amb estat `publicat` i 200 seients (10 files × 20 seients)
- **WHEN** es fa `GET /api/events/dune-4k-dolby-2026/seats` sense cap capçalera d'autenticació
- **THEN** el servidor retorna `200 OK` amb el cos `{ "event": { "id", "nom", "slug", "data", "recinte" }, "categories": [...], "files": { "A": [...seients...], "B": [...] } }`

#### Scenario: Consulta amb slug inexistent

- **GIVEN** que no existeix cap event amb slug `no-existeix`
- **WHEN** es fa `GET /api/events/no-existeix/seats`
- **THEN** el servidor retorna `404 Not Found` amb `{ "message": "Event no trobat" }`

#### Scenario: Consulta d'event en estat esborrany

- **GIVEN** que existeix l'event `event-esborrany` amb estat `esborrany`
- **WHEN** un visitant sense autenticació fa `GET /api/events/event-esborrany/seats`
- **THEN** el servidor retorna `404 Not Found`

#### Scenario: Testabilitat — es pot verificar l'estructura de la resposta

- **WHEN** s'executa el test `EventSeatsControllerTest::test_returns_seats_grouped_by_row`
- **THEN** la resposta inclou les claus `event`, `categories` i `files`, i el total de seients coincideix amb els registres de BD

---

### Requirement: Els seients de la resposta inclouen ID, estat, fila, número i preu

El sistema SHALL retornar per cada seient els camps `id`, `estat` (DISPONIBLE / RESERVAT / VENUT), `fila`, `numero`, `id_categoria` i `preu`.

#### Scenario: Seient disponible

- **GIVEN** un seient amb estat `DISPONIBLE`
- **WHEN** s'inclou a la resposta de l'endpoint
- **THEN** el camp `estat` val `"DISPONIBLE"` i el seient figura dins la seva fila corresponent

#### Scenario: Seient reservat per un altre usuari

- **GIVEN** un seient amb estat `RESERVAT` (reserva activa d'un altre usuari)
- **WHEN** s'inclou a la resposta
- **THEN** el camp `estat` val `"RESERVAT"` sense revelar qui el té reservat

#### Scenario: Seient venut

- **GIVEN** un seient amb estat `VENUT`
- **WHEN** s'inclou a la resposta
- **THEN** el camp `estat` val `"VENUT"`

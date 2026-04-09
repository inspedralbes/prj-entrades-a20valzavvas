## MODIFIED Requirements

### Requirement: Endpoint PUT /api/admin/events/:id actualitza les metadades d'un event existent

El sistema SHALL exposar `PUT /api/admin/events/:id` al backend Laravel, protegit per `auth:sanctum` i el middleware `admin`. L'endpoint SHALL acceptar un body parcial amb els camps `name`, `slug`, `description`, `date`, `venue` i `published`. La resposta SHALL ser `200 OK` amb el cos de l'event actualitzat. L'endpoint SHALL retornar `404 Not Found` si l'event no existeix.

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

#### Scenario: Actualització exitosa del camp published

- **GIVEN** que l'administradora envia el payload `{ "published": true }` amb token vàlid
- **WHEN** s'envia `PUT /api/admin/events/:id`
- **THEN** la resposta té status `200 OK`
- **THEN** el cos JSON conté `"published": true`
- **THEN** l'event a la BD té `published = true`

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

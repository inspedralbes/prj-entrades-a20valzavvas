# Capability: laravel-service-scaffold

## Purpose

Defineix els requisits per al scaffold base del Laravel Service: estructura del projecte, configuració de base de dades, health check, CORS, estructura de rutes i Dockerfile de desenvolupament.

## Requirements

### Requirement: Projecte Laravel base a src/backend/laravel-service/

El sistema SHALL disposar d'un projecte Laravel creat via `composer create-project laravel/laravel` al directori `src/backend/laravel-service/` amb `laravel/sanctum` instal·lat i `config/database.php` configurat per a PostgreSQL.

#### Scenario: Directori i dependències existeixen

- **WHEN** s'inspeccioneu el repositori
- **THEN** existeix `src/backend/laravel-service/composer.json` amb `laravel/framework` i `laravel/sanctum` com a dependències
- **THEN** `config/database.php` defineix el driver `pgsql` com a connexió per defecte

#### Scenario: Variables de BD llegides de .env

- **GIVEN** que el fitxer `.env` conté `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`
- **WHEN** s'inicia el servei Laravel
- **THEN** la connexió a PostgreSQL s'estableix sense credencials hardcoded al codi

### Requirement: Health check endpoint GET /api/health

El sistema SHALL exposar `GET /api/health` que retorni HTTP 200 amb el cos `{ "status": "ok" }` sense requerir autenticació, per permetre el Docker healthcheck.

#### Scenario: Resposta correcta del health check

- **GIVEN** que el servei Laravel està en execució
- **WHEN** s'envia `GET http://localhost:8000/api/health`
- **THEN** la resposta té codi HTTP 200
- **THEN** el cos de la resposta és `{ "status": "ok" }` en format JSON

#### Scenario: Health check no requereix autenticació

- **GIVEN** que no s'envia cap token d'autenticació
- **WHEN** s'envia `GET /api/health`
- **THEN** la resposta té codi HTTP 200 (no 401 ni 403)

### Requirement: CORS configurat per permetre peticions del frontend

El sistema SHALL tenir CORS configurat per acceptar peticions des del frontend (servei `frontend` a port 3000 o via Nginx), incloent els mètodes HTTP necessaris i les capçaleres `Authorization` i `Content-Type`.

#### Scenario: Peticions cross-origin acceptades

- **GIVEN** que la configuració CORS permet l'origen del frontend
- **WHEN** el frontend envia una petició a qualsevol endpoint de `/api/*`
- **THEN** la resposta inclou la capçalera `Access-Control-Allow-Origin` amb el valor correcte
- **THEN** no es retorna cap error CORS (no 403 per CORS)

### Requirement: Estructura de rutes api.php i internal.php

El sistema SHALL disposar de `routes/api.php` per a endpoints públics i autenticats, i de `routes/internal.php` per a endpoints de comunicació interna entre serveis Docker, registrat al `RouteServiceProvider`.

#### Scenario: Fitxers de rutes existeixen

- **WHEN** s'inspeccioneu el repositori
- **THEN** existeix `src/backend/laravel-service/routes/api.php`
- **THEN** existeix `src/backend/laravel-service/routes/internal.php`

#### Scenario: Ruta health check registrada a api.php

- **WHEN** s'executa `php artisan route:list`
- **THEN** apareix la ruta `GET /api/health` sense middleware d'autenticació

### Requirement: Dockerfile de desenvolupament per al laravel-service

El sistema SHALL disposar d'un `Dockerfile` a `src/backend/laravel-service/` que construeixi una imatge de desenvolupament amb PHP 8.2+, les extensions necessàries per a PostgreSQL (`pdo_pgsql`) i que arranqui el servei via `php artisan serve --host=0.0.0.0 --port=8000`.

#### Scenario: Build del Dockerfile sense errors

- **WHEN** s'executa `docker build -t laravel-service ./src/backend/laravel-service`
- **THEN** la imatge es construeix sense errors
- **THEN** la imatge conté PHP 8.2+ amb l'extensió `pdo_pgsql` disponible

#### Scenario: Contenidor arrenca i exposa el port 8000

- **GIVEN** que les variables d'entorn de BD i APP_KEY estan configurades
- **WHEN** s'executa `docker run -p 8000:8000 laravel-service`
- **THEN** el servei `php artisan serve` arrenca al port 8000
- **THEN** `GET http://localhost:8000/api/health` retorna HTTP 200

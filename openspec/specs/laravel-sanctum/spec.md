# Capability: laravel-sanctum

## Purpose

Defineix els requisits per a la instal·lació i configuració de Laravel Sanctum al Laravel Service: instal·lació del paquet, publicació de configuració, migració de la taula `personal_access_tokens`, registre del middleware i testabilitat.

## Requirements

### Requirement: Sanctum instal·lat i publicat al Laravel Service

El sistema SHALL tenir `laravel/sanctum` instal·lat i la seva configuració publicada a `config/sanctum.php`, amb el TTL del token i el secret configurable via variables d'entorn.

#### Scenario: Fitxer de configuració publicat

- **WHEN** s'inspeccioneu el repositori
- **THEN** existeix el fitxer `src/backend/laravel-service/config/sanctum.php`
- **THEN** `sanctum.php` conté la clau `expiration` llegida de `env('SANCTUM_TOKEN_TTL')`
- **THEN** `sanctum.php` conté la clau `secret` llegida de `env('JWT_SECRET')`

#### Scenario: Variables d'entorn documentades a .env.example

- **WHEN** s'inspeccioneu el fitxer `.env.example` del Laravel Service
- **THEN** existeix l'entrada `JWT_SECRET=` (sense valor per defecte hardcoded)
- **THEN** existeix l'entrada `SANCTUM_TOKEN_TTL=60` (valor orientatiu en minuts)

#### Scenario: JWT_SECRET mai hardcoded

- **WHEN** s'executa una cerca de cadenes literals que semblin un secret al repositori
- **THEN** no existeix cap fitxer de codi font amb `JWT_SECRET` assignat a una cadena literal (fora de `.env.example`)

### Requirement: Migració personal_access_tokens executada

El sistema SHALL disposar de la taula `personal_access_tokens` a la base de dades, creada per la migració inclosa per Sanctum.

#### Scenario: Taula present després de migrate

- **GIVEN** que `JWT_SECRET` i les variables de BD existeixen al `.env`
- **WHEN** s'executa `php artisan migrate`
- **THEN** la taula `personal_access_tokens` existeix a la BD de PostgreSQL

#### Scenario: Migració de Sanctum inclosa al directori de migracions

- **WHEN** s'inspeccioneu el directori `database/migrations/`
- **THEN** existeix un fitxer de migració amb nom que conté `create_personal_access_tokens_table`

### Requirement: Middleware de Sanctum registrat

El sistema SHALL tenir el middleware `EnsureFrontendRequestsAreStateful` de Sanctum registrat al grup `api` de l'aplicació Laravel.

#### Scenario: Middleware registrat a l'aplicació

- **WHEN** s'executa `php artisan route:list` per a una ruta protegida
- **THEN** la ruta mostra el middleware de Sanctum aplicat

#### Scenario: Ruta health check sense autenticació Sanctum

- **GIVEN** que no s'envia cap token d'autenticació
- **WHEN** s'envia `GET /api/health`
- **THEN** la resposta té codi HTTP 200 (Sanctum no bloqueja rutes públiques)

### Requirement: Testabilitat de la configuració de Sanctum

El sistema SHALL poder verificar la configuració de Sanctum mitjançant un test d'integració que comprovi que `config('sanctum.secret')` retorna el valor de `JWT_SECRET`.

#### Scenario: Test verifica accés al secret via config

- **GIVEN** que `JWT_SECRET=test-secret-value` és al `.env` de test
- **WHEN** s'executa el test que llegeix `config('sanctum.secret')`
- **THEN** el test retorna `test-secret-value` sense errors

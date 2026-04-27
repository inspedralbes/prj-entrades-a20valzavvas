# Capability: laravel-deploy-entrypoint

## Purpose

Defineix els requisits per a l'script `docker-entrypoint.sh` del `laravel-service`, que executa les migracions Eloquent automàticament abans d'arrencar el servidor, garantint que el contenidor falli ràpidament si les migracions no s'apliquen correctament.

## Requirements

### Requirement: Script docker-entrypoint.sh executa migracions Eloquent abans d'arrencar el servidor

El sistema SHALL disposar d'un fitxer `backend/laravel-service/docker-entrypoint.sh` que executi, en ordre: `php artisan migrate --force` i, si aquest acaba amb exit code 0, `php artisan serve --host=0.0.0.0 --port=8000`. Si `php artisan migrate --force` retorna un exit code diferent de 0, l'script ha de sortir immediatament amb el mateix codi d'error sense arrencar el servidor.

#### Scenario: Migració correcta — servidor arrenca

- **GIVEN** que la BD és accessible i no hi ha migracions amb error
- **WHEN** el contenidor `laravel-service` s'inicia
- **THEN** `php artisan migrate --force` s'executa i finalitza amb exit code 0
- **THEN** `php artisan serve --host=0.0.0.0 --port=8000` arrenca
- **THEN** `GET http://localhost:8000/api/health` retorna HTTP 200

#### Scenario: BD no accessible — contenidor falla ràpidament

- **GIVEN** que la BD no és accessible en el moment d'iniciar el contenidor
- **WHEN** el contenidor `laravel-service` s'inicia
- **THEN** `php artisan migrate --force` falla amb exit code diferent de 0
- **THEN** el contenidor s'atura sense arrencar `php artisan serve`

#### Scenario: Migració amb error — contenidor falla ràpidament

- **GIVEN** que hi ha una migració Eloquent amb error sintàctic o de BD
- **WHEN** el contenidor `laravel-service` s'inicia
- **THEN** `php artisan migrate --force` falla
- **THEN** el contenidor s'atura sense arrencar `php artisan serve`

#### Scenario: Testabilitat — script executable localment

- **WHEN** s'inspeccioneu el fitxer `backend/laravel-service/docker-entrypoint.sh`
- **THEN** el fitxer existeix al repositori amb permisos d'execució (`chmod +x`)
- **THEN** el fitxer conté la crida a `php artisan migrate --force` abans de `php artisan serve`

### Requirement: No executa seeders en producció

El sistema SHALL garantir que l'script `docker-entrypoint.sh` no inclou cap crida a `php artisan db:seed` ni a `php artisan migrate:fresh`.

#### Scenario: Script no conté seed

- **WHEN** s'inspeccioneu el contingut de `backend/laravel-service/docker-entrypoint.sh`
- **THEN** no existeix cap crida a `php artisan db:seed`
- **THEN** no existeix cap crida a `php artisan migrate:fresh`

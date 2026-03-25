## Why

El projecte necessita un Laravel Service com a nou servei responsable de l'accés a la BD, l'autenticació i els endpoints REST. Sense el scaffold base i el seu `Dockerfile`, el servei no es pot afegir al `docker-compose.yml` ni es pot iniciar el desenvolupament dels endpoints d'autenticació (PE-48, PE-49). Aquesta història també tanca el gap de PE-11 afegint el servei `laravel-service` al compose existent. Jira: [PE-54](https://lightweight-fitness.atlassian.net/browse/PE-54).

## What Changes

- Nou directori `backend/laravel-service/` amb el projecte Laravel base creat via `composer create-project`
- `laravel/sanctum` instal·lat i configurat
- `config/database.php` configurat per a PostgreSQL; totes les variables llegides de `.env`
- Endpoint `GET /api/health → 200 { status: "ok" }` per al Docker healthcheck
- CORS configurat per permetre peticions des del frontend (via Nginx)
- `routes/api.php` (públiques + auth) i `routes/internal.php` (xarxa Docker interna)
- Nou `backend/laravel-service/Dockerfile` de desenvolupament
- Servei `laravel-service` afegit al `docker-compose.yml` existent (port 8000, depèn de `db` healthy)
- `JWT_SECRET` i `LARAVEL_APP_KEY` afegits al `.env.example`

## Capabilities

### New Capabilities

- `laravel-service-scaffold`: Projecte Laravel base amb Sanctum, health check, CORS, estructura de rutes i Dockerfile de desenvolupament

### Modified Capabilities

- `local-dev-environment`: El `docker-compose.yml` passa de 3 serveis (`db`, `backend`, `frontend`) a 4 (`db`, `backend`, `frontend`, `laravel-service`); `.env.example` s'amplia amb `JWT_SECRET` i `LARAVEL_APP_KEY`

## Impact

- **Fitxers nous**: `backend/laravel-service/` (tot el projecte Laravel), `backend/laravel-service/Dockerfile`
- **Fitxers modificats**: `docker-compose.yml` (nou servei), `.env.example` (noves variables)
- **Dependències externes**: PHP 8.x + Composer (dins del contenidor Docker), `laravel/sanctum`
- **Sense efectes cross-mòdul** sobre NestJS, frontend o shared en aquesta fase
- **Testing**: El health check `GET /api/health` és verificable amb `curl` en el criteri d'acceptació; no requereix tests unitaris de PHP en aquest scaffold (les capes de servei vindran en PE-12, PE-48, PE-49)

## Why

Quan el contenidor `laravel-service` s'inicia en producció sense executar les migracions Eloquent pendents, el servidor falla en arrancar perquè l'esquema de BD no coincideix amb el codi. Cal automatitzar `php artisan migrate --force` com a pas previ a l'inici del servidor per garantir la consistència BD-codi en cada desplegament. Jira: [PE-41](https://lightweight-fitness.atlassian.net/browse/PE-41).

## What Changes

- S'afegeix un `docker-entrypoint.sh` al contenidor `laravel-service` que executa, en ordre: `php artisan migrate --force` i després `php artisan serve --host=0.0.0.0 --port=8000`.
- El `Dockerfile` de `laravel-service` actualitza la instrucció `ENTRYPOINT` per apuntar a l'script.
- Si `php artisan migrate --force` falla (BD no accessible o error de migració), el contenidor no arrenca (comportament fail-fast).
- No s'executa el seed en producció.

## Capabilities

### New Capabilities

- `laravel-deploy-entrypoint`: Script d'entrada Docker per al servei Laravel que garanteix l'execució automàtica de les migracions Eloquent abans d'arrencar el servidor en cada desplegament.

### Modified Capabilities

- `laravel-service-scaffold`: El Dockerfile de producció del `laravel-service` ha d'incloure la instrucció `ENTRYPOINT` actualitzada per apuntar al nou script.

## Impact

- **Fitxers afectats**: `backend/laravel-service/docker-entrypoint.sh` (nou), `backend/laravel-service/Dockerfile` (modificat).
- **Mòduls**: No afecta cap mòdul NestJS ni Nuxt. Canvi estrictament en la capa d'infraestructura Docker del `laravel-service`.
- **Dependències**: Requereix que el `Dockerfile` de producció del `laravel-service` existeixi (US-08-05 / `laravel-service-scaffold`).
- **No-goals**: Backup de BD pre-migració, execució de seeders en producció.

## Why

El Laravel Service necessita un mecanisme d'autenticació per a la seva API. Laravel Sanctum amb JWT proporcionarà tokens que podran ser validats tant pel servei Laravel com pel Node Service sense necessitat de consultar la base de dades en cada petició, usant un `JWT_SECRET` compartit.

Jira: [PE-47](https://lightweight-fitness.atlassian.net/browse/PE-47)

## What Changes

- Instal·lació de `laravel/sanctum` via Composer al Laravel Service
- Configuració de `sanctum.php` amb el TTL del token (via env)
- El model `User` incorpora el trait `HasApiTokens`
- `JWT_SECRET` definit a `.env` i accessible via `config('sanctum.secret')`
- Migració de la taula `personal_access_tokens` (inclosa per Sanctum)
- Documentació del `JWT_SECRET` a `.env.example`

## Capabilities

### New Capabilities

- `laravel-sanctum`: Configuració de Laravel Sanctum per emetre i validar tokens JWT al Laravel Service, amb secret compartit configurable via variables d'entorn.

### Modified Capabilities

- `laravel-service-scaffold`: S'afegeix Sanctum com a dependència i es modifica el model `User` per incloure `HasApiTokens`.

## Impact

- **Laravel Service** (`backend-laravel/`): instal·lació de paquet, publicació de config, modificació del model `User`
- **`.env` / `.env.example`**: nova variable `JWT_SECRET` i `SANCTUM_TOKEN_TTL`
- **Node Service**: ha d'usar el mateix `JWT_SECRET` per validar tokens (sense canvis de codi en aquest US, documentació)
- **Base de dades**: nova taula `personal_access_tokens` via migració de Sanctum

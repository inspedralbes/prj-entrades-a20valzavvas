## Why

El CI actual valida únicament els workspaces JavaScript (frontend, node-service, shared) però ignora completament el `laravel-service`. Cap canvi al codi PHP, cap migració trencada ni cap error de lint arriba a ser detectat en merge. A més, `phpunit.xml` i `.env.example` apunten a SQLite, però producció és PostgreSQL — els check constraints i les FK no es validen en els tests locals. Jira: PE-12 (context).

## What Changes

- **BREAKING** — `phpunit.xml` canvia de `DB_CONNECTION=sqlite / :memory:` a PostgreSQL, trencant tests existents que assumeixin SQLite (cap en aquest moment).
- Afegits steps de PHP al `ci.yml`: setup-php, composer install, pint, php artisan migrate, php artisan test.
- `phpunit.xml` apunta al PostgreSQL del service container de CI (127.0.0.1:5432).
- `.env.example` del laravel-service actualitzat per documentar PostgreSQL com a BD correcta.

## Capabilities

### New Capabilities

_(cap — és una modificació de capacitats existents)_

### Modified Capabilities

- `ci-pipeline`: S'afegeix validació PHP (lint, migrate, tests) al workflow de CI. Els requisits de "tests de backend s'executen amb PostgreSQL" s'amplien per incloure el laravel-service a més del node-service.

## Impact

- **`ci.yml`**: nous steps PHP després del setup de Node; el service container de PostgreSQL ja existent es reutilitza.
- **`src/backend/laravel-service/phpunit.xml`**: canvi de driver de BD de sqlite a pgsql.
- **`src/backend/laravel-service/.env.example`**: correcció del driver i credencials de BD.
- **Temps de CI**: s'estima un increment de ~60-90s per composer install + PHP steps (primer run sense cache).
- **Cap impacte** en frontend, shared ni node-service.

## Context

El monorepo té dos backends: `node-service` (NestJS) i `laravel-service` (PHP/Laravel). El CI actual cobreix el primer però no el segon. El workflow usa un service container de PostgreSQL 16 que ja existia (per a futures migracions de Prisma, ara comentades) i que es reutilitzarà per a Laravel sense cost addicional.

La BD de producció és PostgreSQL. `phpunit.xml` usa SQLite in-memory per defecte (scaffold de Laravel), però els check constraints afegits a `users.role` i `seats.estat` requereixen PostgreSQL — SQLite ignora `ADD CONSTRAINT` via `ALTER TABLE`. La divergència produeix falsa seguretat: els tests passen localment però no validen l'esquema real.

## Goals / Non-Goals

**Goals:**
- PHP validat en CI (lint, migrate, tests) en cada PR.
- Tests de Laravel contra PostgreSQL real, idèntic al driver de producció.
- `.env.example` documenta correctament la BD del projecte.

**Non-Goals:**
- Cache de Composer en CI (desitjable però fora d'abast d'aquest US).
- Tests de feature de Laravel (cap test de negoci escrit encara — EP-07).
- Separació del CI en jobs paral·lels (tot en un job únic per simplicitat).

## Decisions

### D1 — Reutilitzar el service container de PostgreSQL existent
**Decisió**: El workflow ja té `services.postgres` (PostgreSQL 16, port 5432). S'apunta `phpunit.xml` a `127.0.0.1:5432` amb les mateixes credencials.
**Alternativa**: Crear un segon service container o usar SQLite amb migracions condicionals per driver.
**Raó**: Fidelitat màxima amb producció sense cost addicional. Un sol postgres serveix tant Node com PHP.

### D2 — `shivammathur/setup-php@v2` per a PHP 8.3
**Decisió**: Usar l'action estàndard de la comunitat per instal·lar PHP 8.3 amb les extensions `pdo_pgsql` i `mbstring`.
**Alternativa**: Instal·lar PHP via `apt-get` manualment.
**Raó**: `setup-php` gestiona versions, extensions i cache de manera declarativa. És l'estàndard de facto per a workflows PHP a GitHub Actions.

### D3 — `working-directory` explícit per als steps PHP
**Decisió**: Cada step de PHP porta `working-directory: src/backend/laravel-service`.
**Alternativa**: Afegir scripts PHP al `package.json` raíz.
**Raó**: El monorepo és pnpm workspaces; barrejar scripts PHP als scripts raíz és inconsistent. L'aïllament de working-directory és més clar.

### D4 — `APP_KEY` generat en CI via `php artisan key:generate`
**Decisió**: El step de setup de Laravel executa `php artisan key:generate --force` per obtenir una `APP_KEY` ephemeral vàlida per a CI.
**Alternativa**: Usar un secret de GitHub `LARAVEL_APP_KEY`.
**Raó**: La `APP_KEY` de CI no necessita ser estable ni secreta (és efímera per a tests). Generar-la és més simple que gestionar un secret addicional.

### D5 — `RefreshDatabase` trait per aïllar tests contra PostgreSQL
**Decisió**: El `TestCase` base del laravel-service ha d'usar `RefreshDatabase` per fer `migrate:fresh` en cada suite.
**Raó**: Garanteix aïllament total entre runs de test sense dependre de l'ordre d'execució. Acceptable per al volum de tests actual (baix).

## Risks / Trade-offs

- **[Risc] Temps de CI s'incrementa** → Composer install sense cache pot afegir 60-90s. Mitigació: acceptable per al volum actual; es pot afegir cache de Composer en un US posterior.
- **[Risc] `php artisan key:generate` modifica `.env`** → Cal assegurar que el step no falla si no hi ha `.env`. Mitigació: usar `--force` i crear un `.env` mínim amb les variables de BD al step de setup.
- **[Trade-off] Un sol job vs jobs paral·lels** → Un job és més simple però més lent (Node + PHP seqüencials). Acceptable ara; quan el CI superi 5 min es pot paralelitzar.

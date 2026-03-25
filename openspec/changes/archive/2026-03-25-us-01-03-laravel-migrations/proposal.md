## Why

El backend ha migrat de NestJS/Prisma a Laravel (PHP), de manera que l'esquema de la BD s'ha de definir amb **Laravel Migrations i Eloquent** en lloc de Prisma. Calen les migrations completes —incloent la taula `users` i substituint `session_token` per `user_id`— per poder executar `php artisan migrate` i tenir la BD preparada per a tots els serveis. Jira: [PE-12](https://lightweight-fitness.atlassian.net/browse/PE-12)

## What Changes

- **BREAKING** — S'elimina qualsevol ús de Prisma per al `laravel-service`; l'accés a la BD és responsabilitat exclusiva de Laravel.
- Nous fitxers de migració a `backend/laravel-service/database/migrations/` per a les entitats: `users`, `events`, `price_categories`, `seats`, `reservations`, `orders`, `order_items`.
- `Reservation.session_token` → **eliminat**; substituït per `user_id` (FK → `users`).
- `Order.session_token` → **eliminat**; substituït per `user_id` (FK → `users`).
- Nous Models Eloquent a `backend/laravel-service/app/Models/` amb relacions (`hasMany`, `belongsTo`, etc.).
- Enum `SeatStatus` implementat com a string amb check constraint (PostgreSQL).
- Index a `reservations.expires_at` per al cron d'expiració.
- `events.slug` amb constraint `unique`.
- Totes les PKs són UUID generats amb `Str::uuid()`.

## Capabilities

### New Capabilities

- `laravel-db-schema`: Migrations Laravel i models Eloquent per a totes les entitats del domini (users, events, price_categories, seats, reservations, orders, order_items) amb relacions, enums i índexs necessaris.

### Modified Capabilities

- `laravel-service-scaffold`: El scaffold existent rep nous directoris `database/migrations/` i `app/Models/`; no canvia el comportament observable però sí l'estructura de fitxers esperada.

## Impact

- **Mòduls afectats**: tot el `backend/laravel-service` (models, migrations, seeders futurs).
- **BD**: PostgreSQL 16 — les taules es creen via `php artisan migrate` al contenidor `laravel-service`.
- **Dependències**: requereix US-01-06 (scaffold Laravel operatiu) i US-01-02 (Docker + PostgreSQL accessible).
- **Shared types**: `SeatStatus` enum de TypeScript a `shared/types/seat.types.ts` ha de mantenir-se alineat amb els valors de la BD (`DISPONIBLE`, `RESERVAT`, `VENUT`).
- **Testing**: no hi ha lògica de negoci als models en aquest US, però s'han d'afegir tests de factories/migrations si s'introdueixen seeders en futures US. El criteri d'acceptació és l'execució exitosa de `php artisan migrate` i la consulta Eloquent amb relacions.

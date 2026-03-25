## ADDED Requirements

### Requirement: Migrations Laravel per a totes les entitats del domini

El sistema SHALL disposar de fitxers de migració Laravel a `backend/laravel-service/database/migrations/` per a les entitats `users`, `events`, `price_categories`, `seats`, `reservations`, `orders` i `order_items`, aplicables amb `php artisan migrate` sense errors.

#### Scenario: Migració exitosa des de zero

- **GIVEN** que PostgreSQL és accessible i `.env` conté `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`
- **WHEN** s'executa `php artisan migrate` al contenidor `laravel-service`
- **THEN** totes les taules es creen sense errors
- **THEN** les taules existents a la BD són: `users`, `events`, `price_categories`, `seats`, `reservations`, `orders`, `order_items`, `migrations`

#### Scenario: Migrations idempotents

- **GIVEN** que les migrations ja s'han aplicat
- **WHEN** s'executa `php artisan migrate` una segona vegada
- **THEN** la comanda informa `Nothing to migrate` i no genera errors

#### Scenario: Rollback de les migrations

- **GIVEN** que les migrations s'han aplicat
- **WHEN** s'executa `php artisan migrate:rollback`
- **THEN** totes les taules creades per les migrations del batch actual s'eliminen sense errors de FK

#### Scenario: Testability — verificar estructura de taules

- **GIVEN** que les migrations s'han aplicat en un entorn de test
- **WHEN** s'executa `php artisan migrate --env=testing`
- **THEN** `Schema::hasTable('seats')` retorna `true`
- **THEN** `Schema::hasColumn('seats', 'estat')` retorna `true`

### Requirement: Taula `users` amb camps d'autenticació i rol

La taula `users` SHALL tenir les columnes: `id` (UUID PK), `name` (string), `email` (string, unique), `password` (string, hashed), `role` (string, valors: `comprador` | `admin`), `created_at`, `updated_at`.

#### Scenario: Email únic

- **GIVEN** que ja existeix un usuari amb email `test@example.com`
- **WHEN** s'intenta inserir un segon registre amb el mateix email
- **THEN** PostgreSQL llença un error de constraint `unique_violation`

#### Scenario: PK és UUID

- **GIVEN** que s'insereix un nou usuari
- **WHEN** es consulta `SELECT id FROM users LIMIT 1`
- **THEN** el valor de `id` és un UUID v4 vàlid (format `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`)

#### Scenario: Rol limitat a valors vàlids

- **GIVEN** que s'intenta inserir un usuari amb `role = 'superadmin'`
- **WHEN** s'executa la inserció
- **THEN** PostgreSQL retorna un error de check constraint

### Requirement: Enum `SeatStatus` com a check constraint a la taula `seats`

La columna `estat` de la taula `seats` SHALL ser de tipus string amb un check constraint PostgreSQL que limiti els valors a `DISPONIBLE`, `RESERVAT` i `VENUT`. El valor per defecte SHALL ser `DISPONIBLE`.

#### Scenario: Valor per defecte és DISPONIBLE

- **GIVEN** que s'insereix un seat sense especificar `estat`
- **WHEN** es consulta el registre inserit
- **THEN** `estat` té el valor `DISPONIBLE`

#### Scenario: Valor invàlid rebutjat

- **GIVEN** que s'intenta inserir un seat amb `estat = 'OCUPAT'`
- **WHEN** s'executa la inserció
- **THEN** PostgreSQL retorna un error de check constraint

#### Scenario: Valors vàlids acceptats

- **WHEN** s'insereix un seat amb `estat = 'RESERVAT'`
- **THEN** el registre es crea correctament
- **WHEN** s'insereix un seat amb `estat = 'VENUT'`
- **THEN** el registre es crea correctament

### Requirement: Substitució de `session_token` per `user_id` a `reservations` i `orders`

Les taules `reservations` i `orders` SHALL tenir una columna `user_id` (UUID, FK → `users.id`) en lloc de `session_token`. La FK SHALL tenir `onDelete('cascade')`.

#### Scenario: FK constraint actiu a reservations

- **GIVEN** que existeix un usuari amb `id = UUID_A`
- **WHEN** s'insereix una reserva amb `user_id = UUID_A`
- **THEN** la reserva es crea correctament
- **WHEN** s'elimina l'usuari `UUID_A`
- **THEN** les reserves associades s'eliminen en cascada

#### Scenario: `session_token` absent

- **WHEN** s'inspeccioneu l'esquema de la taula `reservations`
- **THEN** la columna `session_token` NO existeix
- **WHEN** s'inspeccioneu l'esquema de la taula `orders`
- **THEN** la columna `session_token` NO existeix

### Requirement: Index a `reservations.expires_at` i unique a `events.slug`

La columna `reservations.expires_at` SHALL tenir un índex per optimitzar les consultes del cron d'expiració. La columna `events.slug` SHALL tenir un constraint `unique`.

#### Scenario: Slug duplicat rebutjat

- **GIVEN** que existeix un event amb `slug = 'concert-2025'`
- **WHEN** s'intenta crear un altre event amb el mateix slug
- **THEN** PostgreSQL retorna un error de constraint `unique_violation`

#### Scenario: Index a expires_at present

- **WHEN** s'executa `SELECT indexname FROM pg_indexes WHERE tablename = 'reservations'`
- **THEN** el resultat inclou un índex sobre la columna `expires_at`

### Requirement: Models Eloquent amb relacions definides

El sistema SHALL disposar de models Eloquent a `backend/laravel-service/app/Models/` per a cada entitat, amb les relacions declarades: `Event hasMany Seat`, `Event hasMany PriceCategory`, `Seat belongsTo Event`, `Seat belongsTo PriceCategory`, `Reservation belongsTo Seat`, `Reservation belongsTo User`, `Order belongsTo User`, `Order hasMany OrderItem`, `OrderItem belongsTo Order`, `OrderItem belongsTo Seat`.

#### Scenario: Eager loading Event amb relacions

- **GIVEN** que existeix un event amb seats i price_categories
- **WHEN** s'executa `Event::with(['seats', 'priceCategories'])->first()`
- **THEN** Eloquent retorna l'event amb les col·leccions `seats` i `priceCategories` correctament populades sense queries N+1

#### Scenario: UUID generat automàticament al crear model

- **GIVEN** que es crea un nou `Event` via Eloquent sense especificar `id`
- **WHEN** es desa el model amb `$event->save()`
- **THEN** `$event->id` conté un UUID v4 vàlid

#### Scenario: Testability — relacions verificables amb Pest/PHPUnit

- **GIVEN** que s'usa una BD de test amb les migrations aplicades
- **WHEN** es crea un `Event` amb 3 `Seat` associats
- **THEN** `$event->seats->count()` retorna 3

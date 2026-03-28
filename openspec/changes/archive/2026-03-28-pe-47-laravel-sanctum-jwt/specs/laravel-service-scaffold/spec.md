## MODIFIED Requirements

### Requirement: Projecte Laravel base a src/backend/laravel-service/

El sistema SHALL disposar d'un projecte Laravel creat via `composer create-project laravel/laravel` al directori `src/backend/laravel-service/` amb `laravel/sanctum` instal·lat, `config/database.php` configurat per a PostgreSQL, i el model `User` amb el trait `HasApiTokens` per poder emetre tokens d'API.

#### Scenario: Directori i dependències existeixen

- **WHEN** s'inspeccioneu el repositori
- **THEN** existeix `src/backend/laravel-service/composer.json` amb `laravel/framework` i `laravel/sanctum` com a dependències
- **THEN** `config/database.php` defineix el driver `pgsql` com a connexió per defecte

#### Scenario: Variables de BD llegides de .env

- **GIVEN** que el fitxer `.env` conté `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`
- **WHEN** s'inicia el servei Laravel
- **THEN** la connexió a PostgreSQL s'estableix sense credencials hardcoded al codi

#### Scenario: Model User té HasApiTokens

- **WHEN** s'inspeccioneu el fitxer `app/Models/User.php`
- **THEN** el model `User` importa `Laravel\Sanctum\HasApiTokens`
- **THEN** el model `User` usa el trait `HasApiTokens` a la llista de `use` de la classe

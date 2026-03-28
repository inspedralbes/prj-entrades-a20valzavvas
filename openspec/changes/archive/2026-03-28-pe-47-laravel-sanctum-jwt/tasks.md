## 1. Publicar i configurar Sanctum

- [x] 1.1 Executar `php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"` per publicar `config/sanctum.php`
- [x] 1.2 Afegir la clau `'secret' => env('JWT_SECRET')` a `config/sanctum.php`
- [x] 1.3 Modificar la clau `expiration` de `config/sanctum.php` per llegir de `env('SANCTUM_TOKEN_TTL', 60)`
- [x] 1.4 Afegir `JWT_SECRET=` i `SANCTUM_TOKEN_TTL=60` a `.env.example` del Laravel Service

## 2. Model User amb HasApiTokens

- [x] 2.1 Obrir `app/Models/User.php` i afegir `use Laravel\Sanctum\HasApiTokens;` al bloc d'imports
- [x] 2.2 Incorporar el trait `HasApiTokens` a la llista de `use` dins la classe `User`

## 3. Migració personal_access_tokens

- [x] 3.1 Verificar que existeix el fitxer de migració `create_personal_access_tokens_table` al directori `database/migrations/`
- [x] 3.2 Si no existeix, executar `php artisan migrate` dins el contenidor per aplicar les migracions de Sanctum
- [x] 3.3 Confirmar que la taula `personal_access_tokens` existeix a la BD executant `php artisan migrate:status`

## 4. Registre del middleware de Sanctum

- [x] 4.1 Afegir `\Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class` al grup `api` a `app/Http/Kernel.php` (o equivalent a `bootstrap/app.php` si s'usa Laravel 11+)
- [x] 4.2 Verificar que la ruta `GET /api/health` segueix retornant HTTP 200 sense token

## 5. Variables d'entorn al Docker Compose

- [x] 5.1 Afegir `JWT_SECRET` i `SANCTUM_TOKEN_TTL` a la secció `environment` del servei `laravel-service` al `docker-compose.yml`
- [x] 5.2 Afegir comentari al `docker-compose.yml` indicant que `JWT_SECRET` ha de coincidir amb el Node Service

## 6. Tests

- [x] 6.1 Crear `tests/Feature/SanctumConfigTest.php` que verifiqui que `config('sanctum.secret')` retorna el valor de `JWT_SECRET`
- [x] 6.2 Crear test que verifiqui que `GET /api/health` retorna HTTP 200 sense token (no bloquejat per Sanctum)
- [x] 6.3 Crear test que verifiqui que `app/Models/User.php` usa el trait `HasApiTokens` (reflexió de classe o instanciació)
- [x] 6.4 Executar `php artisan test` i confirmar que tots els tests passen

## 7. Verificació final

- [x] 7.1 Confirmar que cap fitxer de codi font conté `JWT_SECRET` hardcoded (grep al repositori)
- [x] 7.2 Confirmar que `.env.example` té les noves variables documentades
- [x] 7.3 Executar `docker compose up --build` i verificar que el servei Laravel arrenca sense errors

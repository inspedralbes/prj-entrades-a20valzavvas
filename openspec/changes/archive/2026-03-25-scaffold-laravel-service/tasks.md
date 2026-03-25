## 1. Scaffold del projecte Laravel

- [x] 1.1 Crear el projecte Laravel a `backend/laravel-service/` via `composer create-project laravel/laravel laravel-service` (o afegir el `composer.json` manualment si no hi ha Composer disponible localment)
- [x] 1.2 Instal·lar `laravel/sanctum` via `composer require laravel/sanctum`
- [x] 1.3 Publicar la configuració de Sanctum via `php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"`
- [x] 1.4 Configurar `config/database.php` per establir `pgsql` com a connexió per defecte
- [x] 1.5 Assegurar que `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`, `APP_KEY` i `JWT_SECRET` es llegeixen de `.env` sense valors hardcoded

## 2. Health check i rutes base

- [x] 2.1 Afegir la ruta `GET /api/health` a `routes/api.php` que retorni `response()->json(['status' => 'ok'])`
- [x] 2.2 Crear el fitxer `routes/internal.php` buit (reservat per a endpoints de xarxa Docker interna)
- [x] 2.3 Registrar `routes/internal.php` al `RouteServiceProvider` (o `bootstrap/app.php` si es fa servir Laravel 11)
- [x] 2.4 Verificar que `php artisan route:list` mostra `GET /api/health` sense middleware d'autenticació

## 3. Configuració de CORS

- [x] 3.1 Publicar la configuració de CORS via `php artisan config:publish` o editar `config/cors.php`
- [x] 3.2 Configurar `allowed_origins` per incloure l'origen del frontend (port 3000 i/o wildcard per a dev)
- [x] 3.3 Assegurar que `Authorization` i `Content-Type` estan incloses a `allowed_headers`

## 4. Dockerfile de desenvolupament

- [x] 4.1 Crear `backend/laravel-service/Dockerfile` basat en `php:8.4-cli` (actualitzat des de 8.2 per compatibilitat amb Symfony 8.x)
- [x] 4.2 Afegir la instal·lació de `pdo_pgsql` via `docker-php-ext-install pdo pdo_pgsql`
- [x] 4.3 Afegir la instal·lació de Composer i l'execució de `composer install --no-dev` al build
- [x] 4.4 Definir el `CMD` com `php artisan serve --host=0.0.0.0 --port=8000`
- [x] 4.5 Verificar que `docker build -t laravel-service ./backend/laravel-service` passa sense errors

## 5. Integració al docker-compose.yml

- [x] 5.1 Afegir el servei `laravel-service` al `docker-compose.yml` existent amb `build: ./backend/laravel-service`, port `8000:8000` i `depends_on: db: condition: service_healthy`
- [x] 5.2 Afegir les variables d'entorn `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, `APP_KEY` al servei `laravel-service` al compose
- [x] 5.3 Afegir `JWT_SECRET` i `LARAVEL_APP_KEY` al `.env.example` amb descripcions de com generar-los

## 6. Verificació final (criteris d'acceptació PE-54)

- [x] 6.1 Executar `docker compose up --build laravel-service db` i verificar que `GET http://localhost:8000/api/health` retorna `200 { "status": "ok" }`
- [x] 6.2 Executar `docker compose up --build` complet i verificar que `laravel-service`, `db` i `frontend` arrenquen sense errors (el servei `backend` NestJS falla per un problema pre-existent de compilació — fora d'abast de PE-54)
- [x] 6.3 Verificar que `docker-compose.yml` i el codi no contenen cap credencial hardcoded
- [x] 6.4 Verificar que `.env` no és tractat per git (`git status` no el mostra com a fitxer tracked)

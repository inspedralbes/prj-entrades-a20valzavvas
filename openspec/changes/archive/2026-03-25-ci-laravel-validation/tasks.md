## 1. Actualitzar phpunit.xml — PostgreSQL

- [x] 1.1 Canviar `DB_CONNECTION` de `sqlite` a `pgsql` a `phpunit.xml`
- [x] 1.2 Eliminar `DB_DATABASE=:memory:` i afegir `DB_HOST=127.0.0.1`, `DB_PORT=5432`, `DB_DATABASE=entrades`, `DB_USERNAME=entrades`, `DB_PASSWORD=entrades`
- [x] 1.3 Eliminar `DB_URL` buit (no necessari per a pgsql)

## 2. Actualitzar .env.example — PostgreSQL

- [x] 2.1 Canviar `DB_CONNECTION=sqlite` a `DB_CONNECTION=pgsql`
- [x] 2.2 Descomentar i corregir `DB_HOST=127.0.0.1`, `DB_PORT=5432`, `DB_DATABASE=entrades`, `DB_USERNAME=entrades`, `DB_PASSWORD=` (buit, a definir per entorn)

## 3. Afegir steps PHP al ci.yml

- [x] 3.1 Afegir step `shivammathur/setup-php@v2` amb `php-version: '8.3'` i extensions `pdo_pgsql, mbstring` (després del step de setup-node)
- [x] 3.2 Afegir step `composer install --no-interaction --prefer-dist` amb `working-directory: src/backend/laravel-service`
- [x] 3.3 Afegir step de setup de Laravel: copiar `.env.example` a `.env` i executar `php artisan key:generate --force` amb `working-directory: src/backend/laravel-service`
- [x] 3.4 Afegir step `vendor/bin/pint --test` amb `working-directory: src/backend/laravel-service` (després del step de `pnpm lint`)
- [x] 3.5 Afegir step `php artisan migrate --force` amb `working-directory: src/backend/laravel-service` (després del lint PHP)
- [x] 3.6 Afegir step `php artisan test` amb `working-directory: src/backend/laravel-service` (al final, junt amb els altres tests)

## 4. Injectar variables de BD per a Laravel al ci.yml

- [x] 4.1 Afegir variables `DB_CONNECTION=pgsql`, `DB_HOST=127.0.0.1`, `DB_PORT=5432`, `DB_DATABASE=entrades`, `DB_USERNAME=entrades`, `DB_PASSWORD` al bloc `env` del job (reutilitzant el mateix secret/valor que `CI_POSTGRES_PASSWORD`)

## 5. Verificació

- [x] 5.1 Verificar que `phpunit.xml` té `DB_CONNECTION=pgsql` i no conté sqlite
- [x] 5.2 Verificar que `.env.example` té PostgreSQL com a connexió per defecte
- [x] 5.3 Verificar que `ci.yml` conté els 6 nous steps de PHP en l'ordre correcte
- [x] 5.4 Executar `php artisan test` localment (via Docker) per confirmar que els tests passen amb PostgreSQL

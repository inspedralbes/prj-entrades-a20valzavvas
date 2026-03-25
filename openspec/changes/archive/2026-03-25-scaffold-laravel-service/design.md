## Context

El monorepo actual té un `docker-compose.yml` v1.0 amb tres serveis: `db` (PostgreSQL 16), `backend` (NestJS en port 3001) i `frontend` (Nuxt 3 en port 3000). PE-11 va especificar un compose amb el servei `laravel-service` però es va tancar contra l'especificació antiga sense el Dockerfile corresponent. PE-54 crea el projecte Laravel base i afegeix el servei al compose com a acció additiva: no trenca cap servei existent.

El Laravel Service serà responsable de l'autenticació (Sanctum) i dels endpoints REST de negoci. En aquesta fase només se'n crea el scaffold: estructura de carpetes, configuració de BD, CORS, health check i Dockerfile. Les migrations, models i endpoints d'autenticació arriben en PE-12, PE-48 i PE-49.

## Goals / Non-Goals

**Goals:**
- Projecte Laravel funcional a `backend/laravel-service/` que arrenca dins de Docker
- `GET /api/health` disponible per al healthcheck de Docker
- Servei `laravel-service` integrat al `docker-compose.yml` existent sense trencar els serveis actuals
- Totes les credencials llegides de variables d'entorn

**Non-Goals:**
- Migrations ni models de base de dades (PE-12)
- Endpoints d'autenticació (PE-48, PE-49)
- Servei Nginx al compose (PE-55)
- Reanomenament del servei `backend` a `node-service` (PE-53)

## Decisions

### 1. PHP via imatge oficial `php:8.4-cli` al Dockerfile

S'utilitza la imatge oficial `php:8.4-cli` com a base per al Dockerfile de desenvolupament. S'instal·len les extensions necessàries per a PostgreSQL (`pdo_pgsql`) i es copien els fitxers del projecte. El servidor d'arrencada és `php artisan serve --host=0.0.0.0 --port=8000`.

**Nota d'implementació**: La versió inicial del disseny preveia `php:8.2-cli`, però `composer create-project` generat amb Laravel Herd (PHP 8.4 local) produeix un `composer.lock` amb Symfony 8.x, que requereix PHP ≥8.4. S'actualitza a `php:8.4-cli` per garantir compatibilitat.

**Alternativa considerada**: `php:8.4-fpm` + Nginx en el mateix contenidor. Descartat perquè Nginx és PE-55 i combinar-los ara acoplaria dos tickets. La simplicitat del `artisan serve` és suficient per a l'entorn de desenvolupament local.

### 2. Port 8000 per al laravel-service

El NestJS ocupa el 3001 i el frontend el 3000. El port 8000 és el default de `php artisan serve` i no genera conflictes. S'exposa `8000:8000` al compose.

### 3. Sanctum sense API tokens en aquesta fase

Sanctum s'instal·la i es configura però no s'emeten tokens fins a PE-48. La taula `personal_access_tokens` es crearà quan s'executin les migrations (PE-12). En el scaffold, Sanctum queda preparat (`php artisan vendor:publish`) però no actiu.

### 4. `JWT_SECRET` al `.env` tot i que Sanctum no usa JWT nativament

El ticket especifica `JWT_SECRET` com a variable d'entorn. S'afegeix al `.env.example` per complir el criteri d'acceptació de PE-54, reservat per a implementacions futures que puguin necessitar-lo (p. ex. integració amb el NestJS).

### 5. `routes/internal.php` com a fitxer independent

Es crea `routes/internal.php` per a endpoints de xarxa Docker interna (comunicació entre serveis). Es registra al `RouteServiceProvider` condicionalment (no exposa rutes al port públic). Permet que PE-48/PE-49 afegeixin endpoints interns sense contaminar `routes/api.php`.

## Risks / Trade-offs

- **`APP_KEY` al contenidor**: Laravel requereix `APP_KEY` per xifrar. S'ha de generar (`php artisan key:generate`) i afegir al `.env` local. Mai al repositori. Risc baix: el Dockerfile pot executar `php artisan key:generate --show` per informar l'usuari en el primer build, però no l'escriu al fitxer (no és possible des del build step). → **Mitigació**: El `LARAVEL_APP_KEY` s'afegeix al `.env.example` amb instruccions de com generar-lo; el healthcheck fallarà fins que estigui configurat, cosa que fa evident el problema.
- **Extensió `pdo_pgsql` no inclosa a les imatges base de PHP**: Cal instal·lar-la explícitament al Dockerfile via `docker-php-ext-install`. → **Mitigació**: Inclòs al Dockerfile.
- **Volum de `vendor/` al contenidor**: `composer install` durant el build pot ser lent. → **Mitigació**: Acceptable per a dev. La imatge de producció (fora d'abast) optimitzarà.

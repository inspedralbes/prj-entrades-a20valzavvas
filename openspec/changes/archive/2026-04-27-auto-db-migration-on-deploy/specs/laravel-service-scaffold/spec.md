## MODIFIED Requirements

### Requirement: Dockerfile de desenvolupament per al laravel-service

El sistema SHALL disposar d'un `Dockerfile` a `backend/laravel-service/` que construeixi una imatge amb PHP 8.2+, les extensions necessàries per a PostgreSQL (`pdo_pgsql`), que copiï `docker-entrypoint.sh` a `/usr/local/bin/docker-entrypoint.sh` amb permisos d'execució, i que arranqui el servei via l'`ENTRYPOINT ["docker-entrypoint.sh"]` en lloc de `CMD`.

#### Scenario: Build del Dockerfile sense errors

- **WHEN** s'executa `docker build -t laravel-service ./backend/laravel-service`
- **THEN** la imatge es construeix sense errors
- **THEN** la imatge conté PHP 8.2+ amb l'extensió `pdo_pgsql` disponible

#### Scenario: Dockerfile utilitza ENTRYPOINT apuntant a l'script

- **WHEN** s'inspeccioneu el `backend/laravel-service/Dockerfile`
- **THEN** existeix la instrucció `ENTRYPOINT ["docker-entrypoint.sh"]`
- **THEN** el fitxer `docker-entrypoint.sh` és copiat a `/usr/local/bin/docker-entrypoint.sh` dins la imatge amb permisos d'execució

#### Scenario: Contenidor arrenca i exposa el port 8000

- **GIVEN** que les variables d'entorn de BD i APP_KEY estan configurades i la BD és accessible
- **WHEN** s'executa `docker run -p 8000:8000 laravel-service`
- **THEN** `php artisan migrate --force` s'executa primer
- **THEN** el servei `php artisan serve` arrenca al port 8000
- **THEN** `GET http://localhost:8000/api/health` retorna HTTP 200

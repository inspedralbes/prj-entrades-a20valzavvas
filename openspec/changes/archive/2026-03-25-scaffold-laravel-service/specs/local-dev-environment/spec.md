## MODIFIED Requirements

### Requirement: docker-compose.yml a l'arrel arrenca tots els serveis

El sistema SHALL disposar d'un `docker-compose.yml` a l'arrel del repositori que defineixi els serveis `db`, `backend`, `frontend` i `laravel-service`, de manera que `docker compose up --build` arrenqui els quatre serveis sense errors.

#### Scenario: Arrencada completa sense errors

- **GIVEN** que existeix un fitxer `.env` a l'arrel basat en `.env.example` amb totes les variables requerides (incloent `JWT_SECRET` i `LARAVEL_APP_KEY`)
- **WHEN** s'executa `docker compose up --build`
- **THEN** els serveis `db`, `frontend` i `laravel-service` arrenquen sense errors
- **THEN** PostgreSQL és accessible a `localhost:5432`
- **THEN** el frontend és accessible a `http://localhost:3000`
- **THEN** el Laravel Service respon a `http://localhost:8000/api/health` amb HTTP 200

> **Known limitation**: El servei `backend` (NestJS) falla en arrencar per un problema pre-existent de compilació (`Cannot find module './app.module'` al directori `dist/`). Aquest problema és fora de l'abast de PE-54 i s'ha de resoldre en un ticket separat (relacionat amb PE-53).

#### Scenario: laravel-service espera que db estigui sa

- **GIVEN** que el servei `db` té un health check configurat
- **WHEN** s'executa `docker compose up`
- **THEN** el servei `laravel-service` no arrenca fins que el health check de `db` retorna `healthy`
- **THEN** no es produeix cap error de connexió a PostgreSQL en l'arrencada de Laravel

#### Scenario: Servei backend (NestJS) espera que db estigui sa

- **GIVEN** que el servei `db` té un health check configurat
- **WHEN** s'executa `docker compose up`
- **THEN** el servei `backend` no arrenca fins que el health check de `db` retorna `healthy`
- **THEN** no es produeix cap error de connexió a la base de dades en l'arrencada de NestJS

#### Scenario: Aturada neta dels serveis

- **WHEN** s'executa `docker compose down`
- **THEN** tots els contenidors s'aturen i s'eliminen sense errors
- **THEN** el volum de dades de PostgreSQL persisteix (no s'elimina)

#### Scenario: Testabilitat — verificació dels ports exposats

- **WHEN** s'executa `docker compose up -d` i els serveis estan en estat `healthy`
- **THEN** `curl http://localhost:3001/api` retorna HTTP 200 o 404 (servidor actiu)
- **THEN** `curl http://localhost:3000` retorna HTTP 200 (frontend actiu)
- **THEN** `curl http://localhost:8000/api/health` retorna HTTP 200 amb `{ "status": "ok" }`

## ADDED Requirements

### Requirement: .env.example documenta JWT_SECRET i LARAVEL_APP_KEY

El `.env.example` SHALL incloure les variables `JWT_SECRET` i `LARAVEL_APP_KEY` amb descripcions que indiquin com generar-les, a més de les variables existents.

#### Scenario: .env.example conté les noves variables

- **WHEN** s'inspecciona `.env.example`
- **THEN** conté `JWT_SECRET` amb una descripció o valor d'exemple
- **THEN** conté `LARAVEL_APP_KEY` amb instruccions per generar-la via `php artisan key:generate --show`
- **THEN** cap dels valors d'exemple no és un secret real de producció

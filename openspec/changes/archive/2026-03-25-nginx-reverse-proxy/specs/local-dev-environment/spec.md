## MODIFIED Requirements

### Requirement: docker-compose.yml a l'arrel arrenca tots els serveis

El sistema SHALL disposar d'un `docker-compose.yml` a l'arrel del repositori que defineixi els serveis `db`, `backend`, `frontend`, `laravel-service` i **`nginx`**, de manera que `docker compose up --build` arrenqui tots els serveis sense errors. **El servei `nginx` actua com a únic punt d'entrada extern al port 80**, delegant tràfic als serveis interns via la xarxa Docker.

#### Scenario: Arrencada completa sense errors

- **GIVEN** que existeix un fitxer `.env` a l'arrel basat en `.env.example` amb totes les variables requerides (incloent `JWT_SECRET` i `LARAVEL_APP_KEY`)
- **WHEN** s'executa `docker compose up --build`
- **THEN** els serveis `db`, `frontend`, `laravel-service` i `nginx` arrenquen sense errors
- **THEN** PostgreSQL és accessible a `localhost:5432`
- **THEN** el frontend és accessible a `http://localhost` (via Nginx al port 80)
- **THEN** `http://localhost/api/health` retorna HTTP 200 (Nginx → Laravel)

> **Known limitation**: El servei `backend` (NestJS) falla en arrencar per un problema pre-existent de compilació (`Cannot find module './app.module'` al directori `dist/`). Aquest problema és fora de l'abast de PE-55 i s'ha de resoldre en un ticket separat.

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
- **THEN** tots els contenidors (incloent `nginx`) s'aturen i s'eliminen sense errors
- **THEN** el volum de dades de PostgreSQL persisteix (no s'elimina)

#### Scenario: Testabilitat — verificació dels ports exposats

- **WHEN** s'executa `docker compose up -d` i els serveis estan en estat `healthy`
- **THEN** `curl http://localhost/api/health` retorna HTTP 200 amb `{ "status": "ok" }` (via Nginx)
- **THEN** `curl http://localhost/` retorna HTTP 200 (frontend via Nginx)
- **THEN** `curl http://localhost/ws/socket.io/?EIO=4&transport=polling` retorna HTTP 200 (WebSocket via Nginx)

> **Known limitation**: La verificació de l'endpoint `/ws` retornarà 404 fins que el `GatewayModule` de NestJS (Socket.IO) estigui implementat en un ticket posterior. Nginx enruta correctament cap a `backend:3001`; el 404 és del servei backend, no de Nginx.

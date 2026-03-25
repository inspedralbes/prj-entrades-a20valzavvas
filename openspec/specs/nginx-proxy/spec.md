# Capability: nginx-proxy

## Purpose

Defineix els requisits del servei Nginx que actua com a únic punt d'entrada extern, fent proxy del tràfic REST cap a `laravel-service`, del tràfic WebSocket cap a `node-service`, i del tràfic frontend cap al servei Nuxt.

## Requirements

### Requirement: Nginx enruta tràfic REST cap a laravel-service

El sistema SHALL disposar d'un `nginx/nginx.conf` que faci proxy de totes les peticions amb prefix `/api` cap a `http://laravel-service:8000`, preservant el path complet (incloent el prefix `/api`), i propagant els headers `Authorization` i `X-Real-IP`.

#### Scenario: Proxy REST — health check

- **GIVEN** que tots els serveis estan actius (`docker compose up`)
- **WHEN** el browser fa `GET http://localhost/api/health`
- **THEN** Nginx delega la petició a `http://laravel-service:8000/api/health`
- **THEN** la resposta és HTTP 200 amb `{ "status": "ok" }`

#### Scenario: Proxy REST — header Authorization propagat

- **GIVEN** que tots els serveis estan actius
- **WHEN** el browser fa `GET http://localhost/api/events` amb `Authorization: Bearer <token>`
- **THEN** Laravel rep la petició amb el header `Authorization` intacte
- **THEN** la resposta és HTTP 200 o 401 (mai 502 de Nginx)

#### Scenario: Proxy REST — servei no disponible retorna 502

- **GIVEN** que `laravel-service` no està actiu
- **WHEN** el browser fa `GET http://localhost/api/health`
- **THEN** Nginx retorna HTTP 502 Bad Gateway

#### Scenario: Testabilitat — verificació de routing REST

- **WHEN** s'executa `curl -s -o /dev/null -w "%{http_code}" http://localhost/api/health`
- **THEN** el codi de retorn és `200` (confirma que Nginx delega correctament a Laravel)

---

### Requirement: Nginx enruta tràfic WebSocket cap a node-service

El sistema SHALL fer proxy de totes les peticions amb prefix `/ws` cap a `http://backend:3001` (nom del servei Docker), amb els headers de negociació WebSocket (`Upgrade: websocket`, `Connection: upgrade`) i un `proxy_read_timeout` de 3600 s per a connexions persistents.

#### Scenario: Proxy WebSocket — connexió establerta

- **GIVEN** que `node-service` i `nginx` estan actius
- **WHEN** un client Socket.IO es connecta a `ws://localhost/ws`
- **THEN** la connexió WebSocket s'estableix correctament a través de Nginx
- **THEN** el client pot emetre i rebre events (ex.: `event:unir`, `seient:canvi-estat`)

#### Scenario: Proxy WebSocket — connexió persistent no tancada per timeout curt

- **GIVEN** que la connexió WebSocket porta més de 60 s oberta sense activitat
- **WHEN** Nginx avalua el timeout de la connexió
- **THEN** la connexió NO és tancada per Nginx (gràcies a `proxy_read_timeout 3600s`)

#### Scenario: Proxy WebSocket — headers d'upgrade propagats

- **GIVEN** que `node-service` i `nginx` estan actius
- **WHEN** el client Socket.IO inicia la negociació WebSocket amb `Upgrade: websocket`
- **THEN** Nginx propaga `Upgrade: $http_upgrade` i `Connection: upgrade` cap a `backend`
- **THEN** `backend` confirma l'upgrade i retorna HTTP 101 Switching Protocols

#### Scenario: Testabilitat — verificació de WebSocket via curl

- **WHEN** s'executa `curl -s -o /dev/null -w "%{http_code}" http://localhost/ws/socket.io/?EIO=4&transport=polling`
- **THEN** el codi de retorn és `200` (confirma que Nginx delega el polling de Socket.IO a node-service)

---

### Requirement: Nginx enruta tràfic frontend cap al servei Nuxt

El sistema SHALL fer proxy de totes les peticions que no coincideixen amb `/api` ni `/ws` cap a `http://frontend:3000`, actuant com a catch-all per al frontend Nuxt.

#### Scenario: Proxy frontend — pàgina principal accessible

- **GIVEN** que tots els serveis estan actius
- **WHEN** el browser fa `GET http://localhost/`
- **THEN** Nginx delega a `http://frontend:3000/`
- **THEN** la resposta és HTTP 200 amb el HTML del frontend Nuxt

#### Scenario: Proxy frontend — rutes Nuxt respectades

- **GIVEN** que tots els serveis estan actius
- **WHEN** el browser fa `GET http://localhost/events/festival-2025`
- **THEN** Nginx delega a `http://frontend:3000/events/festival-2025`
- **THEN** la resposta és HTTP 200 o 404 (gestionat per Nuxt, mai per Nginx)

#### Scenario: Testabilitat — verificació de routing frontend

- **WHEN** s'executa `curl -s -o /dev/null -w "%{http_code}" http://localhost/`
- **THEN** el codi de retorn és `200` (confirma que Nginx delega correctament al frontend)

---

### Requirement: Nginx no exposa directament els ports interns dels serveis

El sistema SHALL configurar els serveis interns (`node-service`, `laravel-service`, `frontend`) al `docker-compose.yml` sense exposar els seus ports al host (o limitant-los), de manera que l'únic accés extern sigui via Nginx al port 80.

#### Scenario: Accés directe als ports interns no disponible externament

- **GIVEN** que el `docker-compose.yml` configura `nginx` com a únic servei amb port 80 exposat
- **WHEN** es comprova la configuració del `docker-compose.yml`
- **THEN** els serveis `frontend`, `laravel-service` i `node-service` comuniquen entre ells per la xarxa interna de Docker
- **THEN** l'únic punt d'entrada extern és `http://localhost` (port 80 via Nginx)

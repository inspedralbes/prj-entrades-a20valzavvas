## Purpose

Aquest spec defineix els requisits de la infraestructura de producció compartida al VPS. Inclou el `docker-compose.prod.yml`, nginx com a reverse proxy (amb suport WebSocket per a Socket.IO), PostgreSQL amb volum persistent i la preparació del VPS per a desplegaments futurs. Aquesta infraestructura és la base sobre la qual PE-40 (frontend) i PE-57 (Laravel) construiran els seus desplegaments.

---

## ADDED Requirements

### Requirement: docker-compose.prod.yml defineix tots els serveis de producció

El repositori SHALL contenir un fitxer `docker-compose.prod.yml` a l'arrel amb els serveis `nginx`, `backend`, `frontend` i `postgres`, tots connectats a una xarxa interna Docker. Cap servei excepte nginx SHALL exposar ports públicament.

#### Scenario: Tots els serveis arrenquen amb docker compose up

- **GIVEN** que el fitxer `docker-compose.prod.yml` existeix al VPS a `/opt/entrades/`
- **AND** el fitxer `.env` existeix amb les variables requerides
- **WHEN** s'executa `docker compose -f docker-compose.prod.yml up -d`
- **THEN** tots els serveis (`nginx`, `backend`, `frontend`, `postgres`) arrenquen sense errors
- **AND** `docker compose ps` mostra tots els contenidors com a `running`

#### Scenario: Ports interns no estan exposats públicament

- **WHEN** s'inspeccionà el `docker-compose.prod.yml`
- **THEN** els serveis `backend`, `frontend` i `postgres` usen `expose` (no `ports`)
- **AND** únicament el servei `nginx` declara `ports: ["80:80", "443:443"]`

#### Scenario: Tots els serveis estan a la mateixa xarxa Docker interna

- **WHEN** s'executa `docker network inspect entrades_default` (o el nom de la xarxa definida)
- **THEN** els contenidors `nginx`, `backend`, `frontend` i `postgres` estan a la mateixa xarxa
- **AND** el backend pot connectar-se a postgres per hostname `postgres` (no per IP)

---

### Requirement: PostgreSQL té volum persistent entre desplegaments

El servei `postgres` del `docker-compose.prod.yml` SHALL declarar un volum named (`postgres-data`) mapejat a `/var/lib/postgresql/data`. Les dades MUST sobreviure a `docker compose down` i a `docker compose up --build`.

#### Scenario: Les dades persisteixen entre redesplegaments

- **GIVEN** que la base de dades té dades (esdeveniments, reserves, ordres)
- **WHEN** s'executa `docker compose -f docker-compose.prod.yml down` seguit de `docker compose -f docker-compose.prod.yml up -d`
- **THEN** totes les dades anteriors continuen accessibles
- **AND** el backend connecta a postgres correctament

#### Scenario: Testabilitat — el volum está declarat al fitxer

- **WHEN** s'inspeccionà el `docker-compose.prod.yml`
- **THEN** el servei `postgres` declara `volumes` apuntant a un volum named `postgres-data`
- **AND** el fitxer declara `volumes: postgres-data:` a nivell arrel

---

### Requirement: Nginx fa de reverse proxy per a backend i frontend amb suport WebSocket

El fitxer `nginx/nginx.conf` SHALL configurar nginx com a reverse proxy: `/* ` → frontend (port 3000), `/api/*` → backend (port 3001), `/socket.io/*` → backend (port 3001) amb headers WebSocket (`Upgrade`, `Connection`). Sense la configuració WebSocket, Socket.IO falla silenciosament i l'aplicació perd les funcionalitats en temps real.

#### Scenario: Les peticions a /api/ arriben al backend

- **GIVEN** que l'stack de producció està en marxa
- **WHEN** el navegador fa una petició `GET /api/events`
- **THEN** nginx fa proxy de la petició al servei `backend:3001`
- **AND** la resposta té status `200` amb el llistat d'esdeveniments

#### Scenario: Socket.IO connecta per WebSocket (no long-polling)

- **GIVEN** que l'stack de producció està en marxa
- **WHEN** el frontend s'obre al navegador i connecta el socket a `/socket.io/`
- **THEN** la connexió s'estableix com a WebSocket (visible a DevTools → Network → WS)
- **AND** els events en temps real (`seient:canvi-estat`) arriben correctament

#### Scenario: Les peticions a / arriben al frontend

- **GIVEN** que l'stack de producció està en marxa
- **WHEN** el navegador fa una petició `GET /`
- **THEN** nginx fa proxy al servei `frontend:3000`
- **AND** la pàgina d'inici s'renderitza correctament

#### Scenario: Testabilitat — nginx.conf conté la configuració WebSocket

- **WHEN** s'inspeccionà el fitxer `nginx/nginx.conf`
- **THEN** el `location /socket.io/` conté `proxy_http_version 1.1`
- **AND** conté `proxy_set_header Upgrade $http_upgrade`
- **AND** conté `proxy_set_header Connection "upgrade"`

---

### Requirement: El backend executa prisma migrate deploy a l'arrencada

El `backend/Dockerfile` SHALL incloure un entrypoint que executi `npx prisma migrate deploy` abans d'arrencar `node dist/main.js`. Això garanteix que el schema de la base de dades sempre està sincronitzat amb el codi desplegat.

#### Scenario: Les migracions s'apliquen en el primer desplegament

- **GIVEN** que la base de dades és nova (sense taules)
- **WHEN** el contenidor del backend arrenca per primera vegada
- **THEN** `prisma migrate deploy` crea totes les taules definides al schema
- **AND** el backend arrenca correctament i accepta connexions

#### Scenario: Les migracions pendents s'apliquen en redesplegaments

- **GIVEN** que hi ha una nova migració Prisma al codi desplegat
- **WHEN** el contenidor del backend es reinicia
- **THEN** `prisma migrate deploy` aplica la nova migració
- **AND** el backend arrenca amb el schema actualitzat

#### Scenario: Si postgres no està ready, el backend reintenta

- **GIVEN** que el servei `postgres` encara no ha acabat d'arrencar
- **WHEN** el backend intenta executar `prisma migrate deploy`
- **THEN** el contenidor espera (via `depends_on` amb `condition: service_healthy`) fins que postgres és accessible

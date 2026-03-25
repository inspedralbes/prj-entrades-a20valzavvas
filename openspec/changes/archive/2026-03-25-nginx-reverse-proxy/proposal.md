## Why

El browser necessita accedir al frontend (Nuxt), a l'API REST (Laravel) i als WebSockets (Node/Socket.IO) des d'un únic punt d'entrada (port 80) sense conèixer els ports interns dels serveis. Sense Nginx com a proxy invers, la gestió de CORS i les connexions WebSocket de llarga durada serien inviables. Jira: PE-55.

## What Changes

- Nou fitxer `nginx/nginx.conf` amb regles de proxy invers:
  - `location /ws` → `proxy_pass http://node-service:3001` amb headers WebSocket (`Upgrade`, `Connection`)
  - `location /api` → `proxy_pass http://laravel-service:8000` amb headers `Authorization`, `X-Real-IP`
  - `location /` → `proxy_pass http://frontend:3000`
  - `proxy_read_timeout 3600s` per a connexions WebSocket llargues
- Actualització de `docker-compose.yml` per injectar `nginx/nginx.conf` via volume al contenidor nginx

## Capabilities

### New Capabilities

- `nginx-proxy`: Configuració de Nginx com a proxy invers únic punt d'entrada: routing de tràfic HTTP i WebSocket cap als serveis interns (frontend, laravel-service, node-service)

### Modified Capabilities

- `local-dev-environment`: El docker-compose.yml incorpora el volum de configuració nginx; el servei nginx passa a gestionar tot el tràfic extern (abans cada servei exposava el seu port directament)

## Impact

- **Fitxers afectats**: `nginx/nginx.conf` (nou), `docker-compose.yml` (modificat)
- **Serveis afectats**: nginx, node-service (port 3001), laravel-service (port 8000), frontend (port 3000)
- **Cap cross-module side effect** en el codi d'aplicació (backend NestJS, Laravel, Nuxt): és infraestructura pura
- **No requereix tests unitaris** (configuració estàtica de proxy); la verificació és funcional via `docker compose up`

## Non-goals

- SSL/TLS (fora d'abast en context acadèmic local)
- Rate limiting
- Configuració de producció / VPS

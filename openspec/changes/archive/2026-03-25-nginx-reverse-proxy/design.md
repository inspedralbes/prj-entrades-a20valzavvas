## Context

L'aplicació és un monorepo amb tres serveis diferenciats: frontend Nuxt (port 3000), node-service NestJS/Socket.IO (port 3001) i laravel-service (port 8000). Tots corren en contenidors Docker Compose a la xarxa interna `entrades-net`. Sense un proxy invers, el browser hauria de connectar-se a tres ports separats, complicant la gestió de CORS i fent impossible la negociació de WebSocket des d'un origen únic.

Nginx actua com a únic punt d'entrada al port 80 i enruta el tràfic basat en el prefix de la URL.

## Goals / Non-Goals

**Goals:**
- Proxy HTTP per a `/api` → laravel-service:8000
- Proxy HTTP + WebSocket upgrade per a `/ws` → backend:3001 (servei Docker NestJS)
- Proxy HTTP per a `/` → frontend:3000
- Timeouts llargs per a connexions WebSocket persistents
- Configuració injectada via Docker volume (sense reconstruir la imatge nginx)

**Non-Goals:**
- SSL/TLS
- Rate limiting, caching o compressió
- Configuració de producció / VPS
- Logs estructurats o monitoring de Nginx

## Decisions

### D1 — Prefix-based routing vs. host-based routing

**Decisió**: Routing per prefix de path (`/api`, `/ws`, `/`).

**Alternativa descartada**: Virtual hosts (subdominis `api.localhost`, `ws.localhost`). Requeriria DNS local o modificació de `/etc/hosts` a cada màquina de desenvolupament.

**Raó**: El prefix-path funciona out-of-the-box des del browser sense configuració addicional. És la convenció estàndard per a SPAs amb API i WebSocket al mateix origen.

---

### D2 — Ordre de `location` blocks

**Decisió**: Ordre `location /ws` → `location /api` → `location /`.

`/ws` i `/api` usen prefix exacte implícit; `/` és el catch-all. Nginx avalua `location` blocks de més específic a menys específic, de manera que `/ws` i `/api` sempre guanyen sobre `/`.

---

### D3 — Headers WebSocket a `location /ws`

**Decisió**: Afegir `proxy_set_header Upgrade $http_upgrade` i `proxy_set_header Connection "upgrade"`.

Nginx per defecte no propaga els headers de negociació WebSocket. Sense ells, Socket.IO cau al polling HTTP llarg. El client Socket.IO del projecte (`plugins/socket.client.ts`) espera una connexió WebSocket real.

---

### D4 — `proxy_read_timeout 3600s` per a `/ws`

**Decisió**: Timeout d'1 hora per a connexions WebSocket.

El timeout per defecte de Nginx és 60 s. Un usuari actiu al mapa de seients (`/events/[slug]`) manté la connexió WebSocket oberta durant tota la sessió. Amb 60 s el proxy tancaria la connexió en inactivitat de mercat.

---

### D5 — Injecció de configuració via Docker volume

**Decisió**: `volumes: - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro` al `docker-compose.yml`.

**Alternativa descartada**: Imatge Docker customitzada amb `COPY`. Requeriria `docker build` a cada canvi de configuració.

**Raó**: El volume permet editar `nginx.conf` i recarregar Nginx (`docker compose restart nginx`) sense reconstruir res. Adequat per a context de desenvolupament.

## Risks / Trade-offs

- **[Risc] Strip de path incorrecte**: Si `location /api` no fa strip del prefix `/api` abans de passar la request a Laravel, les rutes Laravel hauran d'incloure `/api` com a prefix. → **Mitigació**: No usar `proxy_pass http://laravel-service:8000/` (amb trailing slash, que fa strip). Usar sense trailing slash: `proxy_pass http://laravel-service:8000` per preservar el path complet. Les rutes Laravel estan definides amb prefix `/api` a `routes/api.php`.

- **[Risc] WebSocket connection refused si `backend` no està actiu**: Nginx retorna 502. → **Mitigació**: Documentar l'ordre d'arrencada; `docker compose up` en paral·lel és suficient perquè Socket.IO fa reconnect automàtic.

- **[Trade-off] Configuració única per a dev**: `nginx.conf` no és reutilitzable per a producció (ports, hostnames de xarxa interna Docker). → Acceptat: l'abast explícit és l'entorn local de desenvolupament.

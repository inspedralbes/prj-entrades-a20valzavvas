## Why

El desplegament manual és propens a errors i inconsistent. A més, no existeix cap infraestructura de producció al VPS: no hi ha nginx, ni volums persistents per a PostgreSQL, ni configuració de xarxa Docker. Sense aquesta base, cap servei pot ser accessible des d'una URL pública ni funcionar de forma estable entre desplegaments.

PE-39 estableix tota la infraestructura compartida del VPS (nginx, postgres amb volum persistent, xarxes Docker, SSL) i el primer workflow de deploy automatitzat (backend). Els tickets posteriors (PE-40 frontend, PE-57 Laravel) podran reutilitzar aquesta base sense refactoritzar.

Jira: PE-39

## What Changes

- `docker-compose.prod.yml` amb tots els serveis: `nginx`, `backend`, `frontend` (placeholder), `postgres`.
- `nginx/nginx.conf` amb proxy invers per a backend (API + WebSocket Socket.IO) i frontend, amb suport SSL.
- `backend/Dockerfile` per a producció amb execució de `prisma migrate deploy` a l'arrencada.
- `.github/workflows/deploy-backend.yml`: rsync del repositori a `/opt/entrades/`, injecció del `.env` i `docker compose up -d --build backend`. Deploy condicional per paths (`backend/**`, `shared/**`) i suport per `workflow_dispatch`.
- Estructura del VPS preparada: directori `/opt/entrades/`, permisos per a l'usuari `deploy`, ports 80/443 públics via nginx.

## Capabilities

### New Capabilities

- `backend-deploy-workflow`: Workflow de GitHub Actions que sincronitza el repositori al VPS, injecta el `.env` i desplega el backend condicionalment (si han canviat `backend/**` o `shared/**`), amb suport per execució manual.
- `production-infrastructure`: Infraestructura de producció al VPS: `docker-compose.prod.yml` amb nginx, backend, frontend placeholder i postgres amb volum persistent; `nginx.conf` amb proxy invers i suport WebSocket.

### Modified Capabilities

<!-- Cap requisit existent canvia. -->

## Impact

- **Fitxers nous**: `docker-compose.prod.yml`, `nginx/nginx.conf`, `backend/Dockerfile`, `.github/workflows/deploy-backend.yml`.
- **Infraestructura VPS**: directori `/opt/entrades/`, permisos per a `deploy`, ports 80/443 oberts.
- **GitHub Secrets nous**: `SSH_HOST`, `SSH_USER`, `SSH_KEY`, `BACKEND_ENV_FILE`.
- **Dependència**: el workflow depèn de `ci.yml` (PE-38); no es desplega automàticament si el CI falla.
- **Cap impacte** en codi d'aplicació (NestJS, Prisma, Socket.IO, Nuxt) ni en tests existents.
- **PE-40 (frontend) i PE-57 (Laravel)** reutilitzaran el `docker-compose.prod.yml` i el `nginx.conf` creats aquí, afegint-hi els seus serveis i locations.

## Non-goals

- No configura el workflow de deploy del frontend (PE-40) ni del Laravel (PE-57).
- No configura rollback automàtic ni blue/green deployment.
- SSL/HTTPS amb Let's Encrypt: s'inclou l'estructura (volum certbot, location per a ACME challenge) però l'obtenció del certificat real és un pas manual post-desplegament.

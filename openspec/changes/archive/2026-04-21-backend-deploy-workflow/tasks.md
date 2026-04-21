## 1. docker-compose.prod.yml

- [x] 1.1 Crear `docker-compose.prod.yml` a l'arrel amb el servei `postgres` (image: postgres:16, volum named `postgres-data`, `expose: ["5432"]`, healthcheck)
- [x] 1.2 Afegir servei `backend` (build: ./backend, `expose: ["3001"]`, `env_file: .env`, `depends_on: postgres` amb `condition: service_healthy`)
- [x] 1.3 Afegir servei `frontend` (build: ./frontend, `expose: ["3000"]`, `env_file: .env`) — placeholder per a PE-40
- [x] 1.4 Afegir servei `nginx` (image: nginx:alpine, `ports: ["80:80", "443:443"]`, mount de `nginx/nginx.conf`, `depends_on: [backend, frontend]`)
- [x] 1.5 Declarar la xarxa interna i els volums (`postgres-data`) a nivell arrel del fitxer
- [x] 1.6 Verificar que cap servei excepte nginx exposa ports amb `ports:` (usar `expose:` per als interns)

## 2. nginx/nginx.conf

- [x] 2.1 Crear `nginx/nginx.prod.conf` amb upstream backend (backend:3001), laravel-service (8000) i frontend (3000)
- [x] 2.2 Configurar `location /api` amb `proxy_pass http://laravel-service:8000` i headers adequats (`Host`, `X-Real-IP`, `X-Forwarded-Proto`)
- [x] 2.3 Configurar `location /ws/` amb `proxy_pass http://backend:3001/`, `proxy_http_version 1.1`, `Upgrade` i `Connection: upgrade`
- [x] 2.4 Configurar `location /` amb `proxy_pass http://frontend:3000`
- [x] 2.5 Afegir `location /.well-known/acme-challenge/` per a obtenció de certificat SSL amb Certbot i bloc HTTPS comentat fins a obtenir el cert

## 3. backend/Dockerfile

- [x] 3.1 Crear `backend/Dockerfile` (si no existeix) — ja existeix a `src/backend/node-service/Dockerfile`
- [x] 3.2 Afegir etapa de producció que executa `prisma migrate deploy` — ja implementat a `docker-entrypoint.sh`
- [x] 3.3 Assegurar que el `Dockerfile` no conté cap secret hardcoded — verificat, cap secret al fitxer
- [x] 3.4 Verificar build local: `docker build -f src/backend/node-service/Dockerfile -t backend-test .`

## 4. Preparació del VPS

- [x] 4.1 Crear el directori `/opt/entrades/` al VPS i assignar permisos a l'usuari `deploy`: `mkdir -p /opt/entrades && chown deploy:deploy /opt/entrades`
- [x] 4.2 Verificar que l'usuari `deploy` pertany al grup `docker`: `id deploy` (ha d'incloure `docker`)
- [x] 4.3 Obrir els ports 80 i 443 al firewall del VPS (UFW o equivalent): `ufw allow 80 && ufw allow 443`

## 5. Workflow: deploy-backend.yml

- [x] 5.1 Crear `.github/workflows/deploy-backend.yml` amb triggers `on.workflow_run` (CI completat a `main`) i `on.workflow_dispatch`
- [x] 5.2 Afegir condicional al job: `if: ${{ github.event_name == 'workflow_dispatch' || github.event.workflow_run.conclusion == 'success' }}`
- [x] 5.3 Afegir pas `dorny/paths-filter@v3` per detectar canvis a `src/backend/node-service/**` i `src/shared/**`
- [x] 5.4 Condicionar els passos de rsync i SSH: `if: steps.changes.outputs.backend == 'true' || github.event_name == 'workflow_dispatch'`
- [x] 5.5 Afegir pas de rsync (`burnett01/rsync-deployments`) cap a `/opt/entrades/` amb `--delete --exclude ".git" --exclude ".github"`
- [x] 5.6 Afegir pas SSH (`appleboy/ssh-action`) per escriure el `.env` des del secret `BACKEND_ENV_FILE` a `/opt/entrades/.env` amb permisos `600`
- [x] 5.7 Afegir pas SSH per executar `cd /opt/entrades && docker compose -f docker-compose.prod.yml up -d --build backend && docker image prune -f`
- [x] 5.8 Parametritzar `SSH_HOST`, `SSH_USER` i `SSH_KEY` com a `${{ secrets.* }}`

## 6. Configuració de GitHub Secrets

- [x] 6.1 Crear secret `SSH_HOST` amb la IP del VPS
- [x] 6.2 Crear secret `SSH_USER` amb el valor `deploy`
- [x] 6.3 Verificar que `SSH_KEY` ja existeix (creat anteriorment)
- [x] 6.4 Crear secret `BACKEND_ENV_FILE` amb el contingut complet del `.env` del backend (DATABASE_URL, ADMIN_TOKEN, PORT, etc.)

## 7. Validació de qualitat

- [x] 7.1 Revisar el YAML del workflow (o usar `actionlint`) per assegurar sintaxi correcta
- [x] 7.2 Executar `pnpm lint` sense errors — cap error nou introduït (60 warnings pre-existents)
- [x] 7.3 Executar `pnpm type-check` sense errors
- [x] 7.4 Executar `pnpm test` sense errors — 194 tests passed

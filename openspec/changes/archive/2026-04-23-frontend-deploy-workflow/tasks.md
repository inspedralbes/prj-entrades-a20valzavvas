## 1. Dockerfile de producció del frontend

- [x] 1.1 Crear `frontend/Dockerfile` amb etapa `builder`: base `node:20-alpine`, instal·lar pnpm, copiar workspace, executar `pnpm install --filter frontend...` i `pnpm --filter frontend exec nuxt build`
- [x] 1.2 Declarar `ARG NUXT_PUBLIC_API_URL` i `ARG NUXT_PUBLIC_WS_URL` a l'etapa builder i passar-los com a `ENV` per al build de Nuxt
- [x] 1.3 Afegir etapa `runner`: base `node:20-alpine` slim, copiar únicament `.output/` de l'etapa builder, exposar port `3000`, definir `CMD ["node", ".output/server/index.mjs"]`
- [x] 1.4 Verificar el build local: `docker build --build-arg NUXT_PUBLIC_API_URL=http://localhost/api --build-arg NUXT_PUBLIC_WS_URL=ws://localhost/ws -f frontend/Dockerfile .`

## 2. GitHub Secrets

- [x] 2.1 Verificar que els secrets `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY` existeixen al repositori de GitHub (ja creats per PE-45)
- [x] 2.2 Afegir els secrets `NUXT_PUBLIC_API_URL` i `NUXT_PUBLIC_WS_URL` al repositori de GitHub amb els valors de producció

## 3. Workflow de deploy del frontend

- [x] 3.1 Crear `.github/workflows/deploy-frontend.yml` amb triggers `workflow_run` (CI completat a `main`) i `workflow_dispatch`
- [x] 3.2 Afegir condició `if: ${{ github.event_name == 'workflow_dispatch' || github.event.workflow_run.conclusion == 'success' }}` al job
- [x] 3.3 Afegir pas `dorny/paths-filter@v3` per detectar canvis a `frontend/**` i `shared/**`
- [x] 3.4 Afegir pas `burnett01/rsync-deployments@7.0.1` per sincronitzar el repositori a `/opt/entrades/` (condicionat a path filter o `workflow_dispatch`)
- [x] 3.5 Afegir pas SSH (`appleboy/ssh-action@v1.0.3`) per executar `docker compose -f docker-compose.prod.yml up -d --build frontend` al VPS
- [x] 3.6 Afegir pas SSH final per executar `docker image prune -f`
- [x] 3.7 Verificar que cap secret apareix com a valor literal al fitxer YAML

## 4. Verificació

- [x] 4.1 Fer push d'un canvi de CSS al frontend a `main` i verificar que el workflow `deploy-frontend` s'activa i el frontend es redesplega
- [x] 4.2 Verificar que un push que canvia únicament `backend/` NO activa el deploy del frontend
- [x] 4.3 Verificar que els contenidors del backend (`node-service`, `laravel-service`) NO es reinicien durant el deploy del frontend
- [x] 4.4 Executar el workflow manualment via `workflow_dispatch` i verificar que el deploy s'executa sense errors

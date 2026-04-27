## 1. Dockerfile de producció del Laravel Service

- [x] 1.1 Crear `laravel-service/Dockerfile.prod` amb stage `builder` (composer:latest, `composer install --no-dev --optimize-autoloader`)
- [x] 1.2 Afegir stage `runtime` (php:8.4-cli-alpine) al `Dockerfile.prod`: copiar `vendor/` i codi de l'app des del builder
- [x] 1.3 Verificar que cap fitxer `.env` ni secret és copiat a la imatge (revisar `.dockerignore`)
- [x] 1.4 Build local de prova: `docker build -f laravel-service/Dockerfile.prod laravel-service/` i comprovar que finalitza sense errors
- [x] 1.5 Smoke test local: `docker run --rm -e APP_KEY=base64:test <image> php artisan --version` retorna sense error

## 2. Workflow de GitHub Actions

- [x] 2.1 Crear `.github/workflows/deploy-laravel.yml` amb triggers `workflow_run` (CI, branches: [main]) i `workflow_dispatch`
- [x] 2.2 Afegir condició global al job: `if: ${{ github.event_name == 'workflow_dispatch' || github.event.workflow_run.conclusion == 'success' }}`
- [x] 2.3 Implementar detecció de canvis a `src/backend/laravel-service/**` amb `dorny/paths-filter`
- [x] 2.4 Afegir step de login a GHCR: `docker/login-action` amb `registry: ghcr.io` i `secrets.GITHUB_TOKEN`
- [x] 2.5 Afegir step de build i push: `docker/build-push-action` amb `file: ./src/backend/laravel-service/Dockerfile.prod`, tag `ghcr.io/inspedralbes/prj-entrades-a20valzavvas-laravel:latest`
- [x] 2.6 Afegir step SSH al VPS: `appleboy/ssh-action` amb `host: ${{ secrets.VPS_HOST }}`, `username: ${{ secrets.VPS_USER }}`, `key: ${{ secrets.VPS_SSH_KEY }}`
- [x] 2.7 Configurar les comandes SSH: `docker compose pull laravel-service && docker compose up -d laravel-service`
- [x] 2.8 Verificar que cap secret apareix com a literal al fitxer YAML (revisió manual)

## 3. Configuració de GitHub Secrets

- [x] 3.1 Afegir secret `VPS_SSH_KEY` al repositori de GitHub (clau privada SSH)
- [x] 3.2 Confirmar que `VPS_HOST` i `VPS_USER` existeixen o afegir-los (compartits amb `deploy-backend.yml`)
- [x] 3.3 Afegir secret `LARAVEL_APP_KEY` (valor de `APP_KEY` del `.env` de producció)
- [x] 3.4 Afegir secret `JWT_SECRET` (si no existeix ja)

## 4. Configuració del VPS

- [x] 4.1 Verificar que el `docker-compose.prod.yml` té el servei `laravel-service` configurat amb `image:` per poder fer `docker compose pull`
- [x] 4.2 Assegurar que el servei `laravel-service` llegeix `APP_KEY`, `JWT_SECRET` i variables via `environment:` (ja configurat)
- [x] 4.3 Comprovar que el VPS té accés a GHCR: `docker login ghcr.io` amb token de lectura

## 5. Verificació end-to-end

- [x] 5.1 Executar el workflow manualment via `workflow_dispatch` i comprovar que tots els steps passen
- [x] 5.2 Verificar que `docker-entrypoint.sh` ha executat `php artisan migrate --force` en l'arrencada (logs del contenidor)
- [x] 5.3 Comprovar que `GET /api/health` retorna HTTP `200` al VPS en menys de 5 minuts
- [x] 5.4 Fer un push a `main` amb un canvi a `laravel-service/` i verificar que el deploy s'activa automàticament
- [x] 5.5 Fer un push a `main` amb canvis únicament a `frontend/` i verificar que el deploy-laravel es salta

## 1. Preparació de l'entorn CI

- [x] 1.1 Verificar que existeix el fitxer `.nvmrc` a l'arrel del monorepo amb la versió de Node correcta
- [x] 1.2 Verificar que `pnpm-lock.yaml` existeix i està actualitzat a l'arrel del monorepo
- [x] 1.3 Verificar que `pnpm lint` funciona localment sense errors (`pnpm run lint` a frontend i backend)
- [x] 1.4 Verificar que `pnpm type-check` (o equivalent) funciona localment sense errors

## 2. Creació del workflow de GitHub Actions

- [x] 2.1 Crear el directori `.github/workflows/` si no existeix
- [x] 2.2 Crear el fitxer `.github/workflows/ci.yml` amb `on: [push, pull_request]`
- [x] 2.3 Afegir el service container de PostgreSQL 16 al job (port 5432, db: `entrades`, user: `entrades`, password via env)
- [x] 2.4 Afegir el pas `actions/checkout@v4` com a primer pas del job
- [x] 2.5 Afegir el pas `actions/setup-node` amb `node-version-file: '.nvmrc'`
- [x] 2.6 Afegir el pas d'instal·lació de `pnpm` i `pnpm install --frozen-lockfile`

## 3. Passos de qualitat de codi

- [x] 3.1 Afegir el pas `pnpm lint` que executi el linter de tots els workspaces
- [x] 3.2 Afegir el pas de type-check del frontend (`pnpm --filter frontend type-check` o `vue-tsc --noEmit`)
- [x] 3.3 Afegir el pas de type-check del backend (`pnpm --filter backend type-check` o `tsc --noEmit`)

## 4. Passos d'execució de tests

- [x] 4.1 Afegir el pas de migració de la BD de CI (`pnpm --filter backend prisma migrate deploy` o `prisma db push`) amb la `DATABASE_URL` injectada
- [x] 4.2 Afegir la variable d'entorn `DATABASE_URL` al job apuntant al service container (no hardcodejada — usar `${{ env.DATABASE_URL }}` construïda a partir de secrets/env)
- [x] 4.3 Afegir el pas `pnpm --filter frontend test` per executar els tests de frontend
- [x] 4.4 Afegir el pas `pnpm --filter backend test` per executar els tests de backend (inclou concurrència)

## 5. Verificació local abans de fer push

- [x] 5.1 Executar `pnpm lint` localment i confirmar 0 errors
- [x] 5.2 Executar type-check localment i confirmar 0 errors
- [x] 5.3 Executar `pnpm --filter frontend test` localment i confirmar que tots els tests passen
- [x] 5.4 Executar `pnpm --filter backend test` localment (amb BD activa via Docker Compose) i confirmar que tots els tests passen, incloent el test de concurrència

## 6. Validació del workflow a GitHub

- [x] 6.1 Fer push del fitxer `ci.yml` i verificar que el workflow s'activa automàticament
- [x] 6.2 Confirmar que tots els passos del workflow passen (verd) al run inicial
- [x] 6.3 Verificar que el temps total d'execució és inferior a 5 minuts
- [x] 6.4 Configurar el workflow com a status check obligatori a la branca `main` (Settings → Branches → Branch protection rules)
- [x] 6.5 Crear una PR de prova amb un test trencat i verificar que el workflow marca `failure` i GitHub bloqueja el merge

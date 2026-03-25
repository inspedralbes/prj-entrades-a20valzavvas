## 1. Variables d'entorn i configuració base

- [x] 1.1 Crear `.env.example` a l'arrel amb les variables: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `DATABASE_URL`, `BACKEND_PORT=3001`, `FRONTEND_PORT=3000`
- [x] 1.2 Verificar que `.env` apareix al `.gitignore` arrel (afegir-lo si no hi és)
- [x] 1.3 Crear el fitxer `.env` local a partir de `.env.example` per a ús en desenvolupament

## 2. Dockerfile del backend

- [x] 2.1 Crear `backend/Dockerfile` amb imatge base Node.js LTS
- [x] 2.2 Afegir instal·lació de dependències via `pnpm install --frozen-lockfile`
- [x] 2.3 Afegir execució de `prisma generate` i `prisma migrate deploy` a l'script d'arrencada
- [x] 2.4 Exposar el port `3001` i definir `CMD` per arrencar NestJS

## 3. Dockerfile del frontend

- [x] 3.1 Crear `frontend/Dockerfile` amb imatge base Node.js LTS
- [x] 3.2 Afegir instal·lació de dependències i build de Nuxt 3 (`nuxi build`)
- [x] 3.3 Exposar el port `3000` i definir `CMD` per arrencar el servidor Nuxt (`node .output/server/index.mjs`)

## 4. docker-compose.yml

- [x] 4.1 Crear `docker-compose.yml` a l'arrel amb el servei `db` (PostgreSQL 16, port 5432, health check amb `pg_isready`)
- [x] 4.2 Afegir el servei `backend` amb `depends_on: db: condition: service_healthy`, variables d'entorn via `${VAR}` i build des de `backend/Dockerfile`
- [x] 4.3 Afegir el servei `frontend` amb `depends_on: backend`, variables d'entorn necessàries i build des de `frontend/Dockerfile`
- [x] 4.4 Afegir volum nomenat per a la persistència de les dades de PostgreSQL (`db-data`)
- [x] 4.5 Verificar que cap valor literal de contrasenya apareix al fitxer (revisió manual)

## 5. Verificació d'arrencada

- [x] 5.1 Executar `docker compose up --build` i confirmar que els tres serveis arrenquen sense errors
- [x] 5.2 Verificar que PostgreSQL és accessible a `localhost:5433` (5432 ocupat per PostgreSQL local; DB_PORT=5433 al .env)
- [x] 5.3 Verificar que el backend respon a `http://localhost:3001/api` (HTTP 404 — servidor actiu, sense endpoints encara)
- [x] 5.4 Verificar que el frontend és accessible a `http://localhost:3000` (HTTP 200)
- [x] 5.5 Executar `docker compose down` i confirmar que el volum de dades persisteix

## 6. Verificació de qualitat

- [x] 6.1 Executar `pnpm lint` des de l'arrel i confirmar que no hi ha errors
- [x] 6.2 Executar `pnpm type-check` des de l'arrel i confirmar que no hi ha errors TypeScript
- [x] 6.3 Executar `pnpm test` des de l'arrel i confirmar que tots els tests passen
- [x] 6.4 Executar `pnpm build` des de l'arrel i confirmar que compila sense errors

## Context

Actualment el monorepo no disposa d'un `docker-compose.yml` funcional. Cada desenvolupador ha d'iniciar PostgreSQL, el backend i el frontend manualment i gestionar les variables d'entorn per separat. Això és fràgil i no reproduïble.

El projecte és un monorepo pnpm amb tres workspaces JS: `frontend/` (Nuxt 3, port 3000), `backend/` (NestJS, port 3001) i `shared/` (tipus TypeScript). La base de dades és PostgreSQL 16.

## Goals / Non-Goals

**Goals:**
- Proporcionar un `docker-compose.yml` a l'arrel que arranqui els tres serveis (`db`, `backend`, `frontend`) amb un sol `docker compose up --build`
- Garantir que totes les credencials provenen de `.env` (mai hardcoded)
- Documentar totes les variables necessàries a `.env.example`
- El servei `backend` espera que `db` estigui sa abans d'arrencar (health check)

**Non-Goals:**
- Nginx / proxy invers (no requerit per PE-11 criteris d'acceptació)
- Entorn de producció o staging
- CI/CD (cobert per EP-08)
- Hot-reload inside containers (els Dockerfiles usaran la imatge de producció/dev sense volums de codi)

## Decisions

### Decisió 1: Un únic `docker-compose.yml` a l'arrel (no `docker-compose.override.yml`)

**Alternativa:** Usar `docker-compose.yml` + `docker-compose.override.yml` per separar dev de prod.

**Rationale:** Per a US-01-02 (entorn local), un sol fitxer és suficient i redueix la complexitat. Si en el futur cal un entorn de producció, s'afegirà un fitxer separat.

### Decisió 2: Health check al servei `db` + `depends_on` amb `condition: service_healthy`

**Alternativa:** Usar `depends_on` simple (sense condició) i deixar que el backend gestioni els reintents de connexió.

**Rationale:** NestJS amb Prisma pot fallar en l'arrencada si PostgreSQL no és accessible. Un health check evita condicions de carrera sense necessitat de lògica de reintent al codi de l'aplicació.

### Decisió 3: Variables d'entorn via fitxer `.env` a l'arrel (no `env_file` per servei)

**Alternativa:** Un `.env` per servei (e.g. `backend/.env`, `frontend/.env`).

**Rationale:** Docker Compose llegeix automàticament el `.env` de l'arrel. Centralitzar les variables simplifica la configuració i evita duplicació. Els workspaces individuals poden tenir els seus propis `.env` per a execució local sense Docker.

### Decisió 4: Dockerfiles independents per servei a les seves carpetes

**Alternativa:** Dockerfile únic multi-stage a l'arrel.

**Rationale:** Cada servei té el seu propi cicle de vida i dependències. Dockerfiles per separat permeten builds independents i faciliten el debugging. Es creen a `backend/Dockerfile` i `frontend/Dockerfile`.

## Risks / Trade-offs

- **[Risc] Sincronització de `.env.example` amb variables reals** → Mitigació: la revisió de PR ha de verificar que qualsevol nova variable s'afegeixi a `.env.example`.
- **[Risc] Hot-reload no disponible dins dels contenidors** → Mitigació: documentar que per a development actiu es pot usar `pnpm dev` directament; Docker Compose és per a validació d'integració.
- **[Trade-off] Build time llarg amb `--build`** → Acceptable per a un entorn local; es pot millorar amb layer caching en un futur.

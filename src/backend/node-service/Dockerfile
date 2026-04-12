# Build context: repository root (docker compose sets context: .)
FROM node:20-alpine

# Enable corepack for pnpm
RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

# ── Layer: workspace manifests (cached unless deps change) ─────────────────
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY src/shared/package.json ./src/shared/
COPY src/backend/node-service/package.json ./src/backend/node-service/
# Frontend package.json is needed so pnpm resolves the workspace correctly
COPY src/frontend/package.json ./src/frontend/

# ── Install all workspace dependencies ────────────────────────────────────
RUN pnpm install --frozen-lockfile

# ── Layer: source code ────────────────────────────────────────────────────
COPY src/shared/ ./src/shared/
COPY src/backend/node-service/ ./src/backend/node-service/

# ── Build shared package first (produces dist/types/*.js for runtime) ──────
RUN pnpm --filter shared build

# ── Build NestJS ──────────────────────────────────────────────────────────
# Use pnpm filter from workspace root so hoisted node_modules are on the PATH
RUN pnpm --filter node-service build

WORKDIR /app/src/backend/node-service

EXPOSE 3001

RUN chmod +x docker-entrypoint.sh
ENTRYPOINT ["./docker-entrypoint.sh"]

# Build context: repository root (docker compose sets context: .)
FROM node:20-alpine

# Enable corepack for pnpm
RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

# ── Layer: workspace manifests (cached unless deps change) ─────────────────
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY src/shared/package.json ./src/shared/
COPY src/frontend/package.json ./src/frontend/
# Backend package.json is needed so pnpm resolves the workspace correctly
COPY src/backend/node-service/package.json ./src/backend/node-service/

# ── Install all workspace dependencies ────────────────────────────────────
RUN pnpm install --frozen-lockfile

# ── Layer: source code ────────────────────────────────────────────────────
COPY src/shared/ ./src/shared/
COPY src/frontend/ ./src/frontend/

# ── Build Nuxt 3 ──────────────────────────────────────────────────────────
# Use pnpm filter from workspace root so hoisted node_modules are on the PATH
RUN pnpm --filter frontend build

WORKDIR /app/src/frontend

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]

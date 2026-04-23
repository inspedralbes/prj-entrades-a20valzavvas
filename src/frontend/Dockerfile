# Build context: repository root (docker compose sets context: .)

# ── Stage 1: builder ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

ARG NUXT_PUBLIC_WS_URL
ARG NUXT_PUBLIC_API_URL

ENV NUXT_PUBLIC_WS_URL=${NUXT_PUBLIC_WS_URL}
ENV NUXT_PUBLIC_API_URL=${NUXT_PUBLIC_API_URL}

RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

# Layer: workspace manifests (cached unless deps change)
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY src/shared/package.json ./src/shared/
COPY src/frontend/package.json ./src/frontend/
# Backend package.json needed so pnpm resolves the workspace graph
COPY src/backend/node-service/package.json ./src/backend/node-service/

RUN pnpm install --frozen-lockfile

# Layer: source code
COPY src/shared/ ./src/shared/
COPY src/frontend/ ./src/frontend/

RUN pnpm --filter frontend build

# ── Stage 2: runner ───────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/src/frontend/.output ./

EXPOSE 3000

CMD ["node", "server/index.mjs"]

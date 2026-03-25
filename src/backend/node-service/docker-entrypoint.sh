#!/bin/sh
set -e

# Run Prisma setup when the client is available (configured in a later US)
if command -v prisma > /dev/null 2>&1; then
  echo "[entrypoint] Running prisma generate..."
  prisma generate
  echo "[entrypoint] Running prisma migrate deploy..."
  prisma migrate deploy
fi

echo "[entrypoint] Starting NestJS server..."
exec node dist/main

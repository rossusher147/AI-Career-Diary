FROM node:20-bookworm-slim

WORKDIR /app

ENV NPM_CONFIG_AUDIT=false \
    NPM_CONFIG_FUND=false \
    NPM_CONFIG_STRICT_SSL=false \
    NPM_CONFIG_UPDATE_NOTIFIER=false

COPY src/frontend/package*.json ./
COPY src/frontend ./

EXPOSE 5173

CMD ["sh", "-c", "set -eu; if [ ! -f node_modules/.package-lock.json ] || [ package-lock.json -nt node_modules/.package-lock.json ] || [ ! -f node_modules/vite/bin/vite.js ]; then npm ci --include=optional --no-audit --no-fund; fi; exec npm run dev -- --host 0.0.0.0"]

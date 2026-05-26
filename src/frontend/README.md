# AI Career Diary Frontend

React + Vite + TypeScript frontend for DD-001.

## Environment

Copy `.env.example` values into your environment if running outside Docker:

```text
VITE_API_BASE_URL=http://localhost:8000
VITE_KEYCLOAK_URL=http://localhost:8080
VITE_KEYCLOAK_REALM=aicd
VITE_KEYCLOAK_CLIENT_ID=aicd-web
```

`VITE_AUTH_MODE=mock` and `VITE_API_MODE=mock` are available only in Vite development mode for UI checks when Keycloak or the backend are not running. Production builds always use Keycloak and the configured API.

## Scripts

```bash
npm install
npm run dev
npm run build
npm run typecheck
```

The Docker Compose service exposes the app at `http://localhost:5173`.

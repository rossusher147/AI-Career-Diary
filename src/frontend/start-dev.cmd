@echo off
set VITE_API_BASE_URL=http://localhost:8000
set VITE_KEYCLOAK_URL=http://localhost:8080
set VITE_KEYCLOAK_REALM=aicd
set VITE_KEYCLOAK_CLIENT_ID=aicd-web
node_modules\.bin\vite.cmd --host 127.0.0.1 --port 5173 --strictPort

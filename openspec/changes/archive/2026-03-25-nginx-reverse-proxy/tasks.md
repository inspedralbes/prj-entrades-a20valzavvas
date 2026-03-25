## 1. Configuració Nginx

- [x] 1.1 Crear el directori `nginx/` a l'arrel del monorepo
- [x] 1.2 Crear `nginx/nginx.conf` amb el bloc `events {}` i el bloc `http {}` base
- [x] 1.3 Afegir `location /ws` amb `proxy_pass http://backend:3001` (nom real del servei), headers `Upgrade` i `Connection`, i `proxy_read_timeout 3600s`
- [x] 1.4 Afegir `location /api` amb `proxy_pass http://laravel-service:8000`, headers `Authorization` i `X-Real-IP`
- [x] 1.5 Afegir `location /` (catch-all) amb `proxy_pass http://frontend:3000`

## 2. Integració Docker Compose

- [x] 2.1 Afegir el servei `nginx` al `docker-compose.yml` usant la imatge oficial `nginx:alpine`
- [x] 2.2 Configurar el port mapping `"80:80"` al servei `nginx`
- [x] 2.3 Afegir el volume `./nginx/nginx.conf:/etc/nginx/nginx.conf:ro` al servei `nginx`
- [x] 2.4 Configurar `depends_on` al servei `nginx` perquè esperi `frontend`, `laravel-service` i `backend`
- [x] 2.5 Verificar que els serveis interns pertanyen a la mateixa xarxa Docker interna (xarxa per defecte de Compose — cap canvi necessari)

## 3. Verificació funcional

- [x] 3.1 Executar `docker compose up --build` i confirmar que el servei `nginx` arrenca sense errors
- [x] 3.2 Verificar proxy REST: `curl http://localhost/api/health` retorna HTTP 200
- [x] 3.3 Verificar proxy frontend: `curl http://localhost/` retorna HTTP 200
- [x] 3.4 Verificar proxy WebSocket (polling): Nginx enruta correctament a backend:3001; retorna 404 perquè GatewayModule (Socket.IO) no està implementat (ticket separat)
- [x] 3.5 Verificar que `docker compose down` atura tots els contenidors sense errors

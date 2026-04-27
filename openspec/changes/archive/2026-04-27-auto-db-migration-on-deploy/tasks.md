## 1. Entrypoint Script

- [x] 1.1 Crear `backend/laravel-service/docker-entrypoint.sh` amb crida a `php artisan migrate --force` i, si exit code 0, `php artisan serve --host=0.0.0.0 --port=8000`
- [x] 1.2 Afegir `set -e` a l'script per garantir fail-fast en qualsevol error
- [x] 1.3 Fer el fitxer executable amb `chmod +x backend/laravel-service/docker-entrypoint.sh`

## 2. Dockerfile

- [x] 2.1 Copiar `docker-entrypoint.sh` a `/entrypoint.sh` dins la imatge al `Dockerfile` de `backend/laravel-service/`
- [x] 2.2 Substituir la instrucció `CMD` per `ENTRYPOINT ["sh", "/entrypoint.sh"]` al `Dockerfile`
- [x] 2.3 Verificar que el `Dockerfile` no conté cap crida a `db:seed` ni `migrate:fresh`

## 3. Verificació Local

- [x] 3.1 Executar `docker build -t laravel-service ./backend/laravel-service` i verificar que la imatge compila sense errors
- [x] 3.2 Executar `docker compose up laravel-service` i verificar que `migrate --force` s'executa als logs abans que `php artisan serve`
- [x] 3.3 Verificar que `GET http://localhost:8000/api/health` retorna HTTP 200 després de l'inici

## 4. Tests d'acceptació

- [x] 4.1 Verificar manualment el scenario de BD no accessible: aturar el contenidor de PostgreSQL i confirmar que `laravel-service` atura amb error sense arrencar el servidor
- [x] 4.2 Verificar que afegir una nova migració Eloquent i reiniciar el contenidor aplica la migració automàticament

## 5. Qualitat

- [x] 5.1 Verificar que `docker-entrypoint.sh` no conté credencials hardcoded
- [x] 5.2 Comprovar que el fitxer apareix al repositori amb permisos d'execució (`git ls-files --stage backend/laravel-service/docker-entrypoint.sh`)

## Why

Els usuaris registrats necessiten poder autenticar-se per obtenir un token JWT vàlid que els permeti accedir a les funcionalitats protegides de la plataforma. Ara mateix el Laravel Service té Sanctum configurat i el model `User` amb `HasApiTokens`, però no exposa cap endpoint de login. Jira: PE-49.

## What Changes

- Nou endpoint `POST /api/auth/login` al Laravel Service accessible sense autenticació
- Validació de `email` i `password` al request
- Verificació de credencials amb `Hash::check` contra la BD
- Retorn de `{ token, user: { id, name, email, role } }` amb codi `200` en cas d'èxit
- Retorn de `{ message: "Credencials incorrectes" }` amb codi `401` en cas de credencials incorrectes
- Tests de feature que cobreixen el cas d'èxit i el cas de credencials incorrectes

## Capabilities

### New Capabilities

- `auth-login`: Endpoint `POST /api/auth/login` que autentica un usuari registrat i retorna un token Sanctum i les dades bàsiques de l'usuari.

### Modified Capabilities

- `user-registration`: S'afegeix cobertura de tests indirecta — el `AuthController` passa a gestionar tant el registre com el login, pel que el test de login reutilitza la factory d'usuaris del test de registre.

## Impact

- **Mòdul afectat**: `laravel-service` — `AuthController`, `routes/api.php`
- **Dependència**: `laravel-sanctum` (Sanctum configurat, taula `personal_access_tokens` existent, model `User` amb `HasApiTokens`)
- **API**: Nou endpoint públic `POST /api/auth/login` accessible via Nginx proxy a `/api/auth/login`
- **Tests**: Nous tests de feature a `tests/Feature/AuthLoginTest.php` amb `RefreshDatabase`
- **Cap canvi a Prisma, NestJS, frontend ni shared types**

### Non-goals

- Rate limiting (fora d'abast en context acadèmic)
- Refresh tokens o revocació de tokens
- Autenticació de l'administrador (usa `X-Admin-Token` per header, mòdul separat)

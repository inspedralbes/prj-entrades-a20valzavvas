## Context

El Laravel Service ja disposa d'un `AuthController` amb el mètode `register` i una ruta `POST /api/auth/register`. Sanctum està configurat, el model `User` té `HasApiTokens` i la taula `personal_access_tokens` existeix. L'endpoint de login s'afegeix al mateix controlador seguint el mateix patró que el registre.

El projecte utilitza Laravel feature tests amb `RefreshDatabase`. Hi ha tests existents a `tests/Feature/` (registre d'usuari) que serveixen de referència per als nous tests de login.

## Goals / Non-Goals

**Goals:**
- Afegir el mètode `login` a `AuthController` que verifiqui credencials amb `Hash::check` i retorni un token Sanctum
- Registrar la ruta `POST /api/auth/login` a `routes/api.php`
- Crear `LoginRequest` amb validació de `email` i `password`
- Cobrir amb tests de feature el cas d'èxit (200) i credencials incorrectes (401)

**Non-Goals:**
- Rate limiting
- Refresh tokens o revocació
- Autenticació via OAuth o SSO
- Canvis a NestJS, frontend o shared types

## Decisions

### Reutilitzar `AuthController` existent

**Decisió**: afegir `login()` al `AuthController` ja existent en lloc de crear un controlador nou.

**Raó**: El patró del projecte agrupa totes les accions d'autenticació (`register`, `login`) al mateix controlador. Crear un segon controlador per a una única acció seria sobre-enginyeria sense benefici.

**Alternativa descartada**: `LoginController` independent — descartada per fragmentació innecessària.

---

### `LoginRequest` com a Form Request separat

**Decisió**: crear `app/Http/Requests/LoginRequest.php` en lloc de validar inline al controlador.

**Raó**: Manté la mateixa convenció que `RegisterRequest` ja existent. La validació declarativa a Form Requests és el patró Laravel i facilita els tests.

---

### Resposta 401 amb `response()->json()`

**Decisió**: retornar `401` directament amb `response()->json(['message' => 'Credencials incorrectes'], 401)` en lloc de llançar una excepció `AuthenticationException`.

**Raó**: L'endpoint és una API JSON, no una aplicació web amb redireccions. El retorn directe és més explícit i evita el comportament per defecte de Laravel que redirigeix a `/login` per a excepcions d'autenticació.

## Risks / Trade-offs

- **[Risc] Token anterior no revocat en fer login** → El login crea un token nou però no invalida tokens anteriors del mateix usuari. Mitigació: acceptable en context acadèmic; el TTL configurat a `SANCTUM_TOKEN_TTL` limita la vida dels tokens.

- **[Trade-off] Missatge d'error genèric** → "Credencials incorrectes" no distingeix entre email no trobat i contrasenya incorrecta. Millora la seguretat evitant user enumeration però és menys informatiu per a l'usuari.

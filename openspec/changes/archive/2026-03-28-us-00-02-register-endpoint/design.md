## Context

El Laravel Service ja té Sanctum configurat (US-00-01 / PE-47) i el model `User` amb `HasApiTokens`. La taula `users` existeix amb camps `name`, `email`, `password` i `role`. L'endpoint `POST /api/auth/register` és el primer punt d'entrada autenticat de la plataforma. El proxy Nginx ja exposa `/api/*` cap al Laravel Service.

## Goals / Non-Goals

**Goals:**
- Crear `AuthController@register` que validi el payload, creï l'usuari i retorni un token Sanctum + dades de l'usuari
- Crear `RegisterRequest` (FormRequest) per encapsular tota la lògica de validació
- Registrar la ruta pública `POST /api/auth/register` a `routes/api.php`
- Garantir tests unitaris per al controlador i el form request

**Non-Goals:**
- Verificació d'email (fora d'abast en context acadèmic)
- Login / logout (US posteriors)
- Hash manual de la contrasenya (Laravel ho fa per defecte via `bcrypt`)
- Gestió de rols des de l'endpoint (sempre `comprador`)

## Decisions

**1. FormRequest per a la validació**
S'utilitza `RegisterRequest extends FormRequest` en lloc de validar dins del controlador. Motiu: millora la llegibilitat, separa responsabilitats i facilita els tests unitaris de les regles de validació de manera independent.

**2. `createToken` de Sanctum vs JWT manual**
S'usa `$user->createToken('auth-token')->plainTextToken` de Sanctum. Alternativa descartada: generar un JWT manualment amb `firebase/php-jwt`. Motiu: Sanctum ja és la dependència declarada (US-00-01) i la seva API és consistent amb els endpoints futurs de login.

**3. Codi de resposta 201**
Es retorna HTTP `201 Created` en registre exitós. Alternativa: `200 OK`. Motiu: semàntiques REST correctes — es crea un nou recurs.

**4. Estructura de la resposta**
```json
{
  "token": "<plaintext_token>",
  "user": { "id", "name", "email", "role" }
}
```
Motiu: inclou totes les dades que el client necessita per iniciar una sessió sense fer un segon request.

## Risks / Trade-offs

- **[Risc] Tests que depenen de la BD** → Mitigació: usar `RefreshDatabase` trait de Laravel en tests d'integració; mockejar `User::create` en tests unitaris purs si cal.
- **[Trade-off] `plainTextToken` exposat a la resposta** → El token Sanctum és d'un sol ús de lectura; no es guarda en clar a la BD (Sanctum guarda el hash). Acceptable per a aquest context acadèmic.

## Migration Plan

1. Crear `app/Http/Requests/RegisterRequest.php`
2. Crear o modificar `app/Http/Controllers/AuthController.php` (mètode `register`)
3. Afegir ruta a `routes/api.php`: `Route::post('/auth/register', [AuthController::class, 'register'])`
4. Executar `php artisan route:list` per verificar
5. Afegir tests a `tests/Feature/Auth/RegisterTest.php`

Rollback: eliminar la ruta i el mètode del controlador (cap migració de BD nova implicada).

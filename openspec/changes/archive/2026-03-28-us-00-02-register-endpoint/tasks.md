## 1. Form Request de validació

- [x] 1.1 Crear `app/Http/Requests/RegisterRequest.php` al Laravel Service
- [x] 1.2 Definir regles de validació: `name` (required), `email` (required, email, unique:users), `password` (required, min:8, confirmed)
- [x] 1.3 Configurar missatges d'error en anglès per als camps validats

## 2. Controlador d'autenticació

- [x] 2.1 Crear (o modificar si existeix) `app/Http/Controllers/AuthController.php`
- [x] 2.2 Implementar el mètode `register(RegisterRequest $request)`: crear usuari amb `role = comprador`, generar token Sanctum i retornar `{ token, user }` amb codi `201`
- [x] 2.3 Assegurar que la contrasenya s'emmagatzema com a hash (via `bcrypt` / cast de Laravel per defecte)

## 3. Ruta pública

- [x] 3.1 Afegir `Route::post('/auth/register', [AuthController::class, 'register'])` a `routes/api.php` sense middleware d'autenticació
- [x] 3.2 Verificar amb `php artisan route:list` que la ruta apareix correctament

## 4. Tests de feature

- [x] 4.1 Crear `tests/Feature/Auth/RegisterTest.php` amb `RefreshDatabase`
- [x] 4.2 Test: registre correcte → resposta `201` amb `token` i `user`, usuari a la BD (`assertDatabaseHas`)
- [x] 4.3 Test: email duplicat → resposta `422` amb error al camp `email`
- [x] 4.4 Test: payload buit → resposta `422` amb errors a `name`, `email` i `password`
- [x] 4.5 Test: `password_confirmation` que no coincideix → resposta `422`
- [x] 4.6 Test: contrasenya de menys de 8 caràcters → resposta `422`

## 5. Verificació final

- [x] 5.1 Executar la suite de tests del Laravel Service i confirmar que tots passen
- [x] 5.2 Verificar manualment l'endpoint amb `curl` o Postman contra l'entorn local (Docker Compose)
- [x] 5.3 Comprovar que `pnpm lint` no reporta errors (si s'aplica al Laravel Service)

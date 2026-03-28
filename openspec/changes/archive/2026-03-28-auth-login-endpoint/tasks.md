## 1. Form Request de validació

- [x] 1.1 Crear `app/Http/Requests/LoginRequest.php` amb regles `email` (required, email) i `password` (required, string)
- [x] 1.2 Verificar que `LoginRequest` retorna `422` amb payload buit via test manual o tinker

## 2. Implementació del mètode login

- [x] 2.1 Afegir mètode `login(LoginRequest $request): JsonResponse` a `AuthController`
- [x] 2.2 Cercar l'usuari per email amb `User::where('email', $request->email)->first()`
- [x] 2.3 Verificar la contrasenya amb `Hash::check` i retornar `401` si falla
- [x] 2.4 Generar token amb `$user->createToken('auth-token')->plainTextToken`
- [x] 2.5 Retornar `200` amb `{ token, user: { id, name, email, role } }`

## 3. Registre de la ruta

- [x] 3.1 Afegir `Route::post('/auth/login', [AuthController::class, 'login'])` a `routes/api.php`

## 4. Tests de feature

- [x] 4.1 Crear `tests/Feature/AuthLoginTest.php` amb `use RefreshDatabase`
- [x] 4.2 Escriure test `test_login_with_valid_credentials_returns_200_and_token`
- [x] 4.3 Escriure test `test_login_with_wrong_password_returns_401`
- [x] 4.4 Escriure test `test_login_with_unknown_email_returns_401`
- [x] 4.5 Escriure test `test_login_with_missing_fields_returns_422`

## 5. Verificació

- [x] 5.1 Executar `php artisan test --filter AuthLoginTest` i verificar que tots els tests passen
- [x] 5.2 Verificar manualment `POST /api/auth/login` via curl o Postman a través del proxy Nginx
- [x] 5.3 Verificar que no hi ha credencials hardcoded als fitxers nous

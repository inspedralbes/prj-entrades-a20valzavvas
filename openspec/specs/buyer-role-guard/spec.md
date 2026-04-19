# Capability: Buyer Role Guard

## Purpose

Middleware Laravel `EnsureBuyer` que impedeix que usuaris amb rol `admin` accedeixin a les rutes de compra i reserva. Garanteix la separació de rols entre administradors i compradors.

---

## Requirements

### Requirement: EnsureBuyer middleware bloqueja admins a POST /api/orders

El sistema SHALL disposar d'un middleware Laravel `EnsureBuyer` a `app/Http/Middleware/EnsureBuyer.php` que comprovi que `$request->user()->role === 'comprador'`. Si l'usuari autenticat té `role = 'admin'` (o qualsevol rol diferent de `comprador`), el middleware SHALL retornar `403 Forbidden` amb el missatge `{ "message": "El rol admin no pot realitzar compres" }` i no processar la petició. El middleware SHALL estar registrat com a middleware nomenat `buyer` i aplicat juntament amb `auth:sanctum` a les rutes `POST /api/orders` i `POST /api/seats/{seatId}/reserve`.

#### Scenario: Admin intenta confirmar una compra

- **GIVEN** un usuari autenticat amb `role = 'admin'`
- **WHEN** fa `POST /api/orders` amb `{ nom, email }`
- **THEN** el sistema retorna HTTP 403 amb `{ "message": "El rol admin no pot realitzar compres" }`
- **THEN** no es crea cap `Order` a la base de dades

#### Scenario: Comprador confirma una compra (happy path no afectat)

- **GIVEN** un usuari autenticat amb `role = 'comprador'`
- **WHEN** fa `POST /api/orders` amb reserves actives vàlides
- **THEN** el middleware deixa passar la petició al controlador i es processa l'ordre

#### Scenario: Usuari no autenticat intenta confirmar una compra

- **GIVEN** una petició sense token Sanctum
- **WHEN** fa `POST /api/orders`
- **THEN** el sistema retorna HTTP 401 (interceptat pel middleware `auth:sanctum` previ)

#### Scenario: Testabilitat — EnsureBuyer bloqueja admin a POST /api/orders

- **WHEN** s'executa el test de feature `actingAs($adminUser)->postJson('/api/orders', [...])`
- **THEN** la resposta és 403 amb missatge `"El rol admin no pot realitzar compres"` i `Order::count()` és 0

---

### Requirement: EnsureBuyer middleware bloqueja admins a POST /api/seats/{seatId}/reserve

El sistema SHALL aplicar el middleware `buyer` a la ruta `POST /api/seats/{seatId}/reserve`, impedint que un usuari amb `role = 'admin'` pugui reservar seients temporalment.

#### Scenario: Admin intenta reservar un seient

- **GIVEN** un usuari autenticat amb `role = 'admin'`
- **WHEN** fa `POST /api/seats/{seatId}/reserve`
- **THEN** el sistema retorna HTTP 403 amb `{ "message": "El rol admin no pot realitzar compres" }`
- **THEN** el seient manté l'estat `DISPONIBLE` i no es crea cap `Reservation`

#### Scenario: Comprador reserva un seient (happy path no afectat)

- **GIVEN** un usuari autenticat amb `role = 'comprador'`
- **WHEN** fa `POST /api/seats/{seatId}/reserve` i el seient és disponible
- **THEN** el middleware deixa passar la petició i es crea la reserva temporal

#### Scenario: Testabilitat — EnsureBuyer bloqueja admin a POST /api/seats/{seatId}/reserve

- **WHEN** s'executa el test de feature `actingAs($adminUser)->postJson('/api/seats/{seatId}/reserve')`
- **THEN** la resposta és 403 i `Reservation::count()` és 0

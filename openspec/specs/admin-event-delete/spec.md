## Purpose

Capacitat de l'administradora per eliminar un event del panell d'administració mitjançant l'endpoint `DELETE /api/admin/events/:id` al backend Laravel.

## Requirements

### Requirement: Endpoint DELETE /api/admin/events/:id elimina un event sense reserves actives

El sistema SHALL exposar `DELETE /api/admin/events/:id` al backend Laravel, protegit per `auth:sanctum` i el middleware `admin`. Si l'event existeix i no té reserves actives (`Reservation.expires_at > now()`) ni `OrderItem` associats als seus seients, SHALL eliminar l'event i retornar `204 No Content`. L'eliminació SHALL propagar-se en cascada a les `price_categories` i `seats` associades.

#### Scenario: Eliminació exitosa d'un event sense reserves

- **GIVEN** que l'administradora envia `DELETE /api/admin/events/:id` amb header `Authorization: Bearer <token>` vàlid
- **GIVEN** l'event existeix i no té reserves actives ni `OrderItem` associats
- **WHEN** s'envia la petició
- **THEN** la resposta té status `204 No Content`
- **THEN** l'event ja no existeix a la BD
- **THEN** les `price_categories` i `seats` associades han estat eliminades en cascada

#### Scenario: Rebuig si l'event té reserves actives

- **GIVEN** que l'administradora envia `DELETE /api/admin/events/:id` amb token vàlid
- **GIVEN** existeix almenys una `Reservation` amb `expires_at > now()` associada a un seient d'aquest event
- **WHEN** s'envia la petició
- **THEN** la resposta té status `422 Unprocessable Entity`
- **THEN** el cos JSON conté `{ "message": "has_active_reservations_or_orders" }`
- **THEN** l'event NO ha estat eliminat

#### Scenario: Rebuig si l'event té compres (OrderItem)

- **GIVEN** que l'administradora envia `DELETE /api/admin/events/:id` amb token vàlid
- **GIVEN** existeix almenys un `OrderItem` associat a un seient d'aquest event
- **WHEN** s'envia la petició
- **THEN** la resposta té status `422 Unprocessable Entity`
- **THEN** el cos JSON conté `{ "message": "has_active_reservations_or_orders" }`
- **THEN** l'event NO ha estat eliminat

#### Scenario: Retorna 404 per event inexistent

- **GIVEN** que l'id de la URL no correspon a cap event existent
- **WHEN** l'administradora envia `DELETE /api/admin/events/:id` amb token vàlid
- **THEN** la resposta té status `404 Not Found`

#### Scenario: Retorna 401 sense autenticació

- **GIVEN** que no s'inclou el header `Authorization`
- **WHEN** s'envia `DELETE /api/admin/events/:id`
- **THEN** la resposta té status `401 Unauthorized`

#### Scenario: Retorna 403 amb rol comprador

- **GIVEN** un usuari autenticat amb rol `comprador`
- **WHEN** fa `DELETE /api/admin/events/:id` amb el seu JWT vàlid
- **THEN** la resposta té status `403 Forbidden`

#### Scenario: Testabilitat del controlador destroy

- **GIVEN** un entorn de test Laravel amb BD de test i les migrations aplicades
- **WHEN** s'executa el test de feature de `AdminEventController@destroy`
- **THEN** tots els tests passen (204 en èxit, 404 per inexistent, 422 per reserves actives, 422 per OrderItem)

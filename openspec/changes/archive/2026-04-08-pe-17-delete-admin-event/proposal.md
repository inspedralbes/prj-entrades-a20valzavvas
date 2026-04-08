## Why

L'administradora necessita poder eliminar events que no s'hagin de celebrar. Sense l'endpoint de supressió (`DELETE /api/admin/events/:id`), l'únic recurs és accedir directament a la base de dades. Jira: PE-17 (US-02-04).

## What Changes

- Nou endpoint `DELETE /api/admin/events/:id` al backend Laravel, protegit per `auth:sanctum` i middleware `admin`.
- Si l'event té reserves actives (`Reservation` no expirada) o `OrderItem` associats, l'eliminació es rebutja amb `422 Unprocessable Entity`.
- Si no hi ha reserves actives ni compres, s'elimina l'event (cascade a `price_categories` i `seats`).
- Retorna `404 Not Found` si l'event no existeix.
- Botó "Eliminar" a la pàgina de llistat d'events del frontend (`/admin/events`) amb confirmació modal i feedback d'error si el backend retorna `422`.

## Capabilities

### New Capabilities

- `admin-event-delete`: Cobreix el comportament de l'endpoint `DELETE /api/admin/events/:id` (422 per reserves actives, 204 en èxit, 404 per event inexistent) i la interacció frontend del botó d'eliminació a la llista d'events admin.

### Modified Capabilities

- `admin-events-list`: S'afegeix l'acció d'eliminació (botó + modal de confirmació) a la pàgina `/admin/events`.

## Impact

- **Backend (Laravel)**: `AdminEventController` (nou mètode `destroy`), `AdminEventService` (nova lògica de guarda per reserves actives i eliminació en cascada). Nova ruta `Route::delete('/events/{id}', ...)` al grup `admin` de `routes/api.php`.
- **DB**: eliminació en cascada de `price_categories` i `seats` gràcies a les FK amb `onDelete('cascade')`. No cal migració nova.
- **Frontend (Nuxt 3)**: la pàgina `pages/admin/events/index.vue` afegeix botó "Eliminar" per event, modal de confirmació i gestió de l'error `422`.
- **Testing**: tests de feature per a `AdminEventController@destroy` (Pest/PHPUnit) i test de component per al modal de confirmació i el feedback d'error.

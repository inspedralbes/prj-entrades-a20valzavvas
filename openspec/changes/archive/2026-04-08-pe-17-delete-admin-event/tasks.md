## 1. Backend — Ruta i lògica de negoci

- [x] 1.1 Registrar la ruta `Route::delete('/events/{id}', [AdminEventController::class, 'destroy'])` al grup `admin` de `routes/api.php`
- [x] 1.2 Afegir el mètode `destroy(string $id): JsonResponse` a `AdminEventController`
- [x] 1.3 Afegir el mètode `deleteEvent(string $id): void` a `AdminEventService` amb la lògica de guarda per reserves actives i `OrderItem`
- [x] 1.4 Implementar la comprovació `Reservation::where('expires_at', '>', now())->whereHas('seat.priceCategory', fn($q) => $q->where('event_id', $id))->exists()`
- [x] 1.5 Implementar la comprovació `OrderItem::whereHas('seat.priceCategory', fn($q) => $q->where('event_id', $id))->exists()`
- [x] 1.6 Si hi ha reserves actives o OrderItems, llançar `RuntimeException('has_active_reservations_or_orders')` i retornar `422` al controlador
- [x] 1.7 Si no hi ha impediments, executar `$event->delete()` (cascade sobre `price_categories` i `seats`)
- [x] 1.8 Retornar `response()->noContent()` (`204`) en èxit

## 2. Backend — Tests de feature (Pest/PHPUnit)

- [x] 2.1 Afegir test de feature `AdminEventController@destroy` a `tests/Feature/Admin/AdminEventControllerTest.php` (o fitxer equivalent)
- [x] 2.2 Test: `DELETE /api/admin/events/:id` amb event sense reserves → `204` i event eliminat de BD
- [x] 2.3 Test: `DELETE /api/admin/events/:id` amb reserves actives → `422` i event NO eliminat
- [x] 2.4 Test: `DELETE /api/admin/events/:id` amb OrderItems → `422` i event NO eliminat
- [x] 2.5 Test: `DELETE /api/admin/events/:id` amb id inexistent → `404`
- [x] 2.6 Test: `DELETE /api/admin/events/:id` sense token → `401`
- [x] 2.7 Test: `DELETE /api/admin/events/:id` amb rol `comprador` → `403`
- [x] 2.8 Executar tests backend: `php artisan test` (o `./vendor/bin/pest`)

## 3. Frontend — Modal de confirmació

- [x] 3.1 Afegir botó "Eliminar" a cada fila de la llista d'events a `pages/admin/events/index.vue`
- [x] 3.2 Implementar el modal de confirmació (state reactiu `deleteModal: { open, eventId, eventName, error }`)
- [x] 3.3 Implementar la funció `confirmDelete()` que crida `DELETE /api/admin/events/:id` usant `useAuth()` per incloure el token JWT
- [x] 3.4 En resposta `204`: eliminar l'event de la llista local (reactiu, sense `navigateTo`) i tancar el modal
- [x] 3.5 En resposta `422`: mostrar missatge d'error dins el modal "No es pot eliminar: l'event té reserves actives o compres associades"
- [x] 3.6 Botó "Cancel·lar" tanca el modal sense fer cap petició

## 4. Frontend — Tests de component (Vitest + @nuxt/test-utils)

- [x] 4.1 Crear o ampliar el test de component `pages/admin/events/index.spec.ts`
- [x] 4.2 Test: clic "Eliminar" obre el modal amb el nom de l'event
- [x] 4.3 Test: clic "Confirmar" al modal fa la crida DELETE i elimina l'event de la llista quan el mock retorna `204`
- [x] 4.4 Test: clic "Confirmar" mostra el missatge d'error quan el mock retorna `422`
- [x] 4.5 Test: clic "Cancel·lar" tanca el modal sense fer cap crida al backend
- [x] 4.6 Executar tests frontend: `pnpm --filter frontend test`

## 5. Verificació final

- [x] 5.1 `pnpm lint` sense errors
- [x] 5.2 `pnpm type-check` sense errors de TypeScript al frontend
- [x] 5.3 `pnpm test` (tots els workspaces) passa
- [x] 5.4 Provar manualment el flux complet: eliminar un event sense reserves (204) i un event amb reserves (422)

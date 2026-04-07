## 1. Backend — Lògica de creació d'events (Laravel)

- [x] 1.1 Crear `app/Http/Requests/Admin/StoreEventRequest.php` amb les regles de validació: `name` (required), `date` (required, after:now), `venue` (required), `price_categories` (required, array, min:1), `price_categories.*.name` (required), `price_categories.*.price` (required, numeric, min:0), `price_categories.*.rows` (required, array, min:1), `price_categories.*.seats_per_row` (required, integer, min:1). Camp `slug` i `description` optionals.
- [x] 1.2 Crear `app/Services/AdminEventService.php` amb el mètode `store(array $data): Event` que executa la creació transaccional: genera el slug si no s'envia, comprova unicitat (llença excepció si duplicat), insereix `Event`, insereix `PriceCategory[]` i fa bulk insert dels `Seat[]` (tots amb `estat: DISPONIBLE`).
- [x] 1.3 Afegir el mètode `store(StoreEventRequest $request): JsonResponse` a `AdminEventController` que crida `AdminEventService::store()`, captura l'excepció de slug duplicat i retorna `409`, o retorna `201` amb el cos de l'event creat.
- [x] 1.4 Registrar la nova ruta `Route::post('/events', [AdminEventController::class, 'store'])` al grup `admin` de `routes/api.php`.

## 2. Backend — Tests (Laravel / Pest)

- [x] 2.1 Crear `tests/Feature/Admin/AdminEventStoreTest.php` amb tests per a: creació exitosa (201 + registres a BD), tots els seients amb `estat: DISPONIBLE`, slug duplicat (409), data passada (422), camps requerits absents (422), rol comprador (403), sense autenticació (401).
- [x] 2.2 Crear factory `database/factories/EventFactory.php` si no existeix, per facilitar la creació de dades de test.
- [x] 2.3 Executar `php artisan test --filter AdminEventStoreTest` i verificar que tots els tests passen.

## 3. Frontend — Pàgina de creació d'events (Nuxt 3)

- [x] 3.1 Crear `src/frontend/pages/admin/events/new.vue` amb `definePageMeta({ ssr: false, middleware: 'admin' })`, formulari reactiu usant `ref` per a cada camp (`name`, `slug`, `description`, `date`, `venue`) i un array reactiu `priceCategories` per a les categories dinàmiques.
- [x] 3.2 Implementar la lògica del formulari: autocompletar `slug` a partir del `name` (lowercased, espais → guions), botó per afegir/eliminar categories de preu, validació client-side bàsica (camps requerits), i enviament amb `useFetch` o `$fetch` a `POST /api/admin/events`.
- [x] 3.3 Gestionar respostes: redirigir a `/admin/events` en cas de `201`, mostrar error inline "Slug already exists" en cas de `409`, mostrar errors de validació del servidor en cas de `422`.

## 4. Frontend — Tests (Vitest + @nuxt/test-utils)

- [x] 4.1 Crear `src/frontend/pages/admin/events/new.spec.ts`
- [x] 4.2 Executar `pnpm test` al workspace `frontend` i verificar que tots els tests de `new.spec.ts` passen.

## 5. Verificació final

- [x] 5.1 Executar `php artisan test` al `laravel-service` — tots els tests han de passar.
- [x] 5.2 Executar `pnpm lint` al monorepo — sense errors.
- [x] 5.3 Executar `pnpm test` al monorepo — tots els tests passen.

## 6. Tests — Resum de fitxers a crear

- [x] `src/backend/laravel-service/app/Http/Requests/Admin/StoreEventRequest.php`
- [x] `src/backend/laravel-service/app/Services/AdminEventService.php`
- [x] `src/backend/laravel-service/tests/Feature/Admin/AdminEventStoreTest.php`
- [x] `src/backend/laravel-service/database/factories/EventFactory.php` (si no existeix)
- [x] `src/frontend/pages/admin/events/new.vue`
- [x] `src/frontend/pages/admin/events/new.spec.ts`

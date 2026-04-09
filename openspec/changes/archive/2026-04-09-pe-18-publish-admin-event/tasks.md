## 1. Backend — UpdateEventRequest

- [x] 1.1 Afegir la regla `'published' => ['sometimes', 'boolean']` a `UpdateEventRequest::rules()`
- [x] 1.2 Verificar que el camp `published` no interfereix amb cap altra validació existent

## 2. Backend — AdminEventService

- [x] 2.1 Afegir `'published'` a l'array `$fillable` dins de `AdminEventService::update()` (línia que fa `array_flip`)
- [x] 2.2 Confirmar que `Event::$fillable` al model ja inclou `published` (ja existeix; verificar)

## 3. Backend — Endpoint públic GET /api/events

- [x] 3.1 Crear `app/Http/Controllers/EventController.php` amb mètode `index()` que retorni events amb `published = true` ordenats per data ascendent
- [x] 3.2 Afegir la ruta `Route::get('/events', [EventController::class, 'index'])` a `routes/api.php` (sense middleware)
- [x] 3.3 Definir el format de resposta: array amb `id`, `name`, `slug`, `date`, `venue` per event

## 4. Backend — Tests

- [x] 4.1 Afegir test a `tests/Feature/Admin/AdminEventUpdateTest.php`: `PUT` amb `{ published: true }` persisted i `{ published: false }` persisted
- [x] 4.2 Crear `tests/Feature/EventControllerTest.php`: `GET /api/events` retorna només publicats, array buit si cap publicat, ordenats per data
- [x] 4.3 Executar `php artisan test` per verificar que tots els tests passen

## 5. Frontend — Toggle de publicació a /admin/events

- [x] 5.1 Afegir la funció `togglePublish(event: AdminEvent)` a `<script setup>` de `pages/admin/events/index.vue`
- [x] 5.2 Connectar `@click="togglePublish(event)"` al botó "Publicar/Despublicar" existent
- [x] 5.3 Implementar la crida `$fetch PUT /api/admin/events/:id` amb `{ published: !event.publicat }` i el token d'autenticació
- [x] 5.4 Actualitzar `event.publicat` reactiu amb el valor retornat pel backend (`updated.published`)
- [x] 5.5 Gestionar errors: mostrar missatge genèric si la crida falla (sense canviar l'estat local)

## 6. Frontend — Tests

- [x] 6.1 Afegir test al fitxer `pages/admin/events/index.spec.ts`: clic al botó toggle crida `$fetch` amb `{ published: true/false }` i el badge s'actualitza reactivament
- [x] 6.2 Executar `pnpm test` al workspace `frontend` per verificar que els tests passen

## 7. Verificació final

- [x] 7.1 Executar `php artisan test` al directori `src/backend/laravel-service` — tots els tests passen
- [x] 7.2 Executar `pnpm lint` al workspace frontend — sense errors
- [x] 7.3 Executar `pnpm type-check` al workspace frontend — sense errors
- [x] 7.4 Executar `pnpm test` al workspace frontend — tots els tests passen

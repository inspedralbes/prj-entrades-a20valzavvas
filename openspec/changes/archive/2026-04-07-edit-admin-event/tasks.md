## 1. Backend — DTO i Servei

- [x] 1.1 Crear `UpdateEventDto` a `src/admin/dto/update-event.dto.ts` usant `PartialType(CreateEventDto)`
- [x] 1.2 Implementar `AdminService.updateEvent(id, dto)`: consulta existència (`404`), guarda de `price_categories` amb reserves actives (`422`), guarda de slug duplicat (`409`), actualització a la BD (`200`)
- [x] 1.3 Afegir tests unitaris de `AdminService.updateEvent` a `src/admin/admin.service.spec.ts` (casos: 200, 404, 422, 409)

## 2. Backend — Controlador

- [x] 2.1 Afegir mètode `update(@Param('id') id, @Body() dto: UpdateEventDto)` a `AdminController` amb decorador `@Put(':id')`
- [x] 2.2 Afegir tests unitaris de `AdminController.update` a `src/admin/admin.controller.spec.ts` (casos: 200, 404, 422, 409, 401)

## 3. Backend — Verificació

- [x] 3.1 Executar `pnpm --filter backend test` i assegurar que tots els tests passen
- [x] 3.2 Executar `pnpm --filter backend type-check` sense errors
- [x] 3.3 Executar `pnpm --filter backend lint` sense errors

## 4. Frontend — Pàgina d'edició

- [x] 4.1 Crear `pages/admin/events/[id].vue` amb `definePageMeta({ ssr: false, middleware: 'admin' })`
- [x] 4.2 Implementar càrrega de dades via `GET /api/admin/events/:id` al `onMounted` / `useFetch`
- [x] 4.3 Implementar formulari reactiu amb els camps `name`, `slug`, `description`, `date`, `venue`
- [x] 4.4 Implementar submit del formulari (`PUT /api/admin/events/:id`) amb gestió d'errors inline (422, 409) i redirecció a `/admin/events` en cas d'èxit
- [x] 4.5 Afegir tests de component a `pages/admin/events/[id].spec.ts` (casos: càrrega de dades, submit correcte → redirecció, 422 → missatge inline)

## 5. Frontend — Verificació

- [x] 5.1 Executar `pnpm --filter frontend test` i assegurar que tots els tests passen
- [x] 5.2 Executar `pnpm --filter frontend type-check` sense errors
- [x] 5.3 Executar `pnpm --filter frontend lint` sense errors

## 6. Integració final

- [x] 6.1 Executar `pnpm test` a l'arrel del monorepo i confirmar que tots els tests passen
- [x] 6.2 Verificar manualment el flux complet: editar event sense reserves (200), editar event amb reserves (422)

## 1. Backend — Lògica de negoci (Laravel)

- [x] 1.1 Afegir el mètode `getSalesReport(): array` a `AdminEventService` que consulti totes les `PriceCategory` amb el recompte de seients totals, seients venuts (`estat = VENUT`) i la suma de `order_items.price` per categoria
- [x] 1.2 Calcular `percentatge_ocupacio` com `(seients_venuts / total_seients) * 100`, arrodonit a 2 decimals; retornar `0.0` si `total_seients = 0`
- [x] 1.3 Incloure `event_nom` (nom de l'event associat) a cada `CategoryReportRow` retornat
- [x] 1.4 Afegir tests PHPUnit a `tests/Feature/Admin/AdminReportsTest.php` cobrint: cas feliç amb vendes, cas sense vendes (zeros), cas sense seients (divisió per zero) — implementat com a Feature test amb `RefreshDatabase` en lloc d'Unit test per cobrir també els escenaris 401/403

## 2. Backend — Endpoint i ruta (Laravel)

- [x] 2.1 Afegir el mètode `reports(): JsonResponse` a `AdminEventController` que cridi `AdminEventService::getSalesReport()` i retorni 200 amb l'array
- [x] 2.2 Registrar la ruta `Route::get('/reports', [AdminEventController::class, 'reports'])` dins el grup `auth:sanctum + admin` a `routes/api.php`
- [x] 2.3 Verificar manualment amb `curl` o Postman que `GET /api/admin/reports` retorna 200 amb les dades esperades i 401/403 sense token o amb rol incorrecte

## 3. Frontend — Taula d'informes a /admin (Nuxt 3)

- [x] 3.1 Afegir a `pages/admin/index.vue` una crida `useFetch` o `$fetch` a `/api/admin/reports` amb capçalera `Authorization: Bearer <token>` en `onMounted`
- [x] 3.2 Implementar la secció de taula HTML amb les columnes: Categoria, Event, Preu, Total Seients, Venuts, % Ocupació, Recaptació; formatar preu i recaptació amb `Intl.NumberFormat` en EUR
- [x] 3.3 Afegir estat de càrrega (indicador visible mentre `pending === true`) i estat d'error (missatge si la crida falla)
- [x] 3.4 Afegir missatge "No hi ha dades d'informes disponibles" si l'array retornat és buit

## 4. Verificació i CI

- [x] 4.1 Executar els tests de Laravel: `cd src/backend/laravel-service && php artisan test --filter AdminEventServiceTest`
- [x] 4.2 Executar `pnpm --filter frontend type-check` per verificar que no hi ha errors TypeScript al frontend
- [x] 4.3 Executar `pnpm --filter frontend lint` per verificar que no hi ha errors de linting
- [x] 4.4 Executar `pnpm --filter frontend build` per verificar que la build de producció del frontend compila sense errors
- [x] 4.5 Executar `cd src/backend/laravel-service && ./vendor/bin/pint --test` per verificar el format PHP

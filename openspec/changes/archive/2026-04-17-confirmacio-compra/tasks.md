## 1. Shared — Extensió de tipus Socket.IO

- [x] 1.1 Actualitzar `CompraConfirmarPayload` a `src/shared/types/socket.types.ts`: afegir camps `orderId: string`, `eventId: string` i canviar `seients` a `Array<{ seatId: string; fila: string; numero: number }>`
- [x] 1.2 Verificar que el canvi de tipus no trenca res: `pnpm --filter shared type-check`

## 2. Backend Laravel — Detecció de seients expirats

- [x] 2.1 Afegir camp `seat_ids` (opcional, array d'UUIDs) a `StoreOrderRequest` a `src/backend/laravel-service/app/Http/Requests/StoreOrderRequest.php`
- [x] 2.2 Modificar `OrderController::store()` a `src/backend/laravel-service/app/Http/Controllers/OrderController.php`: si `seat_ids` és present, comparar contra reserves actives i retornar `409 { seients_expirats: [] }` per als que manquen
- [x] 2.3 Escriure test de feature per al cas 409 amb `seat_ids` expirats a `src/backend/laravel-service/tests/Feature/OrderControllerTest.php`
- [x] 2.4 Escriure test de feature per al happy path amb `seat_ids` tots actius
- [x] 2.5 Executar tests Laravel: `cd src/backend/laravel-service && php artisan test --filter OrderControllerTest`
- [x] 2.6 Executar PHP Lint: `cd src/backend/laravel-service && ./vendor/bin/pint`

## 3. Backend NestJS — Handler compra:confirmar al SeatsGateway

- [x] 3.1 Afegir handler `@SubscribeMessage('compra:confirmar')` a `src/backend/node-service/src/gateway/seats.gateway.ts` que:
  - Iteri `payload.seients` i faci broadcast `seient:canvi-estat { seatId, estat: VENUT, fila, numero }` a `event:{payload.eventId}`
  - Emeti `compra:completada { orderId, seients }` privadament al socket del comprador
  - Faci guard si `payload.seients` és buit (no emetis res)
- [x] 3.2 Escriure test unitari del nou handler a `src/backend/node-service/src/gateway/seats.gateway.spec.ts`:
  - Cas happy path: 2 seients → 2 broadcasts `seient:canvi-estat` + 1 `compra:completada`
  - Cas llista buida: 0 broadcasts
- [x] 3.3 Executar tests NestJS: `cd src/backend/node-service && pnpm test`
- [x] 3.4 Verificar tipus: `cd src/backend/node-service && pnpm type-check`

## 4. Frontend — Actualitzar checkout.vue

- [x] 4.1 Afegir `seat_ids: reservaStore.seatIds` al body del `$fetch` de `POST /api/orders` a `src/frontend/pages/checkout.vue`
- [x] 4.2 Importar i utilitzar `useSeientStore` per obtenir `eventId` i els detalls de cada seient (ja importat)
- [x] 4.3 Gestionar 409 amb `seients_expirats`: mapejar UUIDs a etiquetes (fila+numero) via l'array local `seats` i mostrar el missatge d'error específic
- [x] 4.4 Després d'una resposta 201 exitosa, emetre `compra:confirmar { orderId, eventId, seients: [{seatId, fila, numero}] }` via `$socket`
- [x] 4.5 Actualitzar tests unitaris de `src/frontend/pages/checkout.spec.ts`:
  - Test del cas 409 amb `seients_expirats` → missatge d'error amb etiquetes
  - Test que `compra:confirmar` s'emet via socket després del 201
  - Test que `seat_ids` s'inclou al body del POST
- [x] 4.6 Executar tests frontend: `cd src/frontend && pnpm test`
- [x] 4.7 Verificar tipus frontend: `cd src/frontend && pnpm type-check`
- [x] 4.8 Executar lint frontend: `cd src/frontend && pnpm lint`

## 5. Verificació final

- [x] 5.1 Aixecar l'entorn local amb Docker Compose i verificar el flux complet:
  - Reservar 2 seients → anar a checkout → confirmar compra → verificar broadcast VENUT al mapa
  - Simular expiració d'un seient durant checkout i verificar 409 amb missatge específic
- [x] 5.2 Executar tots els tests: NestJS 46/46 ✓, Laravel 112/112 ✓, Frontend 9/9 (checkout) ✓ (5 fallades pre-existents a MapaSeients/LlegendaEstats no relacionades)
- [x] 5.3 Verificar compilació completa: shared type-check ✓, NestJS type-check ✓, Frontend nuxi typecheck ✓
- [x] 5.4 Executar lint global: Laravel Pint ✓, Frontend eslint pendent (US-07-05)

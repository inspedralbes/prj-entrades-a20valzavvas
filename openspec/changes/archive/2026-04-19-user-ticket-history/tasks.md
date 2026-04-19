## 1. Backend — Endpoint GET /api/orders

- [x] 1.1 Afegir mètode `index()` a `OrderController` amb eager loading `orderItems.seat.event` i `orderItems.seat.priceCategory`, filtrant per `user_id` de l'usuari autenticat i ordenat per `created_at DESC`
- [x] 1.2 Registrar la ruta `Route::get('/orders', [OrderController::class, 'index'])` dins el grup `auth:sanctum` a `routes/api.php`
- [x] 1.3 Escriure test de feature `OrderController::index` — cas happy path (usuari amb ordres), array buit, crida no autenticada (401), i aïllament entre usuaris

## 2. Backend — Email de confirmació

- [x] 2.1 Configurar el driver de mail a `.env.example` (variables `MAIL_MAILER`, `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM_ADDRESS`)
- [x] 2.2 Crear `App\Mail\OrderConfirmationMail` (Mailable) que accepti un `Order` amb relacions carregades
- [x] 2.3 Crear blade template `resources/views/emails/order-confirmation.blade.php` amb HTML responsiu: salutació amb nom d'usuari, nom de l'event, data, sala, llista de seients (fila + número + categoria) i preu total
- [x] 2.4 Afegir `Mail::to($user->email)->send(new OrderConfirmationMail($order))` a `OrderController::store()` just després de la transacció i abans del `return response()->json($result, 201)`
- [x] 2.5 Ampliar el test de feature de `POST /api/orders` amb `Mail::fake()` per verificar `Mail::assertSent(OrderConfirmationMail::class)` a l'adreça correcta i que no s'envia en cas de `409`

## 3. Frontend — Composable useOrders

- [x] 3.1 Crear `composables/useOrders.ts` amb estat `orders`, `isLoading` i `error`; acció `fetchOrders()` que crida `GET /api/orders` amb el Bearer token de l'`authStore`
- [x] 3.2 Definir el tipus `OrderWithDetails` a `composables/useOrders.ts` (o a un fitxer de tipus del frontend) amb l'estructura completa retornada per l'API
- [x] 3.3 Escriure test unitari de `useOrders` amb `$fetch` mockat: cas èxit (orders populades, `isLoading` false), array buit, i cas error (missatge d'error capturat)

## 4. Frontend — Vista /entrades

- [x] 4.1 Implementar `pages/entrades.vue`: cridar `useOrders().fetchOrders()` en `onMounted`, mostrar skeleton de càrrega mentre `isLoading` és `true`
- [x] 4.2 Implementar el component ticket card dins `entrades.vue` (o com a component separat `components/TicketCard.vue`): nom de l'event, data formatada, sala, seients (fila + número), categoria, preu total i badge d'estat
- [x] 4.3 Implementar l'estat buit: missatge "Cap entrada encara" amb CTA "Descobreix els propers events" que navega a `/`
- [x] 4.4 Aplicar l'estil cinematogràfic: fons `#0F0F23`, card `#1E1B4B`, accent `#CA8A04`, efecte perforació amb `border-dashed` o gradient radial entre capçalera i cos del ticket
- [x] 4.5 Escriure test unitari de `pages/entrades.vue` amb `useOrders` mockat: renderització de les cards, estat buit i estat de càrrega

## 5. Frontend — Panel de confirmació a checkout.vue

- [x] 5.1 Ampliar `checkout.vue`: quan `orderConfirmed === true`, amagar el formulari i mostrar el panel de confirmació amb resum de l'ordre (event, seients, total) extret de la resposta `201`
- [x] 5.2 Afegir el botó "Veure les meves entrades" (navega a `/entrades`) i "Tornar als events" (navega a `/`) al panel de confirmació
- [x] 5.3 Escriure test unitari de `checkout.vue` verificant que amb `orderConfirmed = true` el formulari no és al DOM i el panel sí ho és

## 6. Verificació i CI

- [x] 6.1 Executar `php artisan test` (o `php artisan test --filter OrderController`) i verificar que tots els tests passen
- [x] 6.2 Executar `pnpm test` al frontend i verificar que tots els tests nous passen
- [x] 6.3 Executar `pnpm type-check` (frontend + shared) sense errors
- [x] 6.4 Executar `pnpm lint` i `./vendor/bin/pint` sense errors
- [x] 6.5 Verificar manualment el flux complet: login → reserva → checkout → confirmació → `/entrades` → veure la nova entrada

## 1. Backend — Middleware EnsureBuyer (Laravel)

- [x] 1.1 Crear `app/Http/Middleware/EnsureBuyer.php` que comprovi `$request->user()->role === 'comprador'`; si no, retornar `response()->json(['message' => 'El rol admin no pot realitzar compres'], 403)`
- [x] 1.2 Registrar el middleware com a middleware nomenat `buyer` a `bootstrap/app.php` (o a `app/Http/Kernel.php` si s'usa el patró clàssic)
- [x] 1.3 Aplicar el middleware `buyer` a la ruta `POST /api/seats/{seatId}/reserve` a `routes/api.php` (grup `auth:sanctum`)
- [x] 1.4 Aplicar el middleware `buyer` a la ruta `POST /api/orders` a `routes/api.php` (grup `auth:sanctum`)

## 2. Backend — Tests de feature EnsureBuyer

- [x] 2.1 Afegir mètode d'ajuda `adminUser()` a `tests/Feature/OrderControllerTest.php` (o a `TestCase`) que crei un usuari amb `role = 'admin'`
- [x] 2.2 Escriure test `test_admin_cannot_create_order`: `actingAs($adminUser)->postJson('/api/orders', [...])` → 403 + missatge + `Order::count() === 0`
- [x] 2.3 Escriure test `test_comprador_can_still_create_order`: happy path comprador no afectat → 201
- [x] 2.4 Afegir test a `SeatReservationControllerTest.php` (creant si no existeix): `test_admin_cannot_reserve_seat` → 403 + `Reservation::count() === 0`
- [x] 2.5 Afegir test `test_comprador_can_reserve_seat` (happy path no afectat) al mateix fitxer

## 3. Frontend — Middleware buyer-only (Nuxt)

- [x] 3.1 Crear `src/frontend/middleware/buyer-only.ts` que comprovi `useAuthStore().user?.role === 'admin'` i, si és cert, invoqui `return navigateTo('/admin')`
- [x] 3.2 Afegir `'buyer-only'` a l'array de middleware de `definePageMeta` a `src/frontend/pages/checkout.vue`: `definePageMeta({ middleware: ['auth', 'buyer-only'], ssr: false })`

## 4. Frontend — Tests del middleware buyer-only

- [x] 4.1 Crear `src/frontend/middleware/buyer-only.spec.ts` amb tests:
  - admin autenticat → `navigateTo('/admin')` és invocat
  - comprador autenticat → cap redirecció
  - rol absent/null → cap redirecció (middleware `auth` garanteix l'autenticació prèvia)

## 5. Frontend — Mode lectura admin a /events/[slug]

- [x] 5.1 Afegir la prop `readOnly: { type: Boolean, default: false }` a `src/frontend/components/MapaSeients.vue` i passar-la a cada `<Seient>` (`:read-only="readOnly"`)
- [x] 5.2 Afegir la prop `readOnly: { type: Boolean, default: false }` a `src/frontend/components/Seient.vue`; quan `readOnly` és `true`, eliminar o deshabilitar el handler de clic i aplicar `cursor: default` al botó/div del seient
- [x] 5.3 Afegir computed `esAdmin` a `src/frontend/pages/events/[slug].vue`: `const esAdmin = computed(() => authStore.user?.role === 'admin')`
- [x] 5.4 Afegir `import { useAuthStore } from '~/stores/auth'` i instanciar `const authStore = useAuthStore()` a `[slug].vue`
- [x] 5.5 Condicionar el bloc `topbar-reserva` a `[slug].vue`: canviar `v-if="reserva.teReservaActiva"` per `v-if="reserva.teReservaActiva && !esAdmin"`
- [x] 5.6 Passar la prop `:read-only="esAdmin"` al component `<MapaSeients>` a `[slug].vue`

## 6. Frontend — Tests del mode lectura a /events/[slug]

- [x] 6.1 Afegir test a `src/frontend/pages/events/[slug].spec.ts`: quan `authStore.user.role === 'admin'`, `MapaSeients.vue` rep `readOnly = true`
- [x] 6.2 Afegir test: quan `authStore.user.role === 'admin'` i `reserva.teReservaActiva = true`, el bloc `.topbar-reserva` no és present al DOM
- [x] 6.3 Afegir test a `src/frontend/components/Seient.spec.ts` (creant si no existeix): quan `readOnly = true`, el clic al seient no invoca cap handler de reserva
- [x] 6.4 Afegir test a `src/frontend/components/MapaSeients.spec.ts` (creant si no existeix): quan `readOnly = true`, la prop es passa a tots els components `Seient` fills

## 7. Verificació i CI

- [x] 7.1 Executar `cd src/backend/laravel-service && php artisan test` — tots els tests de feature han de passar
- [x] 7.2 Executar `pnpm --filter frontend test` — tots els tests unitaris de frontend han de passar
- [x] 7.3 Executar `pnpm --filter frontend type-check` — sense errors TypeScript
- [x] 7.4 Executar `pnpm lint` — sense errors de linting
- [x] 7.5 Executar `cd src/backend/laravel-service && ./vendor/bin/pint` — sense errors de format PHP

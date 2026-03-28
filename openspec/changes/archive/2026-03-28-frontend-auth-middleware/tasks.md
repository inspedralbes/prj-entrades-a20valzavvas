## 1. Store Pinia d'autenticació

- [x] 1.1 Crear `frontend/stores/auth.ts` amb estat `{ token, user, isAuthenticated }` i tipus TypeScript per a `AuthUser` (id, name, email, role)
- [x] 1.2 Implementar acció `login(credentials)` que cridi `POST /api/auth/login`, desi el token a `localStorage` (clau `auth_token`) i actualitzi l'estat
- [x] 1.3 Implementar acció `register(data)` que cridi `POST /api/auth/register` i faci login automàtic si té èxit
- [x] 1.4 Implementar acció `logout()` que elimini el token de `localStorage` i reseti l'estat
- [x] 1.5 Implementar acció `initFromStorage()` que llegeixi `localStorage` i rehidrati l'estat si hi ha token
- [x] 1.6 Escriure tests unitaris a `frontend/stores/auth.spec.ts` cobrint login, logout, initFromStorage (amb i sense token) i register

## 2. Plugin client-only per a hidratació

- [x] 2.1 Crear `frontend/plugins/auth.client.ts` que cridi `authStore.initFromStorage()` per garantir que la store s'hidrata abans que cap middleware s'executi
- [x] 2.2 Verificar que el plugin no interfereix amb el SSR (sufixe `.client.ts` garantit per Nuxt)

## 3. Middleware d'autenticació

- [x] 3.1 Crear `frontend/middleware/auth.ts` amb `defineNuxtRouteMiddleware` que comprovi `authStore.isAuthenticated` i redirigeixi a `/auth/login` si és fals
- [x] 3.2 Aplicar `definePageMeta({ middleware: 'auth' })` a `frontend/pages/checkout.vue`
- [x] 3.3 Aplicar `definePageMeta({ middleware: 'auth' })` a `frontend/pages/entrades.vue`
- [x] 3.4 Escriure tests unitaris a `frontend/middleware/auth.spec.ts` cobrint: redirecció sense token i accés permès amb token

## 4. Middleware d'administració

- [x] 4.1 Crear `frontend/middleware/admin.ts` amb `defineNuxtRouteMiddleware` que comprovi `authStore.user?.role === 'admin'` i redirigeixi a `/` si no compleix
- [x] 4.2 Aplicar `definePageMeta({ middleware: 'admin' })` a `frontend/pages/admin/index.vue`
- [x] 4.3 Aplicar `definePageMeta({ middleware: 'admin' })` a `frontend/pages/admin/events/index.vue`
- [x] 4.4 Aplicar `definePageMeta({ middleware: 'admin' })` a `frontend/pages/admin/events/new.vue`
- [x] 4.5 Aplicar `definePageMeta({ middleware: 'admin' })` a `frontend/pages/admin/events/[id].vue`
- [x] 4.6 Escriure tests unitaris a `frontend/middleware/admin.spec.ts` cobrint: redirecció amb rol `comprador`, redirecció sense autenticació i accés permès amb rol `admin`

## 5. Verificació i qualitat

- [x] 5.1 Executar `pnpm --filter frontend type-check` i corregir errors de TypeScript
- [x] 5.2 Executar `pnpm --filter frontend lint` i corregir errors de linting
- [x] 5.3 Executar `pnpm --filter frontend test` i verificar que tots els tests passen
- [x] 5.4 Executar `pnpm --filter frontend build` i verificar que el build compila sense errors

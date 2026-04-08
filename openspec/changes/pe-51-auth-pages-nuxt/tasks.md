## 1. Pàgina de login (`pages/auth/login.vue`)

- [x] 1.1 Crear `src/frontend/pages/auth/login.vue` amb `<template>` bàsic i `<script setup lang="ts">`
- [x] 1.2 Afegir formulari amb camps `email` (type="email", required) i `password` (type="password", required)
- [x] 1.3 Importar i usar `useAuthStore` i `useRoute` / `useRouter`
- [x] 1.4 Implementar guard d'usuari autenticat: si `isAuthenticated`, fer `navigateTo('/')` a `onMounted`
- [x] 1.5 Implementar lògica de submit: `isLoading = true`, cridar `authStore.login()`, capturar errors per camp, redirigir
- [x] 1.6 Llegir `route.query.redirect` i redirigir a la ruta anterior en cas d'èxit
- [x] 1.7 Mostrar errors de validació per camp (binding `errors.email`, `errors.password`)
- [x] 1.8 Deshabilitar el botó de submit mentre `isLoading === true`

## 2. Tests de login (`pages/auth/login.spec.ts`)

- [x] 2.1 Crear `src/frontend/pages/auth/login.spec.ts` amb setup de `@nuxt/test-utils` i mock de `useAuthStore`
- [x] 2.2 Test: submit amb credencials vàlides → `authStore.login()` cridat + redirecció a `/`
- [x] 2.3 Test: submit amb `?redirect=/checkout` → redirecció a `/checkout` en èxit
- [x] 2.4 Test: error `422` amb `errors.email` → missatge visible al camp email
- [x] 2.5 Test: botó disabled quan `isLoading === true`
- [x] 2.6 Test: usuari autenticat → redirecció a `/` sense cridar `authStore.login()`

## 3. Pàgina de registre (`pages/auth/register.vue`)

- [x] 3.1 Crear `src/frontend/pages/auth/register.vue` amb `<template>` bàsic i `<script setup lang="ts">`
- [x] 3.2 Afegir formulari amb camps `name` (required), `email` (type="email", required), `password` (type="password", required, minlength="8") i `password_confirmation` (type="password", required)
- [x] 3.3 Importar i usar `useAuthStore`
- [x] 3.4 Implementar guard d'usuari autenticat: si `isAuthenticated`, fer `navigateTo('/')` a `onMounted`
- [x] 3.5 Implementar validació client-side: si `password !== password_confirmation`, mostrar error local i no cridar la store
- [x] 3.6 Implementar lògica de submit: `isLoading = true`, cridar `authStore.register({ name, email, password })`, capturar errors del servidor per camp, redirigir a `/` en èxit
- [x] 3.7 Mostrar errors de validació per camp (binding `errors.name`, `errors.email`, `errors.password`, `errors.password_confirmation`)
- [x] 3.8 Deshabilitar el botó de submit mentre `isLoading === true`

## 4. Tests de registre (`pages/auth/register.spec.ts`)

- [x] 4.1 Crear `src/frontend/pages/auth/register.spec.ts` amb setup de `@nuxt/test-utils` i mock de `useAuthStore`
- [x] 4.2 Test: submit amb dades vàlides → `authStore.register()` cridat + redirecció a `/`
- [x] 4.3 Test: `password !== password_confirmation` → error al camp `password_confirmation`, `authStore.register()` NO cridat
- [x] 4.4 Test: error `422` amb `errors.email` (email ja existent) → missatge visible al camp email
- [x] 4.5 Test: botó disabled quan `isLoading === true`
- [x] 4.6 Test: usuari autenticat → redirecció a `/` sense cridar `authStore.register()`

## 5. Verificació final

- [x] 5.1 Executar `pnpm --filter frontend type-check` — ha de passar sense errors
- [x] 5.2 Executar `pnpm --filter frontend lint` — ha de passar sense errors
- [x] 5.3 Executar `pnpm --filter frontend test` — tots els tests nous han de passar
- [x] 5.4 Verificar manualment el flux complet: registre → redirecció a `/`, login → redirecció a `/auth/login` desde ruta protegida → login → redirecció original

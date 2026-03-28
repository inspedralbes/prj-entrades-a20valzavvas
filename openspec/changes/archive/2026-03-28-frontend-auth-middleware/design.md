## Context

El frontend (Nuxt 3) ja disposa de stores Pinia per a seients, reserva, event i connexió, però no té cap store d'autenticació ni middlewares que protegeixin les rutes. Els endpoints de login i registre del backend (Laravel Sanctum) ja estan operatius i retornen un token JWT + dades de l'usuari (id, name, email, role). Cal afegir la capa d'autenticació al costat del client sense trencar cap funcionalitat existent.

## Goals / Non-Goals

**Goals:**

- Store Pinia `auth.ts` que encapsula l'estat d'autenticació i persista el token a `localStorage`
- Middleware `auth.ts` que bloqueja l'accés a `/checkout` i `/entrades` si `isAuthenticated` és fals
- Middleware `admin.ts` que bloqueja l'accés a `/admin/**` si `user.role !== 'admin'`
- Recuperació automàtica del token i l'usuari en inicialitzar l'app via `plugins/auth.client.ts` (hidratació des de `localStorage`)
- Tests unitaris amb Vitest per a la store i els middlewares

**Non-Goals:**

- Refresh automàtic del token (fora d'abast)
- Gestió de sessió al costat del servidor (SSR) — les rutes protegides ja són CSR
- Canvis al backend o als endpoints existents

## Decisions

### 1. Pinia store per a l'estat d'autenticació

**Decisió:** nova store `stores/auth.ts` amb estat reactiu `{ token, user, isAuthenticated }` i accions `login()`, `logout()`, `register()`.

**Alternativa considerada:** composable `useAuth.ts`. Rebutjada perquè la store Pinia ofereix accés global sense prop-drilling, és consistent amb la resta de stores del projecte i facilita el mock en tests.

### 2. Persistència via `localStorage` (no cookies)

**Decisió:** el token es desa i es llegeix de `localStorage`.

**Alternativa considerada:** `httpOnly cookie` gestionada pel servidor. Rebutjada perquè el backend retorna el token al body de la resposta i caldria un canvi d'API. `localStorage` és la solució directa i alineada amb l'especificació de PE-50.

**Risc:** el token és accessible des de JavaScript (XSS). Mitigació: el projecte no injecta HTML extern; la CSP i les pràctiques de sanitització minimitzen el risc. Acceptable per al scope actual.

### 3. Middleware de Nuxt (client-side) en lloc de route guards de Vue Router

**Decisió:** fitxers a `middleware/auth.ts` i `middleware/admin.ts` declarats com a `defineNuxtRouteMiddleware`.

**Alternativa considerada:** guards `beforeEach` de Vue Router directament al plugin. Rebutjada perquè el middleware de Nuxt és la convenció estàndard del framework, és testable i es declara per ruta amb `definePageMeta`.

### 4. Hidratació via plugin client-only en lloc de `app.vue`

**Decisió:** `plugins/auth.client.ts` crida `authStore.initFromStorage()` per recuperar el token i les dades de l'usuari de `localStorage` abans que cap middleware s'executi.

**Raó:** `localStorage` no està disponible durant el SSR. El plugin amb sufix `.client.ts` garanteix execució exclusivament al client i s'executa abans del routing, eliminant la race condition que hauria existit amb `onMounted` a `app.vue`.

## Risks / Trade-offs

- **Race condition en hidratació** → El middleware s'executa abans que `app.vue` es munti si l'usuari navega directament a una ruta protegida. Mitigació: cridar `initFromStorage()` a un plugin client-only (`plugins/auth.client.ts`) per garantir que la store està hidratada abans de qualsevol middleware.
- **Token caducat emmagatzemat** → Un token expirat passarà el check `isAuthenticated` (basat en presència, no en validesa). Mitigació: el backend retornarà 401 en la primera crida protegida; el handler d'errors de l'axios/fetch pot cridar `logout()`. Fora d'abast d'aquesta US però cal documentar-ho.
- **Tests de middleware** → `defineNuxtRouteMiddleware` requereix el setup de `@nuxt/test-utils`. Si l'entorn no està configurat, els tests fallaran. Mitigació: verificar setup existent abans de crear els tests.

## Migration Plan

1. Afegir `stores/auth.ts` i `plugins/auth.client.ts` (no trenca res existent)
2. Afegir `middleware/auth.ts` i `middleware/admin.ts`
3. Aplicar `definePageMeta` a les pàgines protegides (`/checkout`, `/entrades`, `/admin/**`)
4. Modificar `app.vue` o verificar que el plugin client-only cobreix la hidratació
5. Escriure i passar els tests unitaris
6. Verificar que `pnpm type-check` i `pnpm lint` passen sense errors

No cal rollback especial: els canvis són additius i no modifiquen cap ruta ni store existents.

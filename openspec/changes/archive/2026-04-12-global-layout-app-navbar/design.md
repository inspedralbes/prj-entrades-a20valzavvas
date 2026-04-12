## Context

`app.vue` is currently a bare wrapper with no persistent shell. No navigation exists outside of individual pages. The `authStore` (Pinia) already exposes `isAuthenticated`, `user.name`, `user.role`, and `logout()`. Cinema design tokens (`--color-bg-surface`, `--color-accent-primary`, etc.) are established by PE-60. The auth pages (`/auth/login`, `/auth/register`) use `min-height: 100dvh` on their root element, which will leave them overcrowded once a ~56px navbar is prepended.

## Goals / Non-Goals

**Goals:**
- Add `AppNavbar.vue` as a globally mounted component in `app.vue`
- Role-based nav items (visitor / buyer / admin) driven by `authStore`
- Active-route highlighting via `useRoute()`
- Move logout action from `pages/entrades.vue` inline to the navbar
- Fix auth page vertical centering to work within `<main>` (not full viewport)

**Non-Goals:**
- Mobile hamburger menu with animation (EP-09)
- User profile dropdown / avatar
- Breadcrumbs or notifications
- Backend changes

## Decisions

### 1 — Global layout via `app.vue`, not a Nuxt layout file

**Decision:** Place `<AppNavbar />` directly in `app.vue`.

**Alternatives considered:**
- *Named Nuxt layout (`layouts/default.vue`)*: requires every page to opt in with `definePageMeta({ layout: 'default' })` or a default layout that some pages could accidentally override. The navbar must be truly universal — even pages that declare their own layout (e.g., future admin layout) should still render it.
- *Nuxt plugin*: not the right abstraction for a rendered component.

**Rationale:** `app.vue` is the single root guaranteed to wrap every route. Zero per-page configuration required.

### 2 — Auth state from Pinia `authStore`, no prop drilling

**Decision:** `AppNavbar` reads `authStore` directly via `useAuthStore()` inside the component.

**Rationale:** Auth state is global. The store already holds `isAuthenticated`, `user.role`, and `user.name`. No new store actions or getters needed — the existing API is sufficient.

**Role detection:**
```
user.role === 'admin'    → show "Panel Admin" link + "Entrades" + logout
isAuthenticated && role !== 'admin' → show "Entrades" + logout + "Hola, {name}"
!isAuthenticated         → show "Iniciar sessió" + "Registrar-se"
```

### 3 — Active-route detection with `useRoute()`

**Decision:** Use `const route = useRoute()` and compare `route.path` (or `startsWith`) to mark links as active.

**Rationale:** Nuxt 3's `<NuxtLink>` provides `activeClass` automatically for exact matches. For the logo/Events link pointing to `/`, `exactActiveClass` avoids false positives on sub-routes.

### 4 — Auth page centering fix: `<main>` gets `flex: 1` and `display: flex`

**Decision:** `app.vue` gives `<main>` a flex-column layout with `flex: 1`. Auth pages use `min-height: 100%` on their container, inheriting the available height after the navbar.

**Alternative considered:** Using `calc(100dvh - 56px)` hardcoded in auth pages. Rejected — couples the page to the navbar height constant, which should live only in `AppNavbar`.

```
┌─ body: min-height: 100dvh, display:flex, flex-direction:column ─┐
│  <AppNavbar />  (~56px)                                          │
│  <main style="flex:1; display:flex; flex-direction:column">      │
│    <NuxtPage />   ← auth pages fill this area                    │
│  </main>                                                         │
└──────────────────────────────────────────────────────────────────┘
```

## Risks / Trade-offs

- **[Risk] SSR hydration mismatch on `authStore`**: `initFromStorage()` reads `localStorage` (client-only). On first SSR render the navbar will always show the unauthenticated state, then hydrate to authenticated on the client. → **Mitigation:** This is the existing behavior of the auth store; wrap auth-dependent nav items in `<ClientOnly>` if flickering is unacceptable, or accept the flash as a known limitation (token-based auth without cookies).
- **[Risk] `pages/entrades.vue` logout removal**: removing the inline button is a small but visible regression if the navbar is not rendered (e.g., a layout override). → **Mitigation:** `app.vue` mounts the navbar unconditionally; no page can suppress it in the current setup.
- **[Trade-off] No hamburger menu**: on narrow viewports the navbar may overflow. Acceptable for now — EP-09 covers responsive nav.

## Migration Plan

1. Create `src/frontend/components/AppNavbar.vue`.
2. Modify `src/frontend/app.vue` to mount `<AppNavbar />` and wrap `<NuxtPage />` in `<main>`.
3. Remove inline logout button from `src/frontend/pages/entrades.vue`.
4. Adjust vertical centering in `src/frontend/pages/auth/login.vue` and `src/frontend/pages/auth/register.vue`.
5. Run `pnpm lint && pnpm type-check && pnpm test` — no backend migrations required.
6. Rollback: revert `app.vue` to `<div><NuxtPage /></div>` and restore the inline logout in `entrades.vue`.

## Open Questions

- None — scope is fully defined by PE-61 acceptance criteria.

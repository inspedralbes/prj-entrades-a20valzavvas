## Why

`app.vue` is currently just `<div><NuxtPage /></div>` with no persistent app chrome. Users have no way to navigate between sections without manually typing URLs — there is no visible path from the homepage to their tickets, the admin panel, or back to the event listing. Linked to [PE-61](https://lightweight-fitness.atlassian.net/browse/PE-61).

## What Changes

- **New component** `components/AppNavbar.vue`: a persistent top navigation bar visible on every page, with role-based items (visitor, buyer, admin) using the cinema design tokens from PE-60.
- **Modify `app.vue`**: wrap `<NuxtPage />` with `<AppNavbar />` and a `<main>` element to establish a consistent page shell.
- **Remove inline logout** from `pages/entrades.vue`: logout action moves into the navbar.
- **Fix auth page vertical centering**: `/auth/login` and `/auth/register` currently use `min-height: 100dvh` from the document top; with the navbar present, centering must happen inside `<main>` instead.

## Capabilities

### New Capabilities

- `app-navbar`: Persistent top navigation bar component with role-aware items (visitor / buyer / admin), active-route highlighting, logout action, and cinema dark-theme styling via CSS design tokens.

### Modified Capabilities

- `frontend-auth-pages`: Vertical centering of auth forms must account for the navbar height (~56px); `min-height` must apply to the `<main>` container, not the full viewport.

## Impact

- **Frontend only** — no backend changes.
- `app.vue` gains `<AppNavbar />` and a `<main>` wrapper.
- `pages/entrades.vue` loses its inline logout button.
- `pages/auth/login.vue` and `pages/auth/register.vue` need centering adjustment.
- Depends on `frontend-auth-store` (Pinia `authStore`) for user role and logout action.
- Depends on `cinema-design-tokens` (CSS custom properties) for theming.
- New composable usage: `useRoute()` for active-link detection.
- No new Pinia stores, no Socket.IO changes, no backend modules affected.

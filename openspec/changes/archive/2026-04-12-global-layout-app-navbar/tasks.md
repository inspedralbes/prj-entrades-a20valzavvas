## 1. Component AppNavbar.vue

- [x] 1.1 Create `src/frontend/components/AppNavbar.vue` with logo "SALA ONIRICA" linking to `/`
- [x] 1.2 Import and use `useAuthStore()` to read `isAuthenticated`, `user.name`, `user.role`
- [x] 1.3 Implement role-based nav items: visitor (login + register), buyer (Entrades + greeting + logout), admin (Panel Admin + Entrades + greeting + logout)
- [x] 1.4 Implement logout action: call `authStore.logout()` then `navigateTo('/auth/login')`
- [x] 1.5 Implement active-route highlighting using `useRoute()` and `var(--color-accent-primary)`
- [x] 1.6 Apply cinema dark-theme styles using design tokens (`--color-bg-surface`, `--color-border`, `--color-text-primary`), height ~56px

## 2. Modify app.vue

- [x] 2.1 Add `<AppNavbar />` as the first child in `app.vue`
- [x] 2.2 Wrap `<NuxtPage />` in a `<main>` element with `flex: 1` and `display: flex; flex-direction: column`
- [x] 2.3 Ensure `body` or the root `<div>` has `min-height: 100dvh; display: flex; flex-direction: column` so `<main>` fills remaining space

## 3. Remove inline logout from entrades.vue

- [x] 3.1 Remove the `.btn-logout` button and its associated click handler from `src/frontend/pages/entrades.vue`
- [x] 3.2 Remove the `.btn-logout` CSS block from `entrades.vue`

## 4. Fix auth page vertical centering

- [x] 4.1 Update `src/frontend/pages/auth/login.vue`: change `.auth-page` from `min-height: 100dvh` to `min-height: 100%; flex: 1` so centering applies within `<main>`
- [x] 4.2 Update `src/frontend/pages/auth/register.vue`: apply the same centering fix as login

## 5. Tests

- [x] 5.1 Create `src/frontend/components/AppNavbar.spec.ts`: test visitor state (shows login/register, hides Entrades/Admin/logout)
- [x] 5.2 Add test: buyer state shows Entrades, greeting and logout; hides login/register/admin
- [x] 5.3 Add test: admin state shows Panel Admin link
- [x] 5.4 Add test: clicking logout calls `authStore.logout()` and navigates to `/auth/login`
- [x] 5.5 Update `src/frontend/pages/auth/login.spec.ts`: verify `.auth-page` no longer sets `min-height: 100dvh`
- [x] 5.6 Update `src/frontend/pages/auth/register.spec.ts`: same centering check as login

## 6. Verification

- [x] 6.1 Run `pnpm lint` in `src/frontend` — no errors
- [x] 6.2 Run `pnpm type-check` in `src/frontend` — no errors
- [x] 6.3 Run `pnpm test` in `src/frontend` — all tests pass (including new AppNavbar.spec.ts)
- [x] 6.4 Start dev server and manually verify: navbar visible on `/`, `/auth/login`, `/events/[slug]`, `/entrades`, `/admin/events`
- [x] 6.5 Manually verify role-based items: unauthenticated, buyer, and admin states
- [x] 6.6 Manually verify auth page vertical centering with navbar present

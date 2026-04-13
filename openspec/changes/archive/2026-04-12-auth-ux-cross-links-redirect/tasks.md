## 1. Fix post-login redirect a `pages/auth/login.vue`

- [x] 1.1 Localitzar la funció `homeForRole()` a `frontend/pages/auth/login.vue`
- [x] 1.2 Corregir el valor de retorn per al rol `comprador`: canviar `/entrades` per `/`
- [x] 1.3 Verificar que el rol `admin` segueix retornant `/admin/events`

## 2. Afegir cross-links i link de retorn a `pages/auth/login.vue`

- [x] 2.1 Afegir sota el formulari un `<p class="auth-link">` amb `<NuxtLink to="/auth/register">Registra't</NuxtLink>`
- [x] 2.2 Afegir sota el cross-link un `<p class="auth-link auth-link--back">` amb `<NuxtLink to="/">← Tornar a la portada</NuxtLink>`

## 3. Afegir cross-links i link de retorn a `pages/auth/register.vue`

- [x] 3.1 Verificar que el `navigateTo('/')` post-register ja apunta a `/` (no cal canviar si és correcte)
- [x] 3.2 Afegir sota el formulari un `<p class="auth-link">` amb `<NuxtLink to="/auth/login">Inicia sessió</NuxtLink>`
- [x] 3.3 Afegir sota el cross-link un `<p class="auth-link auth-link--back">` amb `<NuxtLink to="/">← Tornar a la portada</NuxtLink>`

## 4. Estils `.auth-link` (scoped) a ambdues pàgines

- [x] 4.1 Afegir a `<style scoped>` de `login.vue` les classes `.auth-link` i `.auth-link--back` amb els tokens CSS:
  - `.auth-link`: `text-align: center; margin-top: 1rem; font-size: var(--font-size-sm); color: var(--color-text-secondary)`
  - `.auth-link a`: `color: var(--color-accent-primary); text-decoration: none; font-weight: var(--font-weight-medium)`
  - `.auth-link a:hover`: `color: var(--color-accent-primary-hover); text-decoration: underline`
- [x] 4.2 Replicar els mateixos estils a `<style scoped>` de `register.vue`

## 5. Tests unitaris

- [x] 5.1 Crear o actualitzar `frontend/pages/auth/login.spec.ts`:
  - Test unitari de `homeForRole()`: rol `admin` → `/admin/events`, qualsevol altre → `/`
  - Test de renderitzat: verifica que el `<NuxtLink to="/auth/register">` apareix al DOM
  - Test de renderitzat: verifica que el `<NuxtLink to="/">` (retorn portada) apareix al DOM
- [x] 5.2 Crear o actualitzar `frontend/pages/auth/register.spec.ts`:
  - Test de renderitzat: verifica que el `<NuxtLink to="/auth/login">` apareix al DOM
  - Test de renderitzat: verifica que el `<NuxtLink to="/">` (retorn portada) apareix al DOM

## 6. Verificació CI

- [x] 6.1 Executar `pnpm test` al workspace `frontend` — tots els tests han de passar
- [x] 6.2 Executar `pnpm type-check` — sense errors TypeScript
- [x] 6.3 Executar `pnpm lint` — sense errors ESLint

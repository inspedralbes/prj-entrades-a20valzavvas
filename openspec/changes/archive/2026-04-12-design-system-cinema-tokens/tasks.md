## 1. Tokens CSS globals

- [x] 1.1 Crear `frontend/assets/css/tokens.css` amb totes les variables `:root` del tema cinema (colors de fons, text, accents, seients, feedback, borders, radius, shadows, tipografia)
- [x] 1.2 Afegir bloc `body { background-color: var(--color-bg-base); color: var(--color-text-primary); font-family: var(--font-family-base); margin: 0; }` a `tokens.css`
- [x] 1.3 Afegir `'~/assets/css/tokens.css'` a l'array `css:` de `frontend/nuxt.config.ts`

## 2. Neteja de overrides existents

- [x] 2.1 Eliminar el `useHead` inline de `frontend/pages/events/[slug].vue` que sobreescriu `body { background: #0f0f23 }`
- [ ] 2.2 Verificar manualment que `/events/[slug]` segueix mostrant el fons fosc amb els tokens globals

## 3. Estilitzat de pàgines auth

- [x] 3.1 Afegir classes `.auth-page` (contenidor centrat, `min-height: 100dvh`, `background: var(--color-bg-base)`) i `.auth-card` (fons `var(--color-bg-card)`, border `var(--color-border)`, radius `var(--radius-lg)`, padding 2rem, max-width 400px) a `frontend/pages/auth/login.vue`
- [x] 3.2 Estilitzar inputs de login: `background: var(--color-bg-surface)`, `color: var(--color-text-primary)`, border `var(--color-border)`, focus `var(--color-border-focus)`
- [x] 3.3 Estilitzar etiquetes de camp: `color: var(--color-text-secondary)`
- [x] 3.4 Estilitzar missatges d'error `.field-error`: `color: var(--color-error)`
- [x] 3.5 Estilitzar botó de submit: `background: var(--color-accent-primary)`, hover `var(--color-accent-primary-hover)`
- [x] 3.6 Aplicar les mateixes classes `.auth-page` / `.auth-card` i estils de camp a `frontend/pages/auth/register.vue`

## 4. Estilitzat de pàgines sense estil (fons fosc)

- [x] 4.1 Aplicar fons fosc a `frontend/pages/entrades.vue` (classe o estil inline amb `var(--color-bg-base)`) i estilitzar el botó de logout
- [x] 4.2 Aplicar fons fosc a `frontend/pages/checkout.vue` (contingut resta TODO)
- [x] 4.3 Aplicar fons fosc a `frontend/pages/admin/index.vue` (contingut resta TODO)

## 5. Verificació i CI

- [x] 5.1 Executar `pnpm type-check` al workspace `frontend` i corregir errors
- [x] 5.2 Executar `pnpm lint` al workspace `frontend` i corregir avisos
- [x] 5.3 Executar `pnpm test` (tots els workspaces) i verificar que tots els tests passen
- [x] 5.4 Arrencar `pnpm dev` i verificar visualment que `/`, `/auth/login`, `/auth/register`, `/events/[slug]`, `/entrades`, `/checkout` i `/admin` mostren el tema cinema fosc
- [x] 5.5 Obrir DevTools a qualsevol pàgina i confirmar que `--color-bg-base`, `--color-accent-primary` i la resta de tokens apareixen a `:root`

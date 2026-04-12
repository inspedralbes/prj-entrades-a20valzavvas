## Why

Les pàgines `/auth/login`, `/auth/register`, `/entrades`, `/checkout` i `/admin` es renderitzen sobre fons blanc del navegador perquè no existeixen tokens CSS compartits ni estils globals: cada component existeix (MapaSeients, Seient, etc.) ha anat hardcodant els mateixos valors hexadecimals. Sense un design system centralitzat, cada pàgina nova replicarà manualment els valors del tema cinema, causant inconsistències progressives i deute visual creixent. Jira: [PE-60](https://lightweight-fitness.atlassian.net/browse/PE-60)

## What Changes

- **New** `assets/css/tokens.css` — fitxer de tokens CSS amb totes les variables `:root` del tema cinema fosc de Sala Onirica (colors, spacing, shadows, tipografia, estats de seients)
- **Modified** `nuxt.config.ts` — afegir `tokens.css` a l'array `css:` per carregar-lo globalment
- **Modified** `app.vue` (o `tokens.css`) — estils globals de `body` (`background-color`, `color`, `font-family`)
- **Modified** `pages/events/[slug].vue` — eliminar l'override `useHead` que aplica `body { background: #0f0f23 }` inline
- **Modified** `pages/auth/login.vue` — aplicar classes `.auth-page` / `.auth-card` i adaptar els camps del formulari al tema fosc
- **Modified** `pages/auth/register.vue` — idem que login
- **Modified** `pages/entrades.vue` — fons fosc + botó logout estilitzat
- **Modified** `pages/checkout.vue` — fons fosc (contingut resta TODO)
- **Modified** `pages/admin/index.vue` — fons fosc (contingut resta TODO)

## Capabilities

### New Capabilities

- `cinema-design-tokens`: Conjunt centralitzat de variables CSS `:root` que defineix el tema visual fosc de Sala Onirica. Inclou colors de fons, textos, accents violetes, estats de seients, feedback, borders, spacing (radius), shadows i tipografia. Disponible globalment a totes les pàgines del frontend.

### Modified Capabilities

- `frontend-auth-pages`: Les pàgines d'autenticació (`/auth/login`, `/auth/register`) passen d'HTML nu sobre fons blanc a estar estilitzades amb el tema cinema fosc. Els requisits de l'estructura `.auth-page` / `.auth-card` i l'estilat dels camps de formulari canvien per consumir els nous tokens.

## Impact

- **Frontend** (`frontend/`): `nuxt.config.ts`, `app.vue`, `assets/css/tokens.css` (nou), `pages/auth/login.vue`, `pages/auth/register.vue`, `pages/entrades.vue`, `pages/checkout.vue`, `pages/admin/index.vue`, `pages/events/[slug].vue`
- **Cap canvi al backend** — canvi purament de presentació
- **Cap nova dependència** — CSS natiu, sense librerías externes
- **No breaking** per als components existents — `MapaSeients.vue`, `Seient.vue`, etc. continuen funcionant amb valors hardcodats; l'adopció de variables és incremental
- **Testing**: cap lògica de negoci nova; la verificació és visual (DevTools + revisió manual de pàgines)

## Context

El frontend de Sala Onirica (Nuxt 3) no té cap fitxer CSS global amb tokens de disseny. Els estils del tema cinema fosc estan dispersos: `MapaSeients.vue` i `Seient.vue` usen valors hexadecimals hardcodats; `events/[slug].vue` aplica `body { background: #0f0f23 }` via `useHead`. Les pàgines `/auth/login`, `/auth/register`, `/entrades`, `/checkout` i `/admin/index` no tenen estils propis i es renderitzen sobre blanc.

La solució és introduir un únic fitxer CSS (`assets/css/tokens.css`) amb variables `:root`, registrar-lo a `nuxt.config.ts`, i aplicar els tokens a les pàgines sense estil. Els components existents **no es toquen** en aquest ticket (adopció incremental).

## Goals / Non-Goals

**Goals:**

- Crear `assets/css/tokens.css` amb tots els tokens del tema cinema extrets dels components existents
- Registrar el fitxer a `nuxt.config.ts` perquè estigui disponible a totes les pàgines
- Aplicar estils globals de `body` per eliminar el fons blanc
- Estilitzar les pàgines auth amb les classes `.auth-page` / `.auth-card`
- Aplicar fons fosc a `/entrades`, `/checkout` i `/admin/index`
- Eliminar l'override `useHead` a `events/[slug].vue`

**Non-Goals:**

- Refactoritzar `MapaSeients.vue`, `Seient.vue` ni cap component existent per usar variables (incremental)
- Implementar dark mode toggle
- Afegir animacions o transicions (PE-09)
- Crear cap component nou de Vue

## Decisions

### D1 — Fitxer CSS pur (no SCSS/Tailwind)

**Decisió**: `assets/css/tokens.css` amb CSS custom properties natives.

**Alternatives considerades**:
- SCSS variables: requeriria afegir `@nuxtjs/scss` i un preprocessador. Overhead innecessari per a tokens que el navegador pot consumir directament.
- Tailwind CSS config (`theme.extend`): canviaria l'estratègia de tota l'app. Fora d'abast.
- CSS-in-JS (UnoCSS/Windi): Nuxt 3 suporta UnoCSS però introduir-lo ara seria un canvi d'arquitectura, no un design system.

**Rationale**: CSS custom properties natives funcionen sense build-step, són llegibles des dels DevTools, i es poden consumir en qualsevol `<style scoped>` futur sense imports addicionals.

### D2 — Registre via `nuxt.config.ts css:[]`

**Decisió**: Afegir `'~/assets/css/tokens.css'` a l'array `css` de `nuxt.config.ts`.

**Alternatives considerades**:
- Import a `app.vue` via `<style>`: funcionaria però no seria un punt d'entrada formal per a assets globals.
- Plugin Nuxt: overhead innecessari per a un fitxer estàtic.

**Rationale**: El mecanisme oficial de Nuxt per a CSS globals és l'array `css:` — és el patró establert al projecte (p.ex. futures integracions de fonts o reset CSS seguiran el mateix camí).

### D3 — Estils `body` dins de `tokens.css` (no en `app.vue`)

**Decisió**: Afegir el bloc `body { background-color: var(--color-bg-base); ... }` directament a `tokens.css`, no a `app.vue`.

**Rationale**: Mantenir tot el tema en un únic fitxer facilita la seva inspecció i reutilització. `app.vue` conté lògica Vue; els estils de reset/base pertanyen al CSS global.

### D4 — Eliminació de `useHead` body override

**Decisió**: Eliminar el `useHead({ style: [{ innerHTML: 'body { background: #0f0f23 }' }] })` de `pages/events/[slug].vue` un cop `tokens.css` aplica el body globalment.

**Rationale**: L'override inline és redundant i podria causar parpadells (FOUC) en SSR si el CSS global s'aplica primer. Amb tokens globals, no cal.

## Risks / Trade-offs

| Risc | Mitigació |
|------|-----------|
| **FOUC (Flash of Unstyled Content)** en SSR — el HTML s'envia blanc fins que Nuxt injecta el CSS | `nuxt.config.ts css:[]` genera `<link rel="stylesheet">` al `<head>` en totes les pàgines, elimina el problema |
| **Conflicte** entre `tokens.css body` i l'override `useHead` de `[slug].vue` durant la migració | Eliminar el `useHead` en el mateix PR — no s'han de coexistir |
| **Components existents trenquen visualment** si les variables no estan disponibles quan es carreguen | El fitxer es carrega globalment abans que cap component; no hi ha risc de carrera |
| **Especificitat CSS** — `.auth-card` podria ser sobreescrit per estils inline existents | Les pàgines auth no tenen estils propis avui, especificitat no és un problema |

## Migration Plan

1. Crear `frontend/assets/css/tokens.css` amb tots els tokens
2. Afegir `'~/assets/css/tokens.css'` a `nuxt.config.ts`
3. Aplicar estils `body` a `tokens.css`
4. Eliminar `useHead` body override de `pages/events/[slug].vue`
5. Estilitzar `pages/auth/login.vue` i `pages/auth/register.vue` amb `.auth-page` / `.auth-card`
6. Aplicar classe `.page-dark` (o inline `background: var(--color-bg-base)`) a `pages/entrades.vue`, `pages/checkout.vue`, `pages/admin/index.vue`

**Rollback**: revertir el commit. Cap canvi de base de dades ni backend implicat.

## Open Questions

- Cap pregunta oberta — canvi de baix risc i ben delimitat per l'especificació de PE-60.

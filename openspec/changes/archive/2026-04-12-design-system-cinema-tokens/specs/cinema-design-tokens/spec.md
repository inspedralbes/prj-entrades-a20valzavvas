## ADDED Requirements

### Requirement: Fitxer de tokens CSS del tema cinema

El sistema SHALL disposar d'un fitxer `frontend/assets/css/tokens.css` que defineixi a `:root` tots els tokens del tema cinema fosc de Sala Onirica. El fitxer SHALL incloure variables de colors de fons (`--color-bg-base: #0f0f23`, `--color-bg-surface`, `--color-bg-card`, `--color-bg-card-hover`), colors de text (`--color-text-primary: #f1f5f9`, `--color-text-secondary`, `--color-text-muted`, `--color-text-disabled`), accents violetes (`--color-accent-primary: #7c3aed`, `--color-accent-primary-hover`, `--color-accent-secondary`, `--color-accent-indigo`), estats de seients (`--color-seat-available`, `--color-seat-reserved`, `--color-seat-mine`, `--color-seat-sold`), colors de feedback (`--color-success`, `--color-warning`, `--color-error`, `--color-info`), borders (`--color-border`, `--color-border-focus`), spacing/radius (`--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-seat`), shadows (`--shadow-glow-purple`, `--shadow-glow-green`, `--shadow-card`) i tipografia (`--font-family-base`, escales de mida i pes).

#### Scenario: Tokens disponibles a qualsevol pàgina via DevTools

- **GIVEN** que l'aplicació frontend s'ha arrencat (`pnpm dev`)
- **WHEN** un inspector inspecciona les CSS computades a `:root` en qualsevol pàgina (p.ex. `/`, `/auth/login`, `/events/[slug]`)
- **THEN** les variables `--color-bg-base`, `--color-accent-primary`, `--color-text-primary` i la resta de tokens apareixen definides

#### Scenario: El token `--color-bg-base` és `#0f0f23`

- **GIVEN** que `tokens.css` s'ha carregat
- **WHEN** s'evalua `getComputedStyle(document.documentElement).getPropertyValue('--color-bg-base')`
- **THEN** el valor retornat és `#0f0f23` (o equivalent)

#### Scenario: Tokens de seients estan disponibles

- **GIVEN** que `tokens.css` s'ha carregat
- **WHEN** s'avaluen `--color-seat-available`, `--color-seat-reserved`, `--color-seat-mine`, `--color-seat-sold`
- **THEN** cada variable retorna un color vàlid (no buit)

### Requirement: Integració global via `nuxt.config.ts`

El sistema SHALL registrar `tokens.css` a l'array `css:` de `nuxt.config.ts` perquè el fitxer es carregui globalment en totes les pàgines SSR i CSR. El fitxer CSS SHALL estar disponible sense cap import addicional en cap component o pàgina.

#### Scenario: El CSS és injectat al `<head>` de totes les pàgines

- **GIVEN** que l'app s'arrenca en mode SSR
- **WHEN** es fa una petició GET a `/` o a `/auth/login`
- **THEN** el HTML retornat conté un `<link rel="stylesheet">` que carrega `tokens.css` (o el bundle que l'inclou)

#### Scenario: Variables accessibles a `<style scoped>` sense imports

- **GIVEN** qualsevol component Vue del projecte
- **WHEN** s'usa `var(--color-bg-base)` dins d'un `<style scoped>` sense cap `@import`
- **THEN** el valor és resolt correctament pel navegador

### Requirement: Estils globals de `body`

El fitxer `tokens.css` SHALL incloure un bloc `body` que apliqui `background-color: var(--color-bg-base)`, `color: var(--color-text-primary)` i `font-family: var(--font-family-base)` i `margin: 0` a totes les pàgines. L'override `useHead` inline de `pages/events/[slug].vue` SHALL ser eliminat.

#### Scenario: Fons fosc a totes les pàgines

- **GIVEN** que `tokens.css` s'ha carregat globalment
- **WHEN** un Visitant navega a `/`, `/auth/login` o `/events/[slug]`
- **THEN** el fons del `body` és `#0f0f23` (tema cinema fosc) i NO és blanc

#### Scenario: Eliminació de l'override `useHead` a `[slug].vue`

- **GIVEN** que `tokens.css` aplica el fons al `body` globalment
- **WHEN** s'inspeccionaa el codi de `pages/events/[slug].vue`
- **THEN** no existeix cap crida `useHead` que sobreescrigui `body { background: ... }`

#### Scenario: Cap parpadell de fons blanc (FOUC)

- **GIVEN** que `nuxt.config.ts` inclou `tokens.css` a l'array `css:`
- **WHEN** el navegador carrega per primera vegada qualsevol pàgina de l'app
- **THEN** el `<head>` del HTML incloure el CSS abans que el contingut del `<body>`, evitant FOUC

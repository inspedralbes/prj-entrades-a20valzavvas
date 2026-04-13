## Why

Les pàgines `/auth/login` i `/auth/register` (implementades a PE-51) no disposen de navegació creuada entre elles ni d'un link de retorn a la portada, cosa que deixa l'usuari atrapat si arriba a la pàgina equivocada. A més, el redirect post-login dels compradors apunta a `/entrades` (pàgina buida) en lloc de `/` (portada). Aquests tres problemes de UX bloquegen un flux d'autenticació intuïtiu ara que la portada (PE-59) i els tokens CSS (PE-60) ja existeixen. Jira: [PE-62](https://lightweight-fitness.atlassian.net/browse/PE-62).

## What Changes

- Afegir link `Registra't` a `pages/auth/login.vue` que apunta a `/auth/register`
- Afegir link `Inicia sessió` a `pages/auth/register.vue` que apunta a `/auth/login`
- Afegir link `← Tornar a la portada` a ambdues pàgines auth que apunta a `/`
- Corregir `homeForRole()` a `pages/auth/login.vue`: redirect del comprador de `/entrades` → `/`
- Verificar que `pages/auth/register.vue` post-register navega a `/` (no cal canviar si ja és correcte)
- Aplicar estils `.auth-link` usant tokens CSS del design system (PE-60)

## Capabilities

### New Capabilities

- `auth-ux-navigation`: Cross-links de navegació entre pàgines auth i link de retorn a la portada, incloent estils amb tokens CSS

### Modified Capabilities

- `auth-login`: El redirect post-login del rol `comprador` canvia de `/entrades` a `/`

## Impact

- **Frontend**: `pages/auth/login.vue`, `pages/auth/register.vue` (template + script)
- **Stores**: sense canvis (la store `authStore` ja gestiona el login/register correctament)
- **CSS/Tokens**: ús de tokens `--color-text-secondary`, `--color-accent-primary`, `--color-accent-primary-hover`, `--font-size-sm`, `--font-weight-medium` de PE-60
- **Rutes afectades**: `/auth/login`, `/auth/register` (cap ruta nova)
- **Dependències**: PE-60 (tokens CSS) i PE-59 (portada `/`) han d'estar implementats

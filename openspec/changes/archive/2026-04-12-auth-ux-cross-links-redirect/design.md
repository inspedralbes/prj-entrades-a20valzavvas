## Context

Les pàgines `pages/auth/login.vue` i `pages/auth/register.vue` van ser implementades a PE-51 com a formularis funcionals però sense UX de navegació. La portada SSR (`/`) existeix des de PE-59 i els tokens CSS del design system estan disponibles des de PE-60. Ara cal completar el flux d'autenticació afegint navegació creuada i corregint el redirect post-login.

Estat actual:
- `login.vue`: `homeForRole()` retorna `/entrades` per a compradors (incorrecte)
- `register.vue`: `navigateTo('/')` post-register (correcte)
- Cap de les dues pàgines té links de navegació cap a l'altra ni cap a la portada
- Cap classe CSS per als links auxiliars

## Goals / Non-Goals

**Goals:**
- Cross-links bidireccionals login ↔ register
- Link "← Tornar a la portada" a ambdues pàgines
- Redirect post-login comprador a `/` en lloc de `/entrades`
- Estils `.auth-link` amb tokens CSS del design system

**Non-Goals:**
- Redisseny dels formularis d'autenticació
- "Recordar-me" / sessió persistent
- Recuperació de contrasenya
- OAuth / SSO
- Canvis al backend o a les stores Pinia

## Decisions

**Decisió 1 — Inline template links, sense component nou**

Els cross-links i el link de retorn s'afegeixen directament al template de cada pàgina com a `<p class="auth-link">` amb `<NuxtLink>`. No cal cap component nou, ja que aquests links no es reutilitzen en cap altra pàgina.

Alternativa considerada: component `AuthNav.vue` reutilitzable → descartada per over-engineering en dos usos únics.

**Decisió 2 — Estils scoped a cada pàgina**

Les classes `.auth-link` i `.auth-link--back` s'afegeixen amb `<style scoped>` a cada pàgina, usant els tokens CSS ja definits a PE-60. No cal un fitxer CSS global perquè les classes només s'usen a les pàgines auth.

**Decisió 3 — Correcció de `homeForRole()` sense refactoring**

La funció `homeForRole()` es corregeix amb un canvi d'una línia: `/entrades` → `/`. No es refactoritza la lògica de redirect (per exemple, suport a `?redirect=` query param) perquè no forma part de l'abast d'aquesta US.

```mermaid
flowchart TD
    A[Login correcte] --> B{homeForRole}
    B -->|admin| C[/admin/events]
    B -->|comprador| D[/ portada]
    E[Register correcte] --> F[navigateTo '/']
```

## Risks / Trade-offs

- **Cap risc tècnic significatiu.** Canvis puntuals de template i una línia de script.
- [Risc] Tokens CSS de PE-60 no disponibles → Mitigació: verificar que `--color-accent-primary` i la resta de tokens estan definits al design system abans d'implementar.
- [Trade-off] `?redirect=` no implementat: un usuari enviat a login des d'una pàgina protegida (futura) no tornarà automàticament al destí original. Acceptat per a aquesta US — fora d'abast.

## Testing Strategy

- Tests unitaris de `homeForRole()` a `pages/auth/login.vue` o en el fitxer de test co-located, verificant que:
  - rol `admin` → retorna `/admin/events`
  - rol `comprador` → retorna `/`
- Tests de renderitzat (Vitest + `@nuxt/test-utils`) per verificar que els `NuxtLink` de cross-navegació i retorn apareixen al DOM.
- No calen mocks addicionals: la funció `homeForRole` és pura.

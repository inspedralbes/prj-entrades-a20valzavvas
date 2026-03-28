## ADDED Requirements

### Requirement: Middleware d'autenticació per a rutes protegides

El sistema SHALL disposar d'un middleware Nuxt `middleware/auth.ts` definit amb `defineNuxtRouteMiddleware` que comprovi `authStore.isAuthenticated` abans de permetre l'accés a les rutes protegides. Si l'usuari no està autenticat, el middleware SHALL redirigir a `/auth/login`. Les pàgines `/checkout` i `/entrades` SHALL declarar `middleware: 'auth'` via `definePageMeta`.

#### Scenario: Redirecció a login sense token

- **GIVEN** un usuari sense token JWT (Visitant no autenticat)
- **WHEN** navega directament a `/checkout`
- **THEN** és redirigit a `/auth/login`
- **THEN** no es renderitza el contingut de `/checkout`

#### Scenario: Redirecció a login sense token a /entrades

- **GIVEN** un usuari sense token JWT (Visitant no autenticat)
- **WHEN** navega directament a `/entrades`
- **THEN** és redirigit a `/auth/login`

#### Scenario: Accés permès amb token vàlid

- **GIVEN** un usuari autenticat amb `authStore.isAuthenticated === true` (Comprador)
- **WHEN** navega a `/checkout`
- **THEN** la pàgina es renderitza correctament sense redirecció

#### Scenario: Accés permès amb token vàlid a /entrades

- **GIVEN** un usuari autenticat amb `authStore.isAuthenticated === true` (Comprador)
- **WHEN** navega a `/entrades`
- **THEN** la pàgina es renderitza correctament sense redirecció

#### Scenario: Testabilitat del middleware auth

- **GIVEN** un entorn de test amb `@nuxt/test-utils` i Vitest
- **WHEN** s'executa `pnpm test` al workspace `frontend`
- **THEN** tots els tests de `middleware/auth.spec.ts` passen sense errors

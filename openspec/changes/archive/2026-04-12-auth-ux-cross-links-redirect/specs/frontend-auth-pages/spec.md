## MODIFIED Requirements

### Requirement: Pàgina de login `/auth/login`

El sistema SHALL disposar d'una pàgina Nuxt `pages/auth/login.vue` accessible sense autenticació. La pàgina SHALL mostrar un formulari amb els camps `email` i `password`. En fer submit, la pàgina SHALL cridar `authStore.login({ email, password })`. Si l'acció té èxit, la pàgina SHALL redirigir l'usuari a `route.query.redirect` (si existeix) o, si no, en funció del rol: l'usuari amb rol `admin` SHALL ser redirigit a `/admin/events`; qualsevol altre rol (comprador) SHALL ser redirigit a `/` (portada). Si l'acció falla amb errors de validació, els missatges d'error del servidor SHALL mostrar-se associats al camp corresponent. Durant la petició, el botó de submit SHALL estar deshabilitat i mostrar un indicador de càrrega. Si l'usuari ja és autenticat (`authStore.isAuthenticated === true`), la pàgina SHALL redirigir-lo a `/` sense mostrar el formulari. La pàgina SHALL aplicar el tema cinema fosc: l'element arrel SHALL tenir la classe `.auth-page` (fons `var(--color-bg-base)`) i el formulari SHALL estar embolcallat en un `.auth-card` (fons `var(--color-bg-card)`, border `var(--color-border)`, radius `var(--radius-lg)`). El centrat vertical SHALL aplicar-se dins del `<main>` del layout (no des del top absolut del viewport); l'element `.auth-page` SHALL usar `min-height: 100%` i `display: flex; align-items: center; justify-content: center` de manera que ocupi l'espai disponible sota la navbar. Els camps d'input SHALL usar fons `var(--color-bg-surface)` i text `var(--color-text-primary)`. Els errors SHALL usar `var(--color-error)`.

#### Scenario: Login comprador redirigeix a la portada

- **GIVEN** un Comprador no autenticat a `/auth/login`
- **WHEN** s'autentica correctament i el seu rol és `comprador`
- **THEN** és redirigit a `/` (portada), NO a `/entrades`

#### Scenario: Login admin redirigeix al panell d'administració

- **GIVEN** un Administrador no autenticat a `/auth/login`
- **WHEN** s'autentica correctament i el seu rol és `admin`
- **THEN** és redirigit a `/admin/events`

#### Scenario: Login amb redirect previ redirigeix a la ruta original

- **GIVEN** un Visitant redirigit a `/auth/login?redirect=%2Fcheckout` pel middleware `auth`
- **WHEN** s'autentica correctament
- **THEN** l'usuari és redirigit a `/checkout`

#### Scenario: Errors de validació visibles per camp

- **GIVEN** un Visitant a `/auth/login`
- **WHEN** fa submit amb un email incorrecte o contrasenya errònia i el backend retorna `422` amb `errors.email` o `errors.password`
- **THEN** el missatge d'error del servidor apareix associat al camp corresponent del formulari
- **THEN** l'usuari NO és redirigit

#### Scenario: Botó disabled durant la petició

- **GIVEN** un Visitant a `/auth/login` que fa submit
- **WHEN** la petició és en curs (`isLoading === true`)
- **THEN** el botó de submit és `disabled`

#### Scenario: Usuari ja autenticat és redirigit

- **GIVEN** un Comprador ja autenticat (`authStore.isAuthenticated === true`)
- **WHEN** navega a `/auth/login`
- **THEN** és redirigit a `/` sense mostrar el formulari

#### Scenario: Testabilitat de la funció homeForRole

- **GIVEN** un entorn de test amb Vitest i la funció `homeForRole` testable de forma unitària
- **WHEN** s'executa `pnpm test` al workspace `frontend`
- **THEN** el test verifica que el rol `admin` retorna `/admin/events`
- **THEN** el test verifica que qualsevol altre rol retorna `/`

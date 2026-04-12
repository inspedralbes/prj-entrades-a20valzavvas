## MODIFIED Requirements

### Requirement: Pàgina de login `/auth/login`

El sistema SHALL disposar d'una pàgina Nuxt `pages/auth/login.vue` accessible sense autenticació. La pàgina SHALL mostrar un formulari amb els camps `email` i `password`. En fer submit, la pàgina SHALL cridar `authStore.login({ email, password })`. Si l'acció té èxit, SHALL redirigir l'usuari a `route.query.redirect` (si existeix) o a `/`. Si l'acció falla amb errors de validació, els missatges d'error del servidor SHALL mostrar-se associats al camp corresponent. Durant la petició, el botó de submit SHALL estar deshabilitat i mostrar un indicador de càrrega. Si l'usuari ja és autenticat (`authStore.isAuthenticated === true`), la pàgina SHALL redirigir-lo a `/` sense mostrar el formulari. La pàgina SHALL aplicar el tema cinema fosc: l'element arrel SHALL tenir la classe `.auth-page` (fons `var(--color-bg-base)`, centrat vertical) i el formulari SHALL estar embolcallat en un `.auth-card` (fons `var(--color-bg-card)`, border `var(--color-border)`, radius `var(--radius-lg)`). Els camps d'input SHALL usar fons `var(--color-bg-surface)` i text `var(--color-text-primary)`. Els errors SHALL usar `var(--color-error)`.

#### Scenario: Login amb credencials vàlides redirigeix a la portada

- **GIVEN** un Visitant no autenticat a `/auth/login`
- **WHEN** omple l'email i la contrasenya correctes i fa submit
- **THEN** es crida `authStore.login()` amb les credencials
- **THEN** l'usuari és redirigit a `/`

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

#### Scenario: Pàgina de login amb tema cinema fosc

- **GIVEN** un Visitant a `/auth/login`
- **WHEN** la pàgina carrega
- **THEN** el fons de la pàgina és `var(--color-bg-base)` (`#0f0f23`), NO blanc
- **THEN** el formulari és visible sobre un `.auth-card` amb fons fosc i border subtil

#### Scenario: Testabilitat de la pàgina de login

- **GIVEN** un entorn de test amb `@nuxt/test-utils` i Vitest amb `useAuthStore` mockejada
- **WHEN** s'executa `pnpm test` al workspace `frontend`
- **THEN** tots els tests de `pages/auth/login.spec.ts` passen sense errors

### Requirement: Pàgina de registre `/auth/register`

El sistema SHALL disposar d'una pàgina Nuxt `pages/auth/register.vue` accessible sense autenticació. La pàgina SHALL mostrar un formulari amb els camps `name`, `email`, `password` i `password_confirmation`. La pàgina SHALL validar al client que `password === password_confirmation` abans d'enviar la petició; si no coincideixen, SHALL mostrar un error local al camp `password_confirmation`. En fer submit amb dades vàlides, SHALL cridar `authStore.register({ name, email, password })`. Si l'acció té èxit, SHALL redirigir a `/`. Si l'acció falla amb errors del servidor (p. ex. email ja registrat), els missatges SHALL mostrar-se per camp. Durant la petició, el botó de submit SHALL estar deshabilitat i mostrar un indicador de càrrega. Si l'usuari ja és autenticat, la pàgina SHALL redirigir-lo a `/`. La pàgina SHALL aplicar el tema cinema fosc idèntic a `/auth/login`: classe `.auth-page` i `.auth-card` consumint variables CSS de `tokens.css`.

#### Scenario: Registre amb dades vàlides redirigeix a la portada

- **GIVEN** un Visitant no autenticat a `/auth/register`
- **WHEN** omple `name`, `email`, `password` i `password_confirmation` amb valors vàlids i coincidents, i fa submit
- **THEN** es crida `authStore.register()` amb `{ name, email, password }`
- **THEN** l'usuari és redirigit a `/`

#### Scenario: Error local quan les contrasenyes no coincideixen

- **GIVEN** un Visitant a `/auth/register`
- **WHEN** introdueix `password` i `password_confirmation` amb valors diferents i fa submit
- **THEN** es mostra un error al camp `password_confirmation` indicant que les contrasenyes no coincideixen
- **THEN** NO es fa cap crida a `authStore.register()`

#### Scenario: Error de servidor per email ja registrat

- **GIVEN** un Visitant a `/auth/register`
- **WHEN** fa submit amb un email ja existent i el backend retorna `422` amb `errors.email`
- **THEN** el missatge d'error apareix associat al camp `email`
- **THEN** l'usuari NO és redirigit

#### Scenario: Botó disabled durant la petició

- **GIVEN** un Visitant a `/auth/register` que fa submit amb dades vàlides
- **WHEN** la petició és en curs (`isLoading === true`)
- **THEN** el botó de submit és `disabled`

#### Scenario: Usuari ja autenticat és redirigit

- **GIVEN** un Comprador ja autenticat (`authStore.isAuthenticated === true`)
- **WHEN** navega a `/auth/register`
- **THEN** és redirigit a `/` sense mostrar el formulari

#### Scenario: Pàgina de registre amb tema cinema fosc

- **GIVEN** un Visitant a `/auth/register`
- **WHEN** la pàgina carrega
- **THEN** el fons de la pàgina és `var(--color-bg-base)` (`#0f0f23`), NO blanc
- **THEN** el formulari és visible sobre un `.auth-card` amb fons fosc i border subtil

#### Scenario: Testabilitat de la pàgina de registre

- **GIVEN** un entorn de test amb `@nuxt/test-utils` i Vitest amb `useAuthStore` mockejada
- **WHEN** s'executa `pnpm test` al workspace `frontend`
- **THEN** tots els tests de `pages/auth/register.spec.ts` passen sense errors

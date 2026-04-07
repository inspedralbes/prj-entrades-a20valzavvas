## MODIFIED Requirements

### Requirement: Middleware d'autorització per a rutes d'administració

El sistema SHALL disposar d'un middleware Nuxt `middleware/admin.ts` definit amb `defineNuxtRouteMiddleware` que comprovi `authStore.user?.role === 'admin'` abans de permetre l'accés. Si l'usuari no té el rol `admin`, el middleware SHALL redirigir a `/`. Totes les pàgines sota `/admin/**` SHALL declarar `middleware: 'admin'` via `definePageMeta`. La pàgina `/admin/events` SHALL declarar addicionalment `ssr: false` per evitar exposar dades d'admin en el HTML inicial.

#### Scenario: Redirecció a / sense rol admin

- **GIVEN** un usuari autenticat amb rol `comprador`
- **WHEN** navega a `/admin`
- **THEN** és redirigit a `/`
- **THEN** no es renderitza el contingut del panell d'administració

#### Scenario: Redirecció a / des de subruta admin

- **GIVEN** un usuari autenticat amb rol `comprador`
- **WHEN** navega a `/admin/events`
- **THEN** és redirigit a `/`

#### Scenario: Redirecció a login si no autenticat

- **GIVEN** un usuari sense token JWT (Visitant)
- **WHEN** navega a `/admin`
- **THEN** és redirigit a `/auth/login` (el middleware `auth` actua primer) o a `/` si el middleware `admin` actua sol

#### Scenario: Accés permès amb rol admin

- **GIVEN** un usuari autenticat amb `authStore.user.role === 'admin'` (Administrador)
- **WHEN** navega a `/admin`
- **THEN** la pàgina es renderitza correctament sense redirecció

#### Scenario: Accés permès a subrutes admin amb rol correcte

- **GIVEN** un usuari autenticat amb `authStore.user.role === 'admin'` (Administrador)
- **WHEN** navega a `/admin/events`
- **THEN** la pàgina es renderitza correctament sense redirecció

#### Scenario: La pàgina /admin/events no exposa dades en el HTML del servidor

- **GIVEN** un usuari autenticat amb rol `admin`
- **WHEN** el servidor processa la ruta `/admin/events`
- **THEN** Nuxt no executa el fetch de l'API al servidor (ssr: false garantit per definePageMeta)

#### Scenario: Testabilitat del middleware admin

- **GIVEN** un entorn de test amb `@nuxt/test-utils` i Vitest
- **WHEN** s'executa `pnpm test` al workspace `frontend`
- **THEN** tots els tests de `middleware/admin.spec.ts` passen sense errors

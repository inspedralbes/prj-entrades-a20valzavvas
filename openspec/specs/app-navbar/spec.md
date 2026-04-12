## Purpose

Component global de navegació (`AppNavbar`) muntat a `app.vue`, visible a totes les rutes. Mostra el logo, ítems de navegació diferenciats per rol i l'acció de logout.

## Requirements

### Requirement: Component AppNavbar persistent a totes les pàgines

El sistema SHALL disposar d'un component `components/AppNavbar.vue` muntat globalment des de `app.vue`. La navbar SHALL ser visible a totes les rutes de l'aplicació. L'alçada SHALL ser aproximadament 56px. El fons SHALL usar `var(--color-bg-surface)` amb un `border-bottom` de color `var(--color-border)`. La navbar SHALL mostrar el logo "SALA ONIRICA" a l'esquerra, linkejat a `/`.

#### Scenario: Navbar visible a la portada

- **GIVEN** qualsevol usuari (Visitant, Comprador o Administrador) navega a `/`
- **WHEN** la pàgina carrega
- **THEN** el component `AppNavbar` és visible a la part superior de la pàgina
- **THEN** el logo "SALA ONIRICA" és visible i linkejat a `/`

#### Scenario: Navbar visible a la pàgina d'event

- **GIVEN** qualsevol usuari navega a `/events/[slug]`
- **WHEN** la pàgina carrega
- **THEN** el component `AppNavbar` és visible per sobre del topbar de l'event

#### Scenario: Navbar visible a les pàgines protegides

- **GIVEN** un Comprador autenticat navega a `/entrades` o `/checkout`
- **WHEN** la pàgina carrega
- **THEN** el component `AppNavbar` és visible a la part superior

#### Scenario: Testabilitat del component AppNavbar

- **GIVEN** un entorn de test amb `@nuxt/test-utils` i Vitest amb `useAuthStore` mockejada
- **WHEN** s'executa `pnpm test` al workspace `frontend`
- **THEN** tots els tests de `components/AppNavbar.spec.ts` passen sense errors

### Requirement: Contingut de la navbar per rol

La navbar SHALL mostrar ítems de navegació diferenciats segons l'estat d'autenticació i el rol de l'usuari, llegits des de `authStore`.

| Ítem | Visible per | Ruta/Acció |
|------|-------------|------------|
| "Events" | Tots | → `/` |
| "Iniciar sessió" | No autenticat | → `/auth/login` |
| "Registrar-se" | No autenticat | → `/auth/register` |
| "Hola, {nom}" | Autenticat | (informatiu) |
| "Entrades" | Comprador i Admin autenticats | → `/entrades` |
| "Panel Admin" | Admin (`role === 'admin'`) | → `/admin/events` |
| "Tancar sessió" | Autenticat | `authStore.logout()` + `navigateTo('/auth/login')` |

#### Scenario: Visitant no autenticat veu links de login i registre

- **GIVEN** un Visitant no autenticat (`authStore.isAuthenticated === false`)
- **WHEN** visualitza la navbar
- **THEN** la navbar mostra "Iniciar sessió" i "Registrar-se"
- **THEN** la navbar NO mostra "Entrades", "Panel Admin" ni "Tancar sessió"

#### Scenario: Comprador autenticat veu els seus links

- **GIVEN** un Comprador autenticat (`authStore.user.role !== 'admin'`)
- **WHEN** visualitza la navbar
- **THEN** la navbar mostra "Hola, {nom}", "Entrades" i "Tancar sessió"
- **THEN** la navbar NO mostra "Panel Admin", "Iniciar sessió" ni "Registrar-se"

#### Scenario: Administrador autenticat veu el link d'admin

- **GIVEN** un Administrador autenticat (`authStore.user.role === 'admin'`)
- **WHEN** visualitza la navbar
- **THEN** la navbar mostra "Panel Admin", "Entrades" i "Tancar sessió"
- **THEN** la navbar NO mostra "Iniciar sessió" ni "Registrar-se"

### Requirement: Link actiu destacat a la navbar

La navbar SHALL detectar la ruta activa amb `useRoute()` i aplicar el color `var(--color-accent-primary)` al link de la ruta actual.

#### Scenario: Link actiu quan s'és a la portada

- **GIVEN** qualsevol usuari es troba a `/`
- **WHEN** visualitza la navbar
- **THEN** el link "Events" (o logo) mostra el color `var(--color-accent-primary)`

#### Scenario: Link inactiu per a rutes no seleccionades

- **GIVEN** qualsevol usuari es troba a `/entrades`
- **WHEN** visualitza la navbar
- **THEN** el link "Entrades" mostra el color d'accent
- **THEN** el link "Events" mostra el color de text per defecte

### Requirement: Logout des de la navbar

La navbar SHALL executar el logout quan l'usuari autenticat clica "Tancar sessió". L'acció SHALL cridar `authStore.logout()` i redirigir a `/auth/login`. El botó de logout inline de `pages/entrades.vue` SHALL ser eliminat.

#### Scenario: Logout des de la navbar

- **GIVEN** un Comprador autenticat clica "Tancar sessió" a la navbar
- **WHEN** l'acció s'executa
- **THEN** es crida `authStore.logout()`
- **THEN** el token JWT és esborrat de localStorage
- **THEN** l'usuari és redirigit a `/auth/login`

#### Scenario: `pages/entrades.vue` no té botó de logout inline

- **GIVEN** un Comprador autenticat navega a `/entrades`
- **WHEN** la pàgina carrega
- **THEN** la pàgina `/entrades` NO mostra cap botó de "Tancar sessió" propi (el logout és exclusivament a la navbar)

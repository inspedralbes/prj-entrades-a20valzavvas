## ADDED Requirements

### Requirement: Cross-links de navegació entre pàgines auth

Les pàgines `/auth/login` i `/auth/register` SHALL mostrar, sota el formulari, un link de text que permeti navegar a l'altra pàgina auth. La pàgina `/auth/login` SHALL mostrar un link "Registra't" que apunta a `/auth/register`. La pàgina `/auth/register` SHALL mostrar un link "Inicia sessió" que apunta a `/auth/login`. Ambdós links SHALL usar `<NuxtLink>` i tenir la classe `.auth-link`.

#### Scenario: Link "Registra't" visible a login

- **GIVEN** un Visitant a `/auth/login`
- **WHEN** la pàgina carrega
- **THEN** apareix un element amb classe `.auth-link` que conté un `<NuxtLink to="/auth/register">` amb text "Registra't"

#### Scenario: Link "Inicia sessió" visible a register

- **GIVEN** un Visitant a `/auth/register`
- **WHEN** la pàgina carrega
- **THEN** apareix un element amb classe `.auth-link` que conté un `<NuxtLink to="/auth/login">` amb text "Inicia sessió"

#### Scenario: Navegació des de login a register

- **GIVEN** un Visitant a `/auth/login`
- **WHEN** fa clic a l'enllaç "Registra't"
- **THEN** és redirigit a `/auth/register`

#### Scenario: Navegació des de register a login

- **GIVEN** un Visitant a `/auth/register`
- **WHEN** fa clic a l'enllaç "Inicia sessió"
- **THEN** és redirigit a `/auth/login`

#### Scenario: Testabilitat dels cross-links

- **GIVEN** un entorn de test amb `@nuxt/test-utils` i Vitest
- **WHEN** es renderitza `pages/auth/login.vue` i `pages/auth/register.vue`
- **THEN** el test pot localitzar el `<NuxtLink>` de cross-navegació i verificar el seu atribut `to`

### Requirement: Link de retorn a la portada a les pàgines auth

Les pàgines `/auth/login` i `/auth/register` SHALL mostrar, sota els cross-links, un link de text "← Tornar a la portada" que apunta a `/`. El link SHALL usar `<NuxtLink>` i tenir les classes `.auth-link.auth-link--back`.

#### Scenario: Link "Tornar a la portada" visible a login

- **GIVEN** un Visitant a `/auth/login`
- **WHEN** la pàgina carrega
- **THEN** apareix un element amb classes `.auth-link.auth-link--back` que conté un `<NuxtLink to="/">` amb text "← Tornar a la portada"

#### Scenario: Link "Tornar a la portada" visible a register

- **GIVEN** un Visitant a `/auth/register`
- **WHEN** la pàgina carrega
- **THEN** apareix un element amb classes `.auth-link.auth-link--back` que conté un `<NuxtLink to="/">` amb text "← Tornar a la portada"

#### Scenario: Navegació cap a la portada des de login

- **GIVEN** un Visitant a `/auth/login`
- **WHEN** fa clic a "← Tornar a la portada"
- **THEN** és redirigit a `/`

### Requirement: Estils dels links de navegació auth

Les classes `.auth-link` i `.auth-link--back` SHALL aplicar els tokens CSS del design system per mantenir coherència visual amb el tema cinema fosc. El text SHALL usar `var(--color-text-secondary)`. Els `<a>` dins de `.auth-link` SHALL usar `var(--color-accent-primary)` sense `text-decoration` per defecte, i en `:hover` SHALL canviar a `var(--color-accent-primary-hover)` i mostrar `text-decoration: underline`. La font SHALL usar `var(--font-size-sm)` i `var(--font-weight-medium)`.

#### Scenario: Estils aplicats amb tokens CSS a login

- **GIVEN** un Visitant a `/auth/login` amb el design system de PE-60 carregat
- **WHEN** la pàgina carrega
- **THEN** el text dels paragraphs `.auth-link` usa `var(--color-text-secondary)`
- **THEN** els links dins de `.auth-link` usen `var(--color-accent-primary)` com a color

#### Scenario: Hover dels links canvia color i afegeix subratllat

- **GIVEN** un Visitant a qualsevol pàgina auth
- **WHEN** fa hover sobre un link `.auth-link a`
- **THEN** el color canvia a `var(--color-accent-primary-hover)` i apareix `text-decoration: underline`

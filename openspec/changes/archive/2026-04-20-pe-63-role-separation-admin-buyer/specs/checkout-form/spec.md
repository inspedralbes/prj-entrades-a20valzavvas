## ADDED Requirements

### Requirement: Guard de rol al frontend — admin redirigit des de /checkout

La pàgina `/checkout` SHALL aplicar el middleware `buyer-only` que comprovi `authStore.user?.role === 'admin'`. Si l'usuari autenticat és admin, SHALL redirigir a `/admin` sense renderitzar el formulari de compra. El middleware SHALL executar-se abans de la hidratació del component.

#### Scenario: Admin navega directament a /checkout

- **GIVEN** un usuari autenticat amb `role = 'admin'`
- **WHEN** navega a `/checkout` (directament o via link)
- **THEN** el middleware `buyer-only` el redirigeix a `/admin`
- **THEN** el formulari de compra no es renderitza en cap moment

#### Scenario: Comprador accedeix a /checkout (no afectat)

- **GIVEN** un usuari autenticat amb `role = 'comprador'` i reserves actives
- **WHEN** navega a `/checkout`
- **THEN** el middleware `buyer-only` no intervé i el formulari es renderitza normalment

#### Scenario: Usuari no autenticat intenta accedir a /checkout

- **GIVEN** un visitant sense sessió
- **WHEN** intenta navegar a `/checkout`
- **THEN** el middleware `auth` (executat previ a `buyer-only`) redirigeix a `/auth/login`

#### Scenario: Testabilitat — redirecció d'admin des de /checkout

- **WHEN** s'executa el test del middleware `buyer-only.ts` simulant `authStore.user.role = 'admin'`
- **THEN** `navigateTo('/admin')` és invocat
- **THEN** `navigateTo('/')` NO és invocat

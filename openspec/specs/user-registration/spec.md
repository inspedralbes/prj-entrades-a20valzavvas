## Purpose

Defineix el comportament de l'endpoint de registre d'usuari (`POST /api/auth/register`) al backend Laravel, incloent la validació del payload, la creació de l'usuari amb rol `comprador`, la generació del token Sanctum i la cobertura de tests de feature.

## Requirements

### Requirement: Registre d'usuari via POST /api/auth/register

El sistema SHALL exposar un endpoint `POST /api/auth/register` accessible sense autenticació que validi el payload, creï un usuari amb `role = comprador` i retorni un token Sanctum i les dades de l'usuari amb codi HTTP `201`.

#### Scenario: Registre correcte amb payload vàlid

- **GIVEN** un payload JSON vàlid amb `name`, `email`, `password` i `password_confirmation` coincidents
- **WHEN** s'envia `POST /api/auth/register`
- **THEN** la resposta té codi HTTP `201`
- **THEN** la resposta conté `token` (string no buit)
- **THEN** la resposta conté `user.id`, `user.name`, `user.email` i `user.role`
- **THEN** `user.role` és `comprador`
- **THEN** l'usuari existeix a la base de dades amb la contrasenya hashejada (bcrypt)

#### Scenario: Email duplicat retorna 422

- **GIVEN** un email ja registrat a la BD
- **WHEN** s'envia `POST /api/auth/register` amb el mateix email
- **THEN** la resposta té codi HTTP `422`
- **THEN** la resposta conté l'error `email: The email has already been taken.`

#### Scenario: Camps obligatoris absents retornen 422

- **GIVEN** un payload buit `{}`
- **WHEN** s'envia `POST /api/auth/register`
- **THEN** la resposta té codi HTTP `422`
- **THEN** la resposta conté errors per als camps `name`, `email` i `password`

#### Scenario: Contrasenya sense confirmació retorna 422

- **GIVEN** un payload amb `name`, `email`, `password` però sense `password_confirmation`
- **WHEN** s'envia `POST /api/auth/register`
- **THEN** la resposta té codi HTTP `422`
- **THEN** la resposta conté l'error per al camp `password`

#### Scenario: Email amb format invàlid retorna 422

- **GIVEN** un payload amb `email: "no-es-un-email"`
- **WHEN** s'envia `POST /api/auth/register`
- **THEN** la resposta té codi HTTP `422`
- **THEN** la resposta conté l'error de format per al camp `email`

#### Scenario: Contrasenya amb menys de 8 caràcters retorna 422

- **GIVEN** un payload amb `password: "1234567"` (7 caràcters)
- **WHEN** s'envia `POST /api/auth/register`
- **THEN** la resposta té codi HTTP `422`
- **THEN** la resposta conté l'error de mínim per al camp `password`

### Requirement: Testabilitat del registre d'usuari

El sistema SHALL poder verificar el comportament de l'endpoint `POST /api/auth/register` mitjançant tests de feature de Laravel que cobreixin el cas d'èxit i els principals casos d'error.

#### Scenario: Test de feature cobreix registre correcte

- **GIVEN** un entorn de test amb `RefreshDatabase`
- **WHEN** s'executa el test de registre amb payload vàlid
- **THEN** el test comprova que la resposta és `201` i conté `token` i `user`
- **THEN** el test comprova que l'usuari existeix a la BD (`assertDatabaseHas('users', ...)`)

#### Scenario: Test de feature cobreix email duplicat

- **GIVEN** un usuari ja existent a la BD de test
- **WHEN** s'executa el test de registre amb el mateix email
- **THEN** el test comprova que la resposta és `422` i conté l'error de `email`

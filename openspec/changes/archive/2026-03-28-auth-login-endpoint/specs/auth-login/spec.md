## ADDED Requirements

### Requirement: Login d'usuari via POST /api/auth/login

El sistema SHALL exposar un endpoint `POST /api/auth/login` accessible sense autenticació que validi les credencials de l'usuari, generi un token Sanctum i retorni les dades bàsiques de l'usuari amb codi HTTP `200`. En cas de credencials incorrectes, el sistema SHALL retornar `401` amb un missatge genèric.

#### Scenario: Login correcte retorna token i dades d'usuari

- **GIVEN** un usuari existent a la BD amb email `user@example.com` i contrasenya hashejada
- **WHEN** s'envia `POST /api/auth/login` amb `{ "email": "user@example.com", "password": "password123" }`
- **THEN** la resposta té codi HTTP `200`
- **THEN** la resposta conté `token` (string no buit)
- **THEN** la resposta conté `user.id`, `user.name`, `user.email` i `user.role`
- **THEN** `user.email` és `user@example.com`

#### Scenario: Credencials incorrectes retornen 401

- **GIVEN** un usuari existent a la BD amb email `user@example.com`
- **WHEN** s'envia `POST /api/auth/login` amb `{ "email": "user@example.com", "password": "wrongpassword" }`
- **THEN** la resposta té codi HTTP `401`
- **THEN** la resposta conté `{ "message": "Credencials incorrectes" }`

#### Scenario: Email no registrat retorna 401

- **GIVEN** que no existeix cap usuari amb email `unknown@example.com`
- **WHEN** s'envia `POST /api/auth/login` amb `{ "email": "unknown@example.com", "password": "anypassword" }`
- **THEN** la resposta té codi HTTP `401`
- **THEN** la resposta conté `{ "message": "Credencials incorrectes" }`

#### Scenario: Camps obligatoris absents retornen 422

- **GIVEN** un payload buit `{}`
- **WHEN** s'envia `POST /api/auth/login`
- **THEN** la resposta té codi HTTP `422`
- **THEN** la resposta conté errors de validació per als camps `email` i `password`

#### Scenario: Email amb format invàlid retorna 422

- **GIVEN** un payload `{ "email": "no-es-un-email", "password": "password123" }`
- **WHEN** s'envia `POST /api/auth/login`
- **THEN** la resposta té codi HTTP `422`
- **THEN** la resposta conté l'error de format per al camp `email`

#### Scenario: L'endpoint és accessible des del proxy Nginx

- **GIVEN** que Nginx està configurat com a reverse proxy
- **WHEN** s'envia `POST /api/auth/login` a través de Nginx
- **THEN** la petició arriba al Laravel Service i la resposta té codi HTTP `200` o `401` (no `502` ni `404`)

### Requirement: Testabilitat del login d'usuari

El sistema SHALL poder verificar el comportament de l'endpoint `POST /api/auth/login` mitjançant tests de feature de Laravel que cobreixin el cas d'èxit i els principals casos d'error.

#### Scenario: Test de feature cobreix login correcte

- **GIVEN** un entorn de test amb `RefreshDatabase` i un usuari creat amb `User::factory()`
- **WHEN** s'executa el test de login amb credencials vàlides
- **THEN** el test comprova que la resposta és `200` i conté `token` i `user`
- **THEN** el test comprova que `user.email` coincideix amb el de l'usuari de test

#### Scenario: Test de feature cobreix credencials incorrectes

- **GIVEN** un usuari existent a la BD de test
- **WHEN** s'executa el test de login amb contrasenya incorrecta
- **THEN** el test comprova que la resposta és `401` i conté `message`

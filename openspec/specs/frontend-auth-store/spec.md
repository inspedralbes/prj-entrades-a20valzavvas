## Purpose

Store Pinia per a la gestió de l'estat d'autenticació de l'usuari al frontend, amb persistència del token a `localStorage`.

## Requirements

### Requirement: Store Pinia d'autenticació amb persistència a localStorage

El sistema SHALL disposar d'una store Pinia `stores/auth.ts` que gestioni l'estat d'autenticació de l'usuari. L'estat SHALL contenir `token` (string o null), `user` (objecte amb `id`, `name`, `email`, `role` o null) i `isAuthenticated` (booleà derivat de la presència del token). Les accions `login()`, `logout()` i `register()` SHALL actualitzar l'estat i persistir o eliminar el token de `localStorage`. L'acció `initFromStorage()` SHALL recuperar el token de `localStorage` en inicialitzar l'aplicació.

#### Scenario: Login desa el token i activa isAuthenticated

- **GIVEN** un usuari no autenticat
- **WHEN** es crida `authStore.login({ email, password })` amb credencials vàlides i el backend retorna `{ token, user }`
- **THEN** `authStore.token` és el valor retornat pel backend
- **THEN** `authStore.isAuthenticated` és `true`
- **THEN** `authStore.user` conté `id`, `name`, `email` i `role`
- **THEN** el token és desat a `localStorage` sota la clau `auth_token`

#### Scenario: Logout neteja l'estat i elimina el token de localStorage

- **GIVEN** un usuari autenticat amb token a `localStorage`
- **WHEN** es crida `authStore.logout()`
- **THEN** `authStore.token` és `null`
- **THEN** `authStore.isAuthenticated` és `false`
- **THEN** `authStore.user` és `null`
- **THEN** `localStorage` no conté la clau `auth_token`

#### Scenario: initFromStorage recupera el token en reiniciar

- **GIVEN** que `localStorage` conté la clau `auth_token` amb un token vàlid
- **WHEN** es crida `authStore.initFromStorage()`
- **THEN** `authStore.token` és el valor de `localStorage`
- **THEN** `authStore.isAuthenticated` és `true`

#### Scenario: initFromStorage no fa res si no hi ha token

- **GIVEN** que `localStorage` no conté la clau `auth_token`
- **WHEN** es crida `authStore.initFromStorage()`
- **THEN** `authStore.token` és `null`
- **THEN** `authStore.isAuthenticated` és `false`

#### Scenario: Testabilitat de la store

- **GIVEN** un entorn de test amb `@pinia/testing` i `localStorage` mockejat
- **WHEN** s'executa `pnpm test` al workspace `frontend`
- **THEN** tots els tests de `stores/auth.spec.ts` passen sense errors

## Why

Els endpoints de register (`POST /api/auth/register`) i login (`POST /api/auth/login`) ja estan operatius, però no existeixen pàgines al frontend que els exposin a l'usuari. Qualsevol visitant que vulgui comprar entrades necessita un formulari de registre o de login per obtenir el token JWT i poder accedir a les rutes protegides. Jira: [PE-51](https://lightweight-fitness.atlassian.net/browse/PE-51)

## What Changes

- Nova pàgina `pages/auth/login.vue`: formulari amb camps `email` i `password`, crida `authStore.login()`, redirecció a la ruta anterior o `/` en èxit, errors de validació per camp i estat de càrrega
- Nova pàgina `pages/auth/register.vue`: formulari amb camps `name`, `email`, `password` i `password_confirmation`, crida `authStore.register()`, redirecció a `/` en èxit, errors de validació per camp i estat de càrrega
- Les pàgines són rutes públiques (no requereixen token); l'usuari ja autenticat que les visiti és redirigit a `/`

## Capabilities

### New Capabilities

- `frontend-auth-pages`: Pàgines Nuxt `/auth/login` i `/auth/register` amb formularis reactius, gestió d'errors del servidor per camp i estat de càrrega; consumeixen la store `auth` existent.

### Modified Capabilities

<!-- Cap especificació existent canvia els seus requisits de comportament -->

## Impact

- **Frontend**: nous fitxers `pages/auth/login.vue` i `pages/auth/register.vue`
- **Store**: `stores/auth.ts` (spec `frontend-auth-store`) — es consumeix però no es modifica
- **Middleware**: `middleware/auth.ts` ja redirigeix a `/auth/login`; ara la pàgina existeix
- **Dependències**: `user-registration` (US-00-02) i `auth-login` (US-00-03) han d'estar operatius
- **Testing**: tests de `pages/auth/login.spec.ts` i `pages/auth/register.spec.ts` amb `@nuxt/test-utils` i Vitest

## Non-goals

- OAuth / login social
- Recordar-me (`remember_me`) ni cookies persistents
- Recuperació de contrasenya (password reset)
- Gestió del perfil d'usuari

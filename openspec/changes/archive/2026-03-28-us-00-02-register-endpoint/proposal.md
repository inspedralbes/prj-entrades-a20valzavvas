## Why

Qualsevol visitant necessita poder crear un compte per poder reservar seients. Sense un endpoint de registre, no és possible autenticar usuaris ni emetre tokens JWT per accedir als recursos protegits de la plataforma.

## What Changes

- Nou endpoint `POST /api/auth/register` al Laravel Service, accessible sense autenticació
- Nova classe `RegisterRequest` (FormRequest) per validar `name`, `email`, `password` i `password_confirmation`
- Lògica de registre a `AuthController@register`: crea l'usuari amb `role = comprador` i retorna un token Sanctum + dades de l'usuari
- Respostes: `201` amb `{ token, user: { id, name, email, role } }` en cas d'èxit; `422` amb errors per camp en cas de validació fallida

## Capabilities

### New Capabilities

- `user-registration`: Registre d'usuaris via `POST /api/auth/register`. Valida camps, crea l'usuari amb rol `comprador` per defecte, i retorna token JWT de Sanctum + dades de l'usuari.

### Modified Capabilities

<!-- Cap especificació existent canvia els seus requisits amb aquest canvi. -->

## Impact

- **Laravel Service** (`AuthController`, nou `RegisterRequest`)
- **Mòdul d'autenticació**: primer endpoint autenticat; depèn de `laravel-sanctum` (US-00-01)
- **Base de dades**: taula `users` amb camp `role` (ja definida a `laravel-db-schema`)
- **Nginx proxy**: l'endpoint ha d'estar accessible a `/api/auth/register` (ja configurat a `nginx-proxy`)
- **Jira**: [PE-48](https://lightweight-fitness.atlassian.net/browse/PE-48)
- **Testing**: cal afegir tests unitaris per `AuthController@register` i `RegisterRequest` amb Pest/PHPUnit

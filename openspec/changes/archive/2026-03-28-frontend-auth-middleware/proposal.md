## Why

Les rutes protegides del frontend (`/checkout`, `/entrades`, `/admin/**`) no disposen de cap mecanisme que validi el token JWT de l'usuari ni que redirigeixi els usuaris no autenticats. Sense aquest middleware, qualsevol visitant pot accedir directament a les pàgines de compra i d'administració. (Jira: PE-50)

## What Changes

- Nova Pinia store `stores/auth.ts` amb estat `{ token, user, isAuthenticated }` i accions `login()`, `logout()`, `register()`
- Nou middleware Nuxt `middleware/auth.ts` que comprova `auth.isAuthenticated` i redirigeix a `/auth/login` si és fals
- Nou middleware Nuxt `middleware/admin.ts` que comprova `auth.user.role === 'admin'` i redirigeix a `/` si no compleix
- Aplicació dels middlewares a les rutes: `/checkout` i `/entrades` → `auth`; `/admin/**` → `admin`
- Persistència del token a `localStorage` i recuperació a `app.vue` al muntar el component

## Capabilities

### New Capabilities

- `frontend-auth-store`: Pinia store d'autenticació amb estat, accions `login()`, `logout()`, `register()` i persistència via `localStorage`
- `frontend-auth-middleware`: Middleware Nuxt per protegir rutes `/checkout` i `/entrades` que redirigeix usuaris no autenticats a `/auth/login`
- `frontend-admin-middleware`: Middleware Nuxt per protegir rutes `/admin/**` que redirigeix usuaris sense rol `admin` a `/`

### Modified Capabilities

_(cap canvi de requisits en capabilities existents)_

## Impact

- **Frontend** (`frontend/`): nous fitxers `stores/auth.ts`, `middleware/auth.ts`, `middleware/admin.ts`; modificació de `app.vue` per recuperar el token en muntatge
- **Rutes protegides**: `/checkout`, `/entrades`, `/admin`, `/admin/events`, `/admin/events/new`, `/admin/events/[id]`
- **Dependències**: `auth-login` (PE-48/US-00-03) i `user-registration` (US-00-02) han d'estar operatius
- **Testing**: tests unitaris amb `@nuxt/test-utils` i Vitest per a la store i els middlewares

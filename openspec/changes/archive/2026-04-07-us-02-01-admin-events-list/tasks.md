## 1. Backend — Middleware EnsureAdmin

- [x] 1.1 Crear `app/Http/Middleware/EnsureAdmin.php` que comprovi `$request->user()->role === 'admin'` i retorni 403 JSON si no
- [x] 1.2 Registrar el middleware com a `admin` a `bootstrap/app.php` (Laravel 11)
- [x] 1.3 Escriure test de feature `tests/Feature/Middleware/EnsureAdminTest.php` (cas admin OK, cas comprador 403, cas sense token 401)

## 2. Backend — Ruta i controlador AdminEventController

- [x] 2.1 Crear `app/Http/Controllers/Admin/AdminEventController.php` amb mètode `index()` que retorni tots els events amb camps: `id`, `nom`, `data`, `hora`, `recinte`, `publicat`, i comptadors de seients per estat
- [x] 2.2 Afegir ruta `GET /api/admin/events` al grup de rutes `/api/admin` protegit per `auth:sanctum` + `admin` a `routes/api.php`
- [x] 2.3 Escriure test de feature `tests/Feature/Admin/AdminEventControllerTest.php` (retorna tots els events incloent esborranys amb rol admin, 401 sense token, 403 amb rol comprador)

## 3. Backend — Verificació

- [x] 3.1 Executar `./vendor/bin/pint` per verificar format del codi PHP
- [x] 3.2 Executar `php artisan test` per confirmar que tots els tests passen

## 4. Frontend — Pàgina /admin/events

- [x] 4.1 Crear `pages/admin/events.vue` amb `definePageMeta({ ssr: false, middleware: 'admin' })`
- [x] 4.2 Implementar `useFetch('/api/admin/events', { headers: { Authorization: Bearer ${token} } })` per obtenir la llista d'events
- [x] 4.3 Renderitzar taula amb columnes: Nom, Data, Hora, Recinte, Estat (badge), Seients (disponibles/reservats/venuts), Accions (Editar, Eliminar, Publicar/Despublicar)
- [x] 4.4 Implementar badge visual: verd per a "Publicat", gris/groc per a "Esborrany"
- [x] 4.5 Escriure test de component `pages/admin/events.spec.ts` (taula renderitzada amb 3 events, badge Esborrany per `publicat: false`, badge Publicat per `publicat: true`)

## 5. Frontend — Verificació

- [x] 5.1 Executar `pnpm type-check` al workspace `frontend` per confirmar compilació TypeScript sense errors
- [x] 5.2 Executar `pnpm lint` al workspace `frontend` per confirmar linting sense errors
- [x] 5.3 Executar `pnpm test` al workspace `frontend` per confirmar que tots els tests passen

## 6. Verificació global

- [x] 6.1 Provar manualment el flux complet: login com a admin → navegar a `/admin/events` → verificar que apareixen publicats i esborranys
- [x] 6.2 Provar manualment l'accés no autoritzat: login com a `comprador` → intentar navegar a `/admin/events` → verificar redirecció a `/`
- [x] 6.3 Executar `pnpm test` a tots els workspaces per confirmar que el CI gate passa

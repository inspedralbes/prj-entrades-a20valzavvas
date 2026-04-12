## Why

La portada `/` de l'aplicació redirigeix immediatament tots els usuaris no autenticats a `/auth/login`, trencant el rol "Visitant" del PRD i fent l'aplicació inaccessible sense compte. Cal una portada pública SSR real que llisti els esdeveniments publicats, permetent que qualsevol persona descobreixi la programació de Sala Onirica sense registrar-se.

## What Changes

- `pages/index.vue` — substituir la lògica de redirecció per una pàgina SSR pública que fet `useFetch('/api/events')` i renderitza la llista d'EventCards
- Nou component `components/EventCard.vue` — targeta per a cada event amb tema fosc cinema; inclou badge de disponibilitat i link a `/events/{slug}`
- `GET /api/events` (Laravel `EventController::index()`) — ampliar la resposta per incloure `description`, `image_url` i `available_seats` (recompte de seients `DISPONIBLE`)
- `pages/auth/login.vue` — fix de `homeForRole()`: comprador redirigit a `/` en comptes de `/entrades`
- Test Laravel per a `GET /api/events` (verificar que retorna els camps nous i exclou events no publicats)

## Capabilities

### New Capabilities

- `public-events-listing`: Portada pública SSR que llista els esdeveniments publicats. Inclou el component `EventCard.vue`, la lògica SSR d'`index.vue` i l'extensió de la resposta de `GET /api/events` per retornar `description`, `image_url` i `available_seats`.

### Modified Capabilities

<!-- Cap especificació existent canvia els seus requisits. La ruta `/` no estava coberta per cap spec. -->

## Impact

- **Laravel** (`EventController`): afegir camps `description`, `image_url`, `available_seats` a la resposta; afegir test de feature
- **Frontend** (`pages/index.vue`, `components/EventCard.vue`): pàgina nova SSR + component nou
- **Frontend** (`pages/auth/login.vue`): canvi de ruta post-login per a compradors
- **Tests**: nou test de feature Laravel per a l'endpoint públic; tests unitaris per a `EventCard.vue`
- No hi ha canvis a l'esquema de BD ni a Socket.IO
- Jira: [PE-59](https://lightweight-fitness.atlassian.net/browse/PE-59)

## Non-goals

- Navbar / layout global (PE-61 / US-10-03)
- Filtres, cerca i paginació d'events (EP-09)
- Gestió d'imatges dels events (l'EventCard mostra placeholder si no hi ha `image_url`)

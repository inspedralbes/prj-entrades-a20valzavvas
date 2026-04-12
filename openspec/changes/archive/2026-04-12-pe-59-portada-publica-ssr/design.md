## Context

La portada actual (`pages/index.vue`) té `ssr: false` i redirigeix tots els usuaris via `onMounted`, el que suposa que cap visitant no autenticat pot veure la programació. El PRD defineix `/` com una ruta SSR pública.

L'endpoint `GET /api/events` ja existeix a Laravel i retorna events publicats, però no inclou els camps `description`, `image_url` ni `available_seats`. El model `Event` té `description` i `image_url` a la BD. El recompte de seients disponibles requereix un `withCount` o `loadCount` sobre la relació `seats()` filtrada per `status = 'DISPONIBLE'`.

## Goals / Non-Goals

**Goals:**

- Activar SSR a la portada sense trencar cap ruta protegida existent
- Ampliar `GET /api/events` amb els camps que necessita el component `EventCard.vue`
- Crear `EventCard.vue` com a component autocontingut, independent de Pinia
- Corregir la redirecció post-login per a compradors

**Non-Goals:**

- Navbar / layout global
- Paginació, filtres o cerca
- Gestió d'imatges (upload o CDN)

## Decisions

### 1. SSR a `index.vue` sense middleware

`pages/index.vue` s'elimina `definePageMeta({ ssr: false })` i es fa `useFetch('/api/events')` al setup (SSR-safe). No cal middleware `auth` perquè la portada és pública. La lògica de redirecció per rol **es mou** a la pàgina de login (`homeForRole()`), que ja existia parcialment.

**Alternativa descartada:** mantenir `ssr: false` i fer la petició al client — perd el benefici SEO i la renderització inicial.

### 2. `GET /api/events` — ampliar resposta sense canviar la ruta

S'afegeix `available_seats` via `withCount` de Eloquent filtrant les relacions per `status = 'DISPONIBLE'`. No es crea un endpoint nou; `EventController::index()` ja és l'endpoint públic correcte.

**Alternativa descartada:** crear `GET /api/public/events` — duplicitat innecessària quan l'existent ja és públic.

### 3. Badge de disponibilitat a `EventCard.vue`

El color del badge es calcula al component amb una `computed` local:

- Verde (`#16A34A`): `available_seats / total_seats > 0.20`
- Groc (`#D97706`): `0 < available_seats / total_seats ≤ 0.20`
- Vermell (`#DC2626`): `available_seats === 0`

Quan l'API no retorna `total_seats` (el ticket 59 no el requereix explícitament), s'usa un llindar fix: verd si > 20, groc si ≤ 20 i > 0, vermell si = 0.

### 4. Tema fosc cinema

Colors del disseny:

- Background pàgina: `#0d1117`
- Background targeta: `#1a2235`
- Text principal: `#f1f5f9`
- Accent / CTA: `#7c3aed` (violeta)
- Hover targeta: `border-color: #7c3aed`

## Risks / Trade-offs

- **[Risc] `available_seats` és un snapshot en el moment de la petició SSR** — no s'actualitza en temps real a la portada. Mitigació: és un llistat de portada, no el mapa de seients; la frescor de les dades és acceptable.
- **[Risc] Si `EventController` és usat per un altre test existent, afegir camps pot trencar assertions** — Mitigació: revisar tests de feature de Laravel abans d'implementar.

## Migration Plan

1. Desplegar Laravel amb el `EventController` ampliat (backward-compatible — s'afegeixen camps, no es treuen)
2. Desplegar Frontend amb el nou `index.vue` i `EventCard.vue`
3. El `homeForRole()` fix és transparent per a l'usuari admin (comportament igual)
4. Rollback: revertir `pages/index.vue` al commit anterior si hi ha problemes SSR

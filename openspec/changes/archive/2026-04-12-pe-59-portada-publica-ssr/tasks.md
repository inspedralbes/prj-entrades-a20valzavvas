## 1. Backend Laravel — Ampliar GET /api/events

- [x] 1.1 Afegir `available_seats` a `EventController::index()` via `withCount` filtrant `status = 'DISPONIBLE'`
- [x] 1.2 Afegir els camps `description` i `image_url` a la resposta de `EventController::index()`
- [x] 1.3 Crear test de feature Laravel `GetPublicEventsTest` que cobreixi: retorna 200 sense auth, exclou events no publicats, inclou els camps nous i el recompte de seients disponibles

## 2. Frontend — Fix post-login redirect

- [x] 2.1 Corregir `homeForRole()` a `pages/auth/login.vue`: canviar la ruta del comprador de `/entrades` a `/`

## 3. Frontend — Component EventCard.vue

- [x] 3.1 Crear `components/EventCard.vue` amb props `{ id, slug, name, date, venue, description?, available_seats }`
- [x] 3.2 Implementar badge de disponibilitat amb lògica de color: verd (> 20), groc (1-20), vermell (0 / "Esgotat")
- [x] 3.3 Aplicar tema fosc cinema: background `#1a2235`, text `#f1f5f9`, accent `#7c3aed`, hover `border-color: #7c3aed`
- [x] 3.4 Afegir `<NuxtLink :to="'/events/' + slug">` com a element clickable principal
- [x] 3.5 Mostrar la data formatada (ex. "Dissabte 15 de juny, 20:00h") usant `Intl.DateTimeFormat`
- [x] 3.6 Escriure test unitari `EventCard.spec.ts` amb Vitest i `@nuxt/test-utils`: munta el component amb props mock i verifica renderització del nom i del link

## 4. Frontend — Refactoritzar pages/index.vue com a portada SSR

- [x] 4.1 Eliminar `definePageMeta({ ssr: false })` i tota la lògica `onMounted` de redirecció
- [x] 4.2 Afegir `useFetch('/api/events')` al setup per obtenir la llista d'events
- [x] 4.3 Renderitzar un `EventCard` per cada event retornat per l'API
- [x] 4.4 Afegir estat de càrrega (skeleton) mentre `pending === true`
- [x] 4.5 Afegir estat buit: mostrar "No hi ha projeccions programades" si `data.value` és array buit
- [x] 4.6 Afegir gestió d'error de xarxa amb missatge genèric

## 5. Verificació i CI

- [x] 5.1 Executar `pnpm test` al workspace `frontend` — tots els tests passen (incloent `EventCard.spec.ts`)
- [x] 5.2 Executar tests de feature Laravel (`php artisan test`) — `GetPublicEventsTest` passa
- [x] 5.3 Executar `pnpm type-check` al workspace `frontend` — 0 errors TypeScript
- [x] 5.4 Executar `pnpm lint` al workspace `frontend` — 0 errors ESLint
- [x] 5.5 Verificar manualment al navegador: `/` mostra la llista d'events sense autenticació (SSR verificable amb `curl http://localhost/`)

## 1. Laravel — Endpoint GET /api/events/{slug}/seats

- [x] 1.1 Crear `EventSeatsController` a `app/Http/Controllers/Api/` amb el mètode `show(string $slug)`
- [x] 1.2 Afegir la ruta `GET /api/events/{slug}/seats` a `routes/api.php` sense middleware d'autenticació
- [x] 1.3 Implementar la consulta Eloquent: obtenir l'event per `slug` + `estat = publicat`; si no existeix, retornar `404`
- [x] 1.4 Carregar els seients de l'event (`event->seats()->with('priceCategory')->orderBy('fila')->orderBy('numero')->get()`)
- [x] 1.5 Agrupar els seients per `fila` al controlador i construir la resposta `{ event, categories, files }`
- [x] 1.6 Test `EventSeatsControllerTest` — escenari: event publicat retorna 200 amb estructura correcta
- [x] 1.7 Test `EventSeatsControllerTest` — escenari: slug inexistent retorna 404
- [x] 1.8 Test `EventSeatsControllerTest` — escenari: event en esborrany retorna 404
- [x] 1.9 Verificar que `php artisan route:list` mostra la nova ruta

## 2. Frontend — Store Pinia seients.ts

- [x] 2.1 Crear `stores/seients.ts`: estat `llistat: Map<string, SeatState>`, `isLoading: boolean`, `error: string | null`
- [x] 2.2 Definir el tipus `SeatState` local (`{ estat: EstatSeient, fila: string, numero: number, categoria: string, preu: number }`) important `EstatSeient` de `@shared/seat.types`
- [x] 2.3 Implementar l'acció `inicialitzar(slug: string)`: crida `$fetch('/api/events/{slug}/seats')`, popula el `Map` i gestiona `isLoading` i `error`
- [x] 2.4 Implementar el getter `seientsPer Fila`: retorna `Map<string, SeatState[]>` agrupat per `fila` per facilitar la renderització per files
- [x] 2.5 Test `stores/seients.spec.ts` — `inicialitzar` popula Map correctament amb mock de `$fetch`
- [x] 2.6 Test `stores/seients.spec.ts` — `isLoading` és `true` durant la petició i `false` en finalitzar
- [x] 2.7 Test `stores/seients.spec.ts` — `error` s'estableix quan `$fetch` llança error 404

## 3. Frontend — Components Vue

- [x] 3.1 Crear `components/Seient.vue`: prop `seat: SeatState & { id: string }`, prop `miSeat?: boolean`; renderitza un botó amb classe dinàmica basada en `estat`
- [x] 3.2 Definir les classes CSS a `Seient.vue`: `.seient--disponible` (`#16A34A`), `.seient--reservat` (`#D97706`), `.seient--seleccionat-per-mi` (`#7C3AED`), `.seient--venut` (`#374151`)
- [x] 3.3 Crear `components/MapaSeients.vue`: llegir `seientsPer Fila` de la store; renderitzar `<div v-for="fila">` + `<Seient v-for="seat">` amb `overflow-x: auto` per responsivitat
- [x] 3.4 Crear `components/LlegendaEstats.vue`: llista estàtica amb els 4 estats i els seus colors
- [x] 3.5 Crear `components/NotificacioEstat.vue`: prop `missatge: string`, `tipus: 'info' | 'error'`; missatge no bloquejant (no modal)
- [x] 3.6 Test `components/Seient.spec.ts` — cada valor d'estat produeix la classe CSS correcta
- [x] 3.7 Test `components/MapaSeients.spec.ts` — renderitza el nombre correcte de `.seient` amb mock de store
- [x] 3.8 Test `components/LlegendaEstats.spec.ts` — conté exactament 4 ítems

## 4. Frontend — Pàgina /events/[slug]

- [x] 4.1 Crear `pages/events/[slug].vue` amb `definePageMeta({ ssr: false })`
- [x] 4.2 Al `onMounted`, cridar `seients.inicialitzar(route.params.slug as string)`
- [x] 4.3 Mostrar info de l'event (nom, data, recinte) sobre el mapa
- [x] 4.4 Mostrar `MapaSeients.vue` quan `!seients.isLoading && !seients.error`
- [x] 4.5 Mostrar skeleton/spinner quan `seients.isLoading === true`
- [x] 4.6 Mostrar `NotificacioEstat.vue` amb missatge d'error i botó "Tornar a la portada" quan `seients.error !== null`
- [x] 4.7 Incloure `LlegendaEstats.vue` sempre visible (per sobre o per sota del mapa)

## 5. Verificació final

- [x] 5.1 `pnpm lint` a `src/frontend/` — sense errors
- [x] 5.2 `pnpm type-check` a `src/frontend/` — sense errors TypeScript
- [x] 5.3 `pnpm test` a `src/frontend/` — tots els tests passant (61/61)
- [x] 5.4 `./vendor/bin/pint` a `src/backend/laravel-service/` — sense errors PHP
- [x] 5.5 `php artisan test --filter EventSeatsControllerTest` — tots els tests passant (6/6)
- [x] 5.6 Prova manual: `docker compose up` → navegar a un event publicat → verificar que el mapa mostra tots els seients amb els colors correctes

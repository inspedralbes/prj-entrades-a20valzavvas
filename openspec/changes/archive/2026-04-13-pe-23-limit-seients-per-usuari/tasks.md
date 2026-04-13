## 1. Base de dades — Laravel (migració)

- [x] 1.1 Crear migració Laravel `add_max_seients_per_usuari_to_events_table` amb `$table->unsignedInteger('max_seients_per_usuari')->default(4)`
- [x] 1.2 Afegir `max_seients_per_usuari` a `$fillable` i `$casts` del model `Event`
- [x] 1.3 Executar `php artisan migrate` i verificar que la migració s'aplica correctament en local

## 2. Shared types

- [x] 2.1 Afegir `maxSeientPerUsuari: number` al tipus `IEvent` a `shared/types/event.types.ts`
- [x] 2.2 Afegir `ReservaRebutjadaMotiu` union type amb `"limit_assolit"` a `shared/types/socket.types.ts`

## 3. Backend — Laravel SeatReservationController

- [x] 3.1 Dins `DB::transaction`, carregar `$seat->event` per obtenir `max_seients_per_usuari`
- [x] 3.2 Comptar reserves actives del `user_id` per a l'`event_id` dins la transacció
- [x] 3.3 Retornar HTTP 422 `{ motiu: 'limit_assolit' }` si el comptador és igual o superior al límit
- [x] 3.4 Afegir `max_seients_per_usuari` a la resposta de `EventSeatsController` (endpoint `/api/events/{slug}/seats`)

## 4. Backend — Laravel Admin

- [x] 4.1 Afegir `max_seients_per_usuari` a `StoreEventRequest::rules()`
- [x] 4.2 Afegir `max_seients_per_usuari` a `UpdateEventRequest::rules()`
- [x] 4.3 Incloure `max_seients_per_usuari` en la creació de l'event a `AdminEventService::store()`
- [x] 4.4 Incloure `max_seients_per_usuari` en l'actualització de l'event a `AdminEventService::update()` (`$fillable` array)
- [x] 4.5 Incloure `max_seients_per_usuari` a les respostes `formatEvent()` i `store()` de `AdminEventController`

## 5. Backend — Node LaravelClientService

- [x] 5.1 Mapear HTTP 422 (raw AxiosError) → `{ ok: false, motiu: 'limit_assolit' }`
- [x] 5.2 Mapear `UnprocessableEntityException` (interceptor path) → `{ ok: false, motiu: 'limit_assolit' }`
- [x] 5.3 Test: "retorna ok:false motiu:limit_assolit quan Laravel respon 422 (raw AxiosError)"
- [x] 5.4 Test: "retorna ok:false motiu:limit_assolit quan el interceptor llança UnprocessableEntityException"

## 6. Frontend — Store reserva.ts

- [x] 6.1 Afegir `seatIds: string[]` i `maxSeientPerUsuari: number` a l'estat del store
- [x] 6.2 Afegir getter `limitAssolit: boolean` (compara `seatIds.length >= maxSeientPerUsuari`)
- [x] 6.3 Modificar `confirmarReserva` per acumular `seatId` a `seatIds`
- [x] 6.4 Afegir acció `setMaxSeientPerUsuari(max: number)` al store
- [x] 6.5 Afegir acció `alliberarSeient(seatId: string)` al store
- [x] 6.6 Cridar `setMaxSeientPerUsuari` des de `seients.ts` quan s'inicialitza l'event
- [x] 6.7 Actualitzar `SeientApiResponse.event` a `seients.ts` per incloure `max_seients_per_usuari`
- [x] 6.8 Tests: limitAssolit true/false, acumulació de seatIds, reactivitat, netejarReserva

## 7. Frontend — Admin (formularis d'event)

- [x] 7.1 Afegir input numèric `max_seients_per_usuari` al formulari de creació (`/admin/events/new`)
- [x] 7.2 Afegir input numèric `max_seients_per_usuari` al formulari d'edició (`/admin/events/[id]`)
- [x] 7.3 Inicialitzar el camp amb el valor de l'API en carregar l'event per editar

## 8. Verificació CI

- [x] 8.1 `pnpm lint` — sense errors
- [x] 8.2 `pnpm type-check` — sense errors
- [x] 8.3 `pnpm test` — tots els tests passen (backend + frontend + shared)
- [x] 8.4 `pnpm build` — build de producció correcte (pendent de verificar en CI)

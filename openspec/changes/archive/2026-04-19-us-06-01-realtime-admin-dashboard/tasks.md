## 1. Shared Types

- [x] 1.1 Afegir `StatsActualitzacioPayload` a `shared/types/socket.types.ts` amb camps: `disponibles`, `reservats`, `venuts`, `totalSeients`, `percentatgeVenuts`, `percentatgeReservats`, `usuarisConnectats`, `reservesActives`, `recaptacioTotal`
- [x] 1.2 Escriure test unitari a `shared/types/socket.types.spec.ts` que verifiqui l'existència dels camps obligatoris del tipus

## 2. Backend — AdminService i AdminController

- [x] 2.1 Implementar `AdminService.getEventStats(eventId: string): Promise<StatsActualitzacioPayload>` amb queries Prisma: `seat.groupBy` per estat, `reservation.count` per reserves actives, `orderItem.aggregate` per recaptació total
- [x] 2.2 Afegir endpoint `GET /api/admin/events/:id/stats` a `AdminController` protegit per `X-Admin-Token` middleware
- [x] 2.3 Injectar `AdminModule` / `AdminService` al `SeatsModule` (o usar forwardRef si cal) per a que `SeatsGateway` pugui cridar `getEventStats`
- [x] 2.4 Escriure test unitari `admin.service.spec.ts`: verificar que `getEventStats` retorna el payload correcte amb `PrismaService` mockejat
- [x] 2.5 Escriure test unitari `admin.controller.spec.ts`: verificar que l'endpoint respon 200 amb token vàlid, 403 sense token, i 404 per event inexistent

## 3. Backend — SeatsGateway (emit stats:actualitzacio)

- [x] 3.1 Injectar `AdminService` a `SeatsGateway` via constructor
- [x] 3.2 Implementar `emitStatsActualitzacio(eventId: string, payload: StatsActualitzacioPayload): void` a `SeatsGateway` que emeti `stats:actualitzacio` al room `event:{eventId}`
- [x] 3.3 Cridar `adminService.getEventStats(eventId)` i `emitStatsActualitzacio` just després de cada `emitCanviEstat` (handlers de reserva, alliberament, compra confirmada i expiració)
- [x] 3.4 Ampliar el test existent de `SeatsGateway` per verificar que `emitStatsActualitzacio` és cridat amb el payload correcte després de cada canvi d'estat

## 4. Frontend — Composable useAdminStats

- [x] 4.1 Crear `frontend/composables/useAdminStats.ts` que: faci `GET /api/admin/events/:id/stats` en `onMounted`, es subscrigui a `stats:actualitzacio` via `$socket`, i exposi refs reactius per a cada camp del payload
- [x] 4.2 Implementar la desconnexió del listener `stats:actualitzacio` en `onUnmounted`
- [x] 4.3 Escriure test unitari `useAdminStats.spec.ts` amb fetch i socket mockejats: verificar que els refs s'actualitzen en rebre `stats:actualitzacio`

## 5. Frontend — Pàgina /admin Dashboard

- [x] 5.1 Implementar `pages/admin/index.vue` (CSR, `definePageMeta({ ssr: false })`) amb `useAdminStats(eventId)` i visualització dels comptadors
- [x] 5.2 Mostrar: seients disponibles / reservats / venuts (xifres i %), usuaris connectats, reserves actives, recaptació total
- [x] 5.3 Afegir selector d'event (o passar `eventId` per query param) per triar quin event monitorar
- [x] 5.4 Gestionar estat de càrrega inicial i error de connexió

## 6. Verificació CI

- [x] 6.1 Executar `pnpm type-check` i corregir tots els errors TypeScript
- [x] 6.2 Executar `pnpm lint` i corregir tots els errors de linting
- [x] 6.3 Executar `pnpm test` i verificar que tots els tests passen (backend + frontend + shared)
- [x] 6.4 Verificar manualment el criteri d'acceptació PE-31: admin a `/admin`, usuari compra 2 entrades en un altre navegador → comptadors actualitzats sense recarregar

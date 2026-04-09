## Why

El mapa de seients de PE-19 mostra l'estat inicial en carregar la pàgina, però no s'actualitza quan altres usuaris reserven o alliberen seients. Sense sincronització en temps real via Socket.IO, dos usuaris podrien veure el mateix seient com a disponible simultàniament i intentar reservar-lo sense feedback visual immediat. Jira: [PE-20 — US-03-02](https://lightweight-fitness.atlassian.net/browse/PE-20)

## What Changes

- La pàgina `/events/[slug]` se subscriu al room Socket.IO `event:{eventId}` en muntar-se i es desconn­ecta en desmuntar-se
- La store `seients.ts` afegeix les accions `connectar(slug)`, `desconnectar()` i `actualitzarEstat(seatId, estat)` per processar els events `seient:canvi-estat` rebuts via WS
- Nova store Pinia `connexio.ts` que exposa `estat` (`connectat` | `desconnectat` | `reconnectant`) i escolta els events de connexió/desconnexió del plugin `socket.client.ts`
- El `SeatsGateway` (NestJS) gestiona l'event `event:unir` i subscriu el client al room `event:{eventId}`; exposa el mètode `emitCanviEstat(eventId, payload)` perquè altres serveis (reserva, cron) puguin desencadenar el broadcast `seient:canvi-estat` a tot el room
- El plugin `plugins/socket.client.ts` (ja existent) proporciona la instància Socket.IO accessible des de la store via `useNuxtApp()`

## Capabilities

### New Capabilities

- `realtime-seat-sync`: Gestió del room Socket.IO al gateway (handler `event:unir`, mètode `emitCanviEstat`), store `connexio.ts` i integració de la subscripció a la pàgina d'event

### Modified Capabilities

- `seat-map-view`: La store `seients.ts` afegeix `connectar(slug)`, `desconnectar()` i `actualitzarEstat(seatId, estat)`; la pàgina `/events/[slug]` crida `connectar` en `onMounted` i `desconnectar` en `onUnmounted`

## Impact

- **Frontend (`src/frontend/`)**: modificació de `stores/seients.ts` (noves accions), modificació de `pages/events/[slug].vue` (lifecycle hooks), nova store `stores/connexio.ts`
- **Node Service (`src/backend/node-service/`)**: `SeatsGateway` afegeix handler `@SubscribeMessage('event:unir')` i mètode públic `emitCanviEstat(eventId, payload)`; `SeatsModule` exporta `SeatsGateway` per a ús des d'altres mòduls (ReservationsModule, futurs EP-04)
- **Shared (`src/shared/`)**: es reutilitza `SeientCanviEstatPayload` de `socket.types.ts`; no calen nous tipus
- **No-goals**: reserva de seients (US-04-01), indicador visual de connexió al DOM (US-03-03), reconnexió amb recuperació d'estat (US-09-04), `stats:actualitzacio` broadcast (EP-06)

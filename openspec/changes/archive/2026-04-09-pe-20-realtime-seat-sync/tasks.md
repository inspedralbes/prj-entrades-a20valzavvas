## 1. Node Service — SeatsGateway

- [x] 1.1 Instal·lar `@nestjs/websockets` i `@nestjs/platform-socket.io` al `node-service` si no estan ja disponibles (`pnpm add @nestjs/websockets @nestjs/platform-socket.io socket.io`)
- [x] 1.2 Crear `src/gateway/seats.gateway.ts` amb `@WebSocketGateway({ cors: { ... }, namespace: '/' })`, `@WebSocketServer() server: Server` i decorator `@UseGuards(JwtWsGuard)`
- [x] 1.3 Implementar el handler `@SubscribeMessage('event:unir') handleUnirEvent(socket, payload: { eventId: string })` que executa `socket.join(\`event:${payload.eventId}\`)`
- [x] 1.4 Implementar el mètode públic `emitCanviEstat(eventId: string, payload: SeientCanviEstatPayload): void` que crida `this.server.to(\`event:${eventId}\`).emit('seient:canvi-estat', payload)`
- [x] 1.5 Registrar `SeatsGateway` a `GatewayModule` (providers i exports) i importar `AuthModule` per a la disponibilitat del `JwtWsGuard`
- [x] 1.6 Importar `GatewayModule` a `AppModule`
- [x] 1.7 Escriure el test unitari `src/gateway/seats.gateway.spec.ts` que verifica: (a) `handleUnirEvent` crida `socket.join` amb el room correcte i (b) `emitCanviEstat` crida `server.to(...).emit(...)` amb el payload correcte — `JwtWsGuard` mockejat

## 2. Frontend — Plugin socket.client.ts

- [x] 2.1 Instal·lar `socket.io-client` al `frontend` si no existeix (`pnpm add socket.io-client`)
- [x] 2.2 Crear `plugins/socket.client.ts` que inicialitza `io(config.public.wsUrl, { autoConnect: false, auth: (cb) => cb({ token: useAuthStore().token }) })`
- [x] 2.3 Afegir `provide('socket', socket)` al plugin per exposar la instància via `useNuxtApp().$socket`
- [x] 2.4 Afegir `public.wsUrl` a `runtimeConfig` de `nuxt.config.ts` (valor per defecte: `'http://localhost/ws'`) i documentar-lo a `.env.example`

## 3. Frontend — Store connexio.ts

- [x] 3.1 Crear `stores/connexio.ts` amb la store Pinia `useConnexioStore`, estat inicial `{ estat: 'desconnectat' as 'connectat' | 'desconnectat' | 'reconnectant' }` i acció `inicialitzar()` que subscriu als events `connect`, `disconnect` i `reconnect_attempt` del `$socket`
- [x] 3.2 Escriure el test unitari `stores/connexio.spec.ts` que verifica els canvis d'estat per als tres events del socket, usant un `EventEmitter` mock com a `$socket`

## 4. Frontend — Extensió de seients.ts

- [x] 4.1 Afegir l'acció `connectar(slug: string)` a la store `seients.ts`: obté `eventId` de `this.event!.id`, crida `$socket.connect()`, subscriu el listener `seient:canvi-estat` que crida `this.actualitzarEstat(seatId, estat)`, i emet `event:unir`
- [x] 4.2 Afegir l'acció `desconnectar()`: crida `$socket.off('seient:canvi-estat')` i `$socket.disconnect()`
- [x] 4.3 Afegir l'acció `actualitzarEstat(seatId: string, estat: EstatSeient): void` que actualitza `this.llistat` si `seatId` existeix al Map
- [x] 4.4 Actualitzar el test `stores/seients.spec.ts` per cobrir: (a) `actualitzarEstat` modifica l'estat al Map sense afectar altres camps, (b) `connectar` invoca `$socket.connect()` i `$socket.emit('event:unir', ...)`, (c) `desconnectar` invoca `$socket.off` i `$socket.disconnect` — tot amb `useNuxtApp` mockejat

## 5. Frontend — Pàgina /events/[slug]

- [x] 5.1 Afegir `onMounted(() => seients.connectar(slug))` a la pàgina `pages/events/[slug].vue` (executat únicament si `seients.event` existeix, és a dir, `inicialitzar` ha completat)
- [x] 5.2 Afegir `onUnmounted(() => seients.desconnectar())` a la pàgina `pages/events/[slug].vue`
- [x] 5.3 Actualitzar el test `pages/events-slug.spec.ts` per verificar que en muntar la pàgina `seients.connectar` és invocat una vegada i en desmuntar-la `seients.desconnectar` és invocat una vegada — stores mockejades

## 6. Verificació final

- [x] 6.1 Executar `pnpm -F @entrades/node-service test` — tots els tests del Node Service han de passar
- [x] 6.2 Executar `pnpm -F @entrades/frontend test` — tots els tests del frontend han de passar
- [x] 6.3 Executar `pnpm -r type-check` — TypeScript sense errors en tots els workspaces
- [x] 6.4 Executar `pnpm -r lint` — ESLint sense errors en tots els workspaces
- [x] 6.5 Verificació manual: obrir dos navegadors a `/events/[slug]` i comprovar que en reservar un seient (etapa futura, PE-21) els canvis es reflecteixen en temps real a l'altre browser (smoke test mínims amb el gateway connectat)

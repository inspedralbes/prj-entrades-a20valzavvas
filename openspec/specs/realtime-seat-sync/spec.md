## Purpose

Sincronització en temps real de l'estat dels seients mitjançant WebSockets (Socket.IO). El sistema notifica tots els clients connectats a un event quan l'estat d'un seient canvia, garantint consistència visual sense recarregar la pàgina.

## Requirements

### Requirement: SeatsGateway gestiona l'event event:unir i afegeix el client al room de l'event

El `SeatsGateway` (NestJS) SHALL registrar un handler `@SubscribeMessage('event:unir')` que accepti el payload `{ eventId: string }`, protegit pel `JwtWsGuard`, i executi `socket.join(`event:${eventId}`)`. El `socket.data.userId` (injectat pel guard) MUST ser available dins del handler.

#### Scenario: Client autenticat s'uneix al room correctament

- **GIVEN** un client amb JWT vàlid connectat al gateway
- **WHEN** emet l'event `event:unir` amb payload `{ eventId: "uuid-de-levent" }`
- **THEN** el servidor executa `socket.join('event:uuid-de-levent')`
- **AND** el client és membre del room `event:uuid-de-levent`

#### Scenario: Client no autenticat és rebutjat al handshake

- **GIVEN** un client sense JWT intenta connectar-se
- **WHEN** es produeix el handshake Socket.IO
- **THEN** el `JwtWsGuard` llança `WsException('Unauthorized')` i la connexió es rebutja
- **AND** no s'arriba mai al handler `event:unir`

#### Scenario: Múltiples clients s'uneixen al mateix room

- **GIVEN** dos clients autenticats diferent (`userId-1` i `userId-2`) connectats al gateway
- **WHEN** tots dos emeten `event:unir` amb el mateix `eventId`
- **THEN** tots dos pertanyen al room `event:{eventId}` i rebran futurs broadcasts del room

#### Scenario: Testabilitat — handler injectable en test unitari

- **WHEN** s'instancia `SeatsGateway` en un test amb `JwtWsGuard` mockejat
- **THEN** es pot cridar el handler `handleUnirEvent` directament amb un socket mock i verificar que `socket.join` ha estat invocat amb el room correcte

---

### Requirement: SeatsGateway exposa emitCanviEstat per broadcast a tot el room

El `SeatsGateway` SHALL exposar el mètode públic `emitCanviEstat(eventId: string, payload: SeientCanviEstatPayload): void` que emeti l'event `seient:canvi-estat` a tots els clients del room `event:{eventId}` via `this.server.to(`event:${eventId}`).emit(...)`. Altres mòduls (ReservationsModule futur) podran injectar `SeatsGateway` i cridar aquest mètode.

#### Scenario: Broadcast arriba a tots els clients del room

- **GIVEN** tres clients en el room `event:evt-123`
- **WHEN** s'invoca `seatsGateway.emitCanviEstat('evt-123', { seatId: 's-1', estat: 'RESERVAT', fila: 'A', numero: 5 })`
- **THEN** els tres clients reben l'event `seient:canvi-estat` amb el payload especificat

#### Scenario: Broadcast no arriba a clients d'altres rooms

- **GIVEN** un client en el room `event:evt-abc` i un altre en `event:evt-xyz`
- **WHEN** s'invoca `emitCanviEstat('evt-abc', payload)`
- **THEN** únicament el client de `event:evt-abc` rep l'event; el de `event:evt-xyz` no el rep

#### Scenario: Payload tipat amb SeientCanviEstatPayload

- **WHEN** s'invoca `emitCanviEstat` amb un payload que manca el camp `seatId`
- **THEN** TypeScript genera un error de compilació (tipat en temps de compilació, no en runtime)

#### Scenario: Testabilitat — emitCanviEstat pot ser verificat en test unitari

- **WHEN** `SeatsGateway` és instanciat en un test amb `this.server` mockejat
- **THEN** es pot cridar `emitCanviEstat` i verificar que `server.to(...).emit(...)` ha estat invocat amb els arguments correctes

---

### Requirement: Plugin socket.client.ts inicialitza la connexió Socket.IO amb JWT

El plugin `plugins/socket.client.ts` SHALL crear la instància Socket.IO amb `io(WS_URL, { autoConnect: false, auth: { token } })` on `WS_URL` prové de la variable de configuració de Nuxt (`runtimeConfig.public.wsUrl`) i `token` es llegeix de `useAuthStore().token` en el moment de la connexió. La instància MUST ser accessible des de qualsevol store via `useNuxtApp().$socket`.

#### Scenario: Plugin proporciona $socket a useNuxtApp()

- **GIVEN** que el plugin ha estat carregat pel runtime de Nuxt
- **WHEN** una store crida `useNuxtApp().$socket`
- **THEN** rep la instància Socket.IO creada pel plugin (no `undefined`)

#### Scenario: La URL del WebSocket prové de runtimeConfig, no hardcoded

- **GIVEN** `runtimeConfig.public.wsUrl` val `'http://localhost/ws'`
- **WHEN** el plugin inicialitza el socket
- **THEN** la instància apunta a `'http://localhost/ws'` sense cap URL hardcoded al fitxer del plugin

#### Scenario: Token JWT s'inclou al handshake

- **GIVEN** l'usuari autenticat té un token JWT a `useAuthStore().token`
- **WHEN** la store crida `$socket.connect()`
- **THEN** el handshake Socket.IO inclou `auth.token` amb el valor del JWT

#### Scenario: Testabilitat — el plugin pot ser mockejat en tests de stores

- **WHEN** s'executa el test de `seients.spec.ts` amb `useNuxtApp` mockejat
- **THEN** el `$socket` mock es pot configurar per simular events rebuts sense connexió real al servidor

---

### Requirement: Store connexio.ts exposa l'estat de la connexió WebSocket

La store `connexio.ts` SHALL mantenir la propietat reactiva `estat` (`'connectat' | 'desconnectat' | 'reconnectant'`) i actualitzar-la escoltant els events `connect`, `disconnect` i `reconnect_attempt` de la instància `$socket`. L'estat inicial SHALL ser `'desconnectat'`.

#### Scenario: Estat canvia a 'connectat' en connectar-se

- **GIVEN** la store `connexio` amb `estat = 'desconnectat'`
- **WHEN** la instància Socket.IO emet l'event `connect`
- **THEN** `connexio.estat` canvia a `'connectat'`

#### Scenario: Estat canvia a 'desconnectat' en perdre la connexió

- **GIVEN** la store `connexio` amb `estat = 'connectat'`
- **WHEN** la instància Socket.IO emet l'event `disconnect`
- **THEN** `connexio.estat` canvia a `'desconnectat'`

#### Scenario: Estat canvia a 'reconnectant' durante el reintent de connexió

- **GIVEN** la connexió ha caigut i Socket.IO intenta reconnectar automàticament
- **WHEN** s'emet l'event `reconnect_attempt`
- **THEN** `connexio.estat` canvia a `'reconnectant'`

#### Scenario: Testabilitat — la store pot ser testada en aïllament

- **WHEN** s'executa el test `connexio.spec.ts` amb `useNuxtApp` mockejat i un mock EventEmitter com a `$socket`
- **THEN** es pot emetre `connect`, `disconnect` i `reconnect_attempt` manualment i verificar que `connexio.estat` canvia correctament

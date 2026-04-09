## MODIFIED Requirements

### Requirement: Store Pinia seients.ts centralitza l'estat inicial i les actualitzacions en temps real

La store `seients.ts` SHALL exposar l'acció `inicialitzar(slug: string)` que crida `GET /api/events/{slug}/seats`, emmagatzema els seients en un `Map<string, SeatState>` i estableix `isLoading` durant la petició. Reutilitza l'enum `EstatSeient` de `@shared/seat.types`.

A més, la store SHALL exposar:

- `connectar(slug: string)`: crida `$socket.connect()` amb el JWT de l'auth store, subscriu al handler de `seient:canvi-estat` i emet `event:unir` amb l'`eventId` de l'event carregat per `inicialitzar`. Requereix que `inicialitzar` s'hagi executat prèviament.
- `desconnectar()`: elimina el listener de `seient:canvi-estat` i crida `$socket.disconnect()`.
- `actualitzarEstat(seatId: string, estat: EstatSeient): void`: actualitza de manera síncrona l'estat d'un seient existent al `Map` (`this.llistat.set(seatId, { ...existing, estat })`). Si el `seatId` no existeix al Map, l'actualització s'ignora silenciosament.

#### Scenario: Acció inicialitzar popula el Map de seients

- **GIVEN** que la resposta de l'API retorna 200 seients
- **WHEN** s'executa `seients.inicialitzar('dune-4k-dolby-2026')`
- **THEN** `seients.llistat.size` val `200` i cada entrada inclou `{ estat, fila, numero, categoria, preu }`

#### Scenario: isLoading és true durant la petició i false quan acaba

- **GIVEN** que la petició és asíncrona
- **WHEN** es crida `inicialitzar()` i la promesa no s'ha resolt
- **THEN** `seients.isLoading` val `true`; quan la promesa es resol, val `false`

#### Scenario: connectar emet event:unir al gateway

- **GIVEN** que `inicialitzar` ha completat i `seients.event.id` val `'evt-abc'`
- **WHEN** es crida `seients.connectar('dune-4k-dolby-2026')`
- **THEN** `$socket.connect()` és invocat i `$socket.emit('event:unir', { eventId: 'evt-abc' })` és invocat

#### Scenario: actualitzarEstat modifica l'estat d'un seient al Map

- **GIVEN** que el seient `'seat-1'` té estat `DISPONIBLE` al Map
- **WHEN** s'invoca `seients.actualitzarEstat('seat-1', EstatSeient.RESERVAT)`
- **THEN** `seients.llistat.get('seat-1')!.estat` val `EstatSeient.RESERVAT`
- **AND** la resta de camps del seient (`fila`, `numero`, `categoria`, `preu`) no canvien

#### Scenario: actualitzarEstat rep l'event seient:canvi-estat del socket

- **GIVEN** la store subscrita al socket amb `connectar` ja executa
- **WHEN** el socket emet l'event `seient:canvi-estat` amb `{ seatId: 'seat-1', estat: 'RESERVAT', fila: 'A', numero: 5 }`
- **THEN** `seients.actualitzarEstat('seat-1', 'RESERVAT')` és cridat automàticament

#### Scenario: desconnectar neteja el listener i tanca el socket

- **GIVEN** la store subscrita al socket
- **WHEN** s'invoca `seients.desconnectar()`
- **THEN** `$socket.off('seient:canvi-estat')` és invocat
- **AND** `$socket.disconnect()` és invocat

#### Scenario: Testabilitat — mock de $fetch i $socket

- **WHEN** s'executa el test `seients.spec.ts` amb `$fetch` mockejat i `useNuxtApp` retornant un socket mock
- **THEN** `seients.llistat` conté exactament els seients de la resposta mock
- **AND** cridar `actualitzarEstat` directament actualitza el Map sense necessitar connexió real

## ADDED Requirements

### Requirement: Pàgina /events/[slug] gestiona el cicle de vida de la connexió WebSocket

La pàgina `/events/[slug].vue` SHALL cridar `seients.connectar(slug)` dins de `onMounted` (després de confirmar que `seients.event` existeix) i `seients.desconnectar()` dins de `onUnmounted`, de manera que la connexió WebSocket estigui activa únicament mentre la pàgina és visible.

#### Scenario: Connexió WS s'estableix en muntar la pàgina

- **GIVEN** que la pàgina `/events/dune-4k-dolby-2026` ha completat `inicialitzar`
- **WHEN** es dispara el hook `onMounted`
- **THEN** `seients.connectar('dune-4k-dolby-2026')` és invocat

#### Scenario: Connexió WS es tanca en desmontar la pàgina

- **GIVEN** la pàgina amb el WS actiu
- **WHEN** l'usuari navega fora de la pàgina i es dispara `onUnmounted`
- **THEN** `seients.desconnectar()` és invocat i la connexió Socket.IO es tanca

#### Scenario: Testabilitat — lifecycle hooks invocables en test

- **WHEN** s'executa el test de la pàgina (`events-slug.spec.ts`) amb la store `seients` mockejada
- **THEN** en simular el muntatge de la pàgina, `seients.connectar` és invocat exactament una vegada
- **AND** en simular el desmuntatge, `seients.desconnectar` és invocat exactament una vegada

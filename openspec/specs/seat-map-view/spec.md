## ADDED Requirements

### Requirement: Pàgina /events/[slug] mostra el mapa de seients en carregar

El sistema SHALL renderitzar la pàgina `/events/[slug]` en mode client-side (CSR) i mostrar el mapa complet de seients de l'event corresponent un cop rebuda la resposta de l'API, sense necessitat d'autenticació de l'usuari.

#### Scenario: Mapa carregat correctament

- **GIVEN** que existeix l'event `dune-4k-dolby-2026` amb 200 seients distribuïts en 10 files
- **WHEN** un visitant navega a `/events/dune-4k-dolby-2026`
- **THEN** el component `MapaSeients.vue` renderitza 200 seients (10 files × 20 seients), tots de color verd (DISPONIBLE)

#### Scenario: Estat de càrrega mentre es fa la petició

- **GIVEN** que la petició a l'API és pendent
- **WHEN** la pàgina s'està carregant
- **THEN** es mostra un indicador de càrrega (skeleton o spinner) fins que arriba la resposta

#### Scenario: Event no trobat

- **GIVEN** que no existeix cap event amb slug `no-existeix`
- **WHEN** un visitant navega a `/events/no-existeix`
- **THEN** el component `NotificacioEstat.vue` mostra "Event no trobat" i apareix un botó per tornar a la portada

#### Scenario: Testabilitat — la pàgina renderitza amb dades mock

- **WHEN** s'executa el test `events-slug.spec.ts` amb la store `seients` pre-poblada amb dades mock
- **THEN** el component `MapaSeients.vue` és present al DOM i renderitza el nombre correcte d'elements `.seient`

---

### Requirement: Component Seient.vue reflecteix visualment l'estat amb colors

El component `Seient.vue` SHALL aplicar la classe CSS corresponent a l'estat del seient: `DISPONIBLE` → verd (`#16A34A`), `RESERVAT` → taronja (`#D97706`), `SELECCIONAT_PER_MI` → violeta (`#7C3AED`), `VENUT` → gris fosc (`#374151`).

#### Scenario: Seient disponible es mostra en verd

- **GIVEN** un component `Seient.vue` amb la prop `estat = "DISPONIBLE"`
- **WHEN** es renderitza el component
- **THEN** el botó/div del seient té la classe CSS `seient--disponible` i el color aplicat és `#16A34A`

#### Scenario: Seient reservat per un altre es mostra en taronja

- **GIVEN** un component `Seient.vue` amb la prop `estat = "RESERVAT"`
- **WHEN** es renderitza el component
- **THEN** el component té la classe `seient--reservat` i el color `#D97706`

#### Scenario: Seient venut es mostra en gris fosc

- **GIVEN** un component `Seient.vue` amb la prop `estat = "VENUT"`
- **WHEN** es renderitza el component
- **THEN** el component té la classe `seient--venut` i el color `#374151`

#### Scenario: Testabilitat — classes CSS per estat

- **WHEN** s'executa el test `Seient.spec.ts` passant cada valor d'estat possible
- **THEN** cada estat produeix exactament una classe CSS diferent i única

---

### Requirement: Component LlegendaEstats.vue sempre visible amb 4 estats

El sistema SHALL mostrar el component `LlegendaEstats.vue` en tot moment a la pàgina de l'event, amb els 4 estats possibles d'un seient i els seus colors associats.

#### Scenario: Llegenda visible amb 4 ítems

- **GIVEN** que la pàgina `/events/[slug]` ha carregat
- **WHEN** l'usuari inspecciona la UI
- **THEN** el component `LlegendaEstats.vue` és visible i conté exactament 4 ítems: Disponible, Reservat, Seleccionat per mi, Venut

#### Scenario: Testabilitat — count d'ítems de la llegenda

- **WHEN** s'executa el test `LlegendaEstats.spec.ts`
- **THEN** es troben exactament 4 elements fill al component de llegenda

---

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

---

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

---

### Requirement: Pàgina responsiva amb scroll horitzontal en mòbil

El component `MapaSeients.vue` SHALL ser responsiu: en pantalles de < 768px d'amplada, el grid de seients té scroll horitzontal per poder-se navegar sense truncar files.

#### Scenario: Scroll horitzontal en pantalla estreta

- **GIVEN** que el viewport és de 375px d'ample (mòbil) i el grid de seients supera aquesta amplada
- **WHEN** l'usuari carrega la pàgina
- **THEN** el contenidor del mapa té `overflow-x: auto` i tots els seients són accessibles fent scroll horitzontal

---

### Requirement: Mode lectura per a admins a /events/[slug]

La pàgina `/events/[slug]` SHALL detectar si l'usuari autenticat té `role = 'admin'` i, si és així, entrar en mode lectura: el mapa de seients es mostra amb l'estat actual en temps real, però totes les accions de reserva i compra queden deshabilitades i ocultes.

En mode lectura:

- El bloc `topbar-reserva` (temporitzador + botó "Confirmar compra") SHALL estar ocult independentment de l'estat del store `reserva`.
- `MapaSeients.vue` SHALL rebre la prop `:read-only="true"`, deshabilitant el handler de clic en tots els `Seient.vue` i aplicant `cursor: default`.
- L'indicador de connexió WS (`ConnexioIndicador`) i la llegenda (`LlegendaEstats`) SHALL continuar visibles.
- L'admin SHALL continuar rebent actualitzacions en temps real (`seient:canvi-estat`, `stats:actualitzacio`) via WebSocket.

#### Scenario: Admin veu el mapa però no pot reservar

- **GIVEN** un usuari autenticat amb `role = 'admin'`
- **WHEN** navega a `/events/dune-4k-dolby-2026`
- **THEN** el mapa de seients es renderitza amb els estats actuals
- **THEN** cap seient és clicable (cursor: default, click handler absent o deshabilitat)
- **THEN** no hi ha cap botó "Confirmar compra" ni temporitzador de reserva visible

#### Scenario: Admin no veu el botó de checkout malgrat tenir reserves al store

- **GIVEN** un usuari amb `role = 'admin'` i el store `reserva` amb `teReservaActiva = true` (estat residual)
- **WHEN** es renderitza la pàgina `/events/[slug]`
- **THEN** el bloc `topbar-reserva` (temporitzador + "Confirmar compra") NO és visible

#### Scenario: Admin rep actualitzacions de seients en temps real

- **GIVEN** un admin visualitzant `/events/dune-4k-dolby-2026` en mode lectura
- **WHEN** un comprador reserva el seient B3 i el servidor emet `seient:canvi-estat` amb `estat: RESERVAT`
- **THEN** el seient B3 actualitza el seu color a taronja (RESERVAT) al mapa de l'admin

#### Scenario: Comprador veu el mapa en mode interactiu (no afectat)

- **GIVEN** un usuari autenticat amb `role = 'comprador'`
- **WHEN** navega a `/events/[slug]`
- **THEN** els seients disponibles són clicables i el flux de reserva és funcional

#### Scenario: Testabilitat — mode lectura actiu per a admin

- **WHEN** es munta `[slug].vue` amb `authStore.user.role = 'admin'` (mock) i `MapaSeients.vue` stubat
- **THEN** `MapaSeients.vue` rep la prop `readOnly = true`
- **THEN** el bloc `topbar-reserva` no és present al DOM

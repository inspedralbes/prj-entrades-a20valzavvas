## ADDED Requirements

### Requirement: useConflicte.ts escolta reserva:rebutjada i exposa l'estat del toast

El composable `useConflicte.ts` SHALL registrar un listener per a l'event privat `reserva:rebutjada { seatId, motiu }` quan és invocat. En rebre l'event, MUST llegir les dades del seient (fila i número) des de la store `seients`, construir el missatge `"El seient [fila][numero] acaba de ser reservat. Escull un altre seient."`, establir el ref reactiu `conflicte` amb el missatge i programar el seu esborrat al cap de 4 segons. El composable MUST exposar `conflicte: Ref<{ missatge: string } | null>` i l'acció `tancarConflicte(): void`.

#### Scenario: Conflicte detectat — missatge construït amb fila i número

- **GIVEN** el Comprador és a la pàgina `/events/[slug]` i el seient D4 (fila: D, número: 4) existeix a la store `seients`
- **WHEN** el servidor emet `reserva:rebutjada { seatId: "D4-id", motiu: "no_disponible" }`
- **THEN** `conflicte.value` passa a `{ missatge: "El seient D4 acaba de ser reservat. Escull un altre seient." }`

#### Scenario: Seient no trobat a la store — missatge genèric

- **GIVEN** la store `seients` no conté el `seatId` rebut a `reserva:rebutjada`
- **WHEN** el servidor emet `reserva:rebutjada { seatId: "unknown-id", motiu: "no_disponible" }`
- **THEN** `conflicte.value` passa a `{ missatge: "Un seient acaba de ser reservat. Escull un altre seient." }`

#### Scenario: Auto-dismiss als 4 segons

- **GIVEN** `conflicte.value` conté un missatge
- **WHEN** transcorren 4 segons sense cap interacció
- **THEN** `conflicte.value` passa a `null`

#### Scenario: tancarConflicte esborra l'estat immediatament

- **GIVEN** `conflicte.value` conté un missatge
- **WHEN** s'invoca `tancarConflicte()`
- **THEN** `conflicte.value` passa a `null` immediatament

#### Scenario: Segon conflicte reseteja el timer

- **GIVEN** ha arribat un primer `reserva:rebutjada` i el timer de 4s està en curs
- **WHEN** arriba un segon `reserva:rebutjada` per a un seient diferent abans que expiri el timer
- **THEN** el timer es reseteja a 4 segons de nou i `conflicte.value` conté el missatge del segon seient

#### Scenario: Testabilitat — composable testable amb Vitest

- **GIVEN** `useConflicte` s'inicialitza en un test Vitest amb `useNuxtApp().$socket` mockejat com a EventEmitter i la store `seients` mockejada via `setActivePinia(createPinia())`
- **WHEN** es simula l'emissió de `reserva:rebutjada { seatId, motiu }` manualment
- **THEN** `conflicte.value` conté el missatge esperat sense connexió real al servidor
- **AND** usant `vi.useFakeTimers()`, avançant 4000ms s'esborra `conflicte.value`

---

### Requirement: useConflicte.ts actualitza el seient conflictiu a RESERVAT de forma optimista

En rebre `reserva:rebutjada { seatId }`, el composable SHALL cridar `seients.actualitzarEstat(seatId, EstatSeient.RESERVAT)` per garantir que el seient es mostra com a taronja immediatament al mapa, sense esperar el broadcast `seient:canvi-estat` del servidor.

#### Scenario: Seient passa a RESERVAT immediatament al mapa

- **GIVEN** el seient D4 té `estat: DISPONIBLE` a la store `seients` en el moment del rebuig
- **WHEN** el servidor emet `reserva:rebutjada { seatId: "D4-id", motiu: "no_disponible" }`
- **THEN** `seients.getSeat("D4-id").estat` passa a `RESERVAT` sense esperar el broadcast
- **AND** el component `Seient.vue` renderitza D4 amb l'estil visual de RESERVAT

#### Scenario: Doble actualització idempotent — broadcast arriba després

- **GIVEN** `useConflicte` ja ha marcat D4 com a `RESERVAT` de forma optimista
- **WHEN** arriba el broadcast `seient:canvi-estat { seatId: "D4-id", status: "RESERVAT" }` uns instants després
- **THEN** `seients.getSeat("D4-id").estat` continua sent `RESERVAT` (actualització idempotent, sense canvi visible)

#### Scenario: Testabilitat — actualització optimista verificable en test

- **GIVEN** `useConflicte` s'inicialitza en un test amb la store `seients` via `setActivePinia(createPinia())` i amb el seient D4 en estat `DISPONIBLE`
- **WHEN** es simula la recepció de `reserva:rebutjada { seatId: "D4-id" }`
- **THEN** el test verifica que `seients.actualitzarEstat` ha estat cridat amb `("D4-id", EstatSeient.RESERVAT)`

---

### Requirement: NotificacioEstat.vue renderitza el toast de conflicte

El component `NotificacioEstat.vue` SHALL consumir `useConflicte()` i renderitzar un toast no bloquejant quan `conflicte.value` no és `null`. El toast MUST mostrar el missatge de `conflicte.value.missatge`. El component MUST emetre l'acció de tancament cridant `tancarConflicte()` en fer clic sobre el toast. El toast MUST ser no bloquejant (no superposa ni bloqueja la interacció amb el mapa de seients).

#### Scenario: Toast visible quan conflicte.value no és null

- **GIVEN** `conflicte.value = { missatge: "El seient D4 acaba de ser reservat. Escull un altre seient." }`
- **WHEN** `NotificacioEstat.vue` es renderitza
- **THEN** el toast és visible a la pàgina amb el text "El seient D4 acaba de ser reservat. Escull un altre seient."

#### Scenario: Toast ocult quan conflicte.value és null

- **GIVEN** `conflicte.value = null`
- **WHEN** `NotificacioEstat.vue` es renderitza
- **THEN** el toast no és visible al DOM (v-if false o display:none)

#### Scenario: Clicar el toast crida tancarConflicte

- **GIVEN** el toast és visible
- **WHEN** el Comprador fa clic sobre el toast
- **THEN** `tancarConflicte()` és invocada i el toast desapareix

#### Scenario: Toast no bloquejant — el mapa de seients és interactuable

- **GIVEN** el toast és visible
- **WHEN** el Comprador fa clic sobre un seient del mapa que queda darrere del toast
- **THEN** el clic arriba al seient (el toast usa `pointer-events: none` o és posicionat sense cobrir el mapa)

#### Scenario: Testabilitat — NotificacioEstat.vue testable amb Vitest

- **GIVEN** `useConflicte` és mockejat per retornar `{ conflicte: ref({ missatge: "test" }), tancarConflicte: vi.fn() }`
- **WHEN** es renderitza `NotificacioEstat.vue` amb `mountSuspended`
- **THEN** el toast conté el text "test"
- **AND** en simular un clic sobre el toast, `tancarConflicte` és invocada una vegada

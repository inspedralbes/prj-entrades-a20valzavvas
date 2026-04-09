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

### Requirement: Store Pinia seients.ts centralitza l'estat inicial

La store `seients.ts` SHALL exposar l'acció `inicialitzar(slug: string)` que crida `GET /api/events/{slug}/seats`, em­magatzema els seients en un `Map<string, SeatState>` i estableix `isLoading` durant la petició. Reutilitza l'enum `EstatSeient` de `@shared/seat.types`.

#### Scenario: Acció inicialitzar popula el Map de seients

- **GIVEN** que la resposta de l'API retorna 200 seients
- **WHEN** s'executa `seients.inicialitzar('dune-4k-dolby-2026')`
- **THEN** `seients.llistat.size` val `200` i cada entrada inclou `{ estat, fila, numero, categoria, preu }`

#### Scenario: isLoading és true durant la petició i false quan acaba

- **GIVEN** que la petició és asíncrona
- **WHEN** es crida `inicialitzar()` i la promesa no s'ha resolt
- **THEN** `seients.isLoading` val `true`; quan la promesa es resol, val `false`

#### Scenario: Testabilitat — mock de $fetch

- **WHEN** s'executa el test `seients.spec.ts` amb `$fetch` mockejat per retornar dades fixes
- **THEN** `seients.llistat` conté exactament els seients de la resposta mock i `isLoading` acaba en `false`

---

### Requirement: Pàgina responsiva amb scroll horitzontal en mòbil

El component `MapaSeients.vue` SHALL ser responsiu: en pantalles de < 768px d'amplada, el grid de seients té scroll horitzontal per poder-se navegar sense truncar files.

#### Scenario: Scroll horitzontal en pantalla estreta

- **GIVEN** que el viewport és de 375px d'ample (mòbil) i el grid de seients supera aquesta amplada
- **WHEN** l'usuari carrega la pàgina
- **THEN** el contenidor del mapa té `overflow-x: auto` i tots els seients són accessibles fent scroll horitzontal

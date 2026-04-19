## ADDED Requirements

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

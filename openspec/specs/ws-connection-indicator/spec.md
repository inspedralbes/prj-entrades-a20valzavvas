## Purpose

Especificació del component `ConnexioIndicador`, que mostra l'estat de la connexió WebSocket (Socket.IO) a l'usuari en temps real a la pàgina d'event.

## Requirements

### Requirement: Indicador visual de l'estat de connexió WebSocket

El component `ConnexioIndicador` SHALL mostrar en tot moment l'estat actual de la connexió Socket.IO llegit de la store `connexio.ts`, sense lògica de negoci pròpia.

#### Scenario: Indicador en estat connectat

- **GIVEN** que la store `connexio.ts` té `estat === 'connectat'`
- **WHEN** es renderitza `<ConnexioIndicador />`
- **THEN** el component mostra un punt verd i el text "Connectat"

#### Scenario: Indicador en estat desconnectat

- **GIVEN** que la store `connexio.ts` té `estat === 'desconnectat'`
- **WHEN** es renderitza `<ConnexioIndicador />`
- **THEN** el component mostra un punt vermell i el text "Desconnectat"

#### Scenario: Indicador en estat reconnectant

- **GIVEN** que la store `connexio.ts` té `estat === 'reconnectant'`
- **WHEN** es renderitza `<ConnexioIndicador />`
- **THEN** el component mostra un punt vermell i el text "Reconnectant…"

#### Scenario: Canvi reactiu d'estat

- **GIVEN** que el component és muntat i `connexio.estat` val `'connectat'`
- **WHEN** la store actualitza `estat` a `'desconnectat'`
- **THEN** el component actualitza el text i el color en el mateix tick de Vue sense recarregar la pàgina

#### Scenario: Testabilitat unitaria

- **GIVEN** que `useConnexioStore` es mocka amb `{ estat: ref('reconnectant') }`
- **WHEN** s'executa el test de `ConnexioIndicador.spec.ts` amb Vitest
- **THEN** el test verifica el text i la classe CSS esperats sense necessitar un entorn WS real

### Requirement: Integració a la pàgina /events/[slug]

La pàgina `pages/events/[slug].vue` SHALL incloure `<ConnexioIndicador />` visible a la part superior del contingut de l'event.

#### Scenario: Indicador present a la pàgina de l'event

- **GIVEN** que l'usuari navega a `/events/[slug]`
- **WHEN** la pàgina es renderitza (CSR)
- **THEN** `<ConnexioIndicador />` és present al DOM de la pàgina

#### Scenario: Indicador absent en altres rutes

- **GIVEN** que l'usuari és a `/`, `/checkout`, `/entrades` o `/admin`
- **WHEN** es renderitza qualsevol d'aquestes pàgines
- **THEN** `<ConnexioIndicador />` NO és present (el component és únicament per a la pàgina d'event)

#### Scenario: No impacte en la navegació al mapa

- **GIVEN** que `<ConnexioIndicador />` és rendered a `/events/[slug]`
- **WHEN** l'usuari interacciona amb el mapa de seients (scroll, clic)
- **THEN** l'indicador no interfereix ni bloqueja la interacció amb el mapa

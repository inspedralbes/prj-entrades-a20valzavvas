## MODIFIED Requirements

### Requirement: La pàgina /admin mostra comptadors reactius actualitzats en temps real

La pàgina `pages/admin/index.vue` (Nuxt 3, CSR, `ssr: false`) SHALL mostrar els comptadors de l'event seleccionat. En muntar el component, MUST fer `GET /api/admin/events/:id/stats` per obtenir l'estat inicial. El component MUST subscriure's a l'event Socket.IO `stats:actualitzacio` i actualitzar els comptadors reactius sense recarregar la pàgina. El composable `useAdminStats(eventId)` SHALL encapsular la lògica de fetch inicial i subscripció WebSocket. La pàgina MUST també mostrar la taula d'informes per categoria (veure spec `admin-sales-report`) com a secció independent de les estadístiques en temps real.

#### Scenario: Comptadors inicials carregats en muntar el component

- **GIVEN** l'administradora obre `/admin` amb un event seleccionat (`eventId`)
- **WHEN** el component es munta (onMounted)
- **THEN** es fa `GET /api/admin/events/:id/stats` i els comptadors mostren els valors retornats per l'API
- **AND** la pàgina no es recarrega

#### Scenario: Comptadors s'actualitzen en rebre stats:actualitzacio

- **GIVEN** l'admin és a `/admin` i té el socket connectat al room `event:{eventId}`
- **WHEN** el servidor emet l'event `stats:actualitzacio` amb un nou payload
- **THEN** els comptadors de la UI s'actualitzen reactivamente amb els valors del payload
- **AND** l'administradora no ha recarregat la pàgina

#### Scenario: Criteri d'acceptació PE-31 — compra confirma canvi de comptadors

- **GIVEN** l'admin és a `/admin` i un usuari compra 2 entrades en un altre navegador
- **WHEN** la compra es confirma
- **THEN** els comptadors mostren +2 venuts, -2 disponibles i la recaptació incrementada
- **AND** l'admin no ha recarregat la pàgina

#### Scenario: La taula d'informes és visible a la mateixa pàgina que els comptadors

- **GIVEN** l'administradora obre `/admin`
- **WHEN** la pàgina acaba de carregar
- **THEN** la secció de comptadors en temps real és visible a la part superior
- **AND** la taula d'informes per categoria és visible a la part inferior sense recarregar la pàgina

#### Scenario: Testabilitat — useAdminStats pot ser provat amb socket mockejat

- **WHEN** `useAdminStats(eventId)` és invocat en un test Vitest amb `$socket` mockejat i fetch mockejat
- **THEN** en simular la recepció de `stats:actualitzacio`, els refs retornats pel composable s'actualitzen amb els nous valors

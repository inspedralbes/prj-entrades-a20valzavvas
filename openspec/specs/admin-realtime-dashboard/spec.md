## Purpose

Dashboard d'administració en temps real que mostra les estadístiques actuals d'un event (seients disponibles, reservats, venuts, recaptació) i s'actualitza automàticament via WebSocket sense necessitat de recarregar la pàgina.

## Requirements

### Requirement: GET /api/admin/events/:id/stats retorna les estadístiques actuals de l'event

El `AdminEventController` (Laravel) SHALL exposar l'endpoint `GET /api/admin/events/:id/stats` protegit pel middleware `auth:sanctum` + rol `admin`. L'`AdminEventService` MUST calcular i retornar un objecte `StatsActualitzacioPayload` amb: `disponibles` (count), `reservats` (count), `venuts` (count), `totalSeients` (count), `percentatgeVenuts` (number, 0-100), `percentatgeReservats` (number, 0-100), `usuaris` (number), `reservesActives` (count), `recaptacioTotal` (number, decimal consistent amb `OrderItem.price`).

#### Scenario: Admin autenticat rep les stats correctes

- **GIVEN** un event amb 100 seients: 60 DISPONIBLE, 20 RESERVAT, 20 VENUT, i una recaptació total de 400.00€
- **WHEN** l'administradora fa `GET /api/admin/events/evt-123/stats` amb capçalera `X-Admin-Token: valid-token`
- **THEN** el servidor respon 200 OK amb `{ disponibles: 60, reservats: 20, venuts: 20, totalSeients: 100, percentatgeVenuts: 20, percentatgeReservats: 20, reservesActives: <n>, recaptacioTotal: 400.00, usuaris: <n> }`

#### Scenario: Token invàlid retorna 403

- **GIVEN** una petició a `GET /api/admin/events/:id/stats`
- **WHEN** la capçalera `X-Admin-Token` és absent o incorrecta
- **THEN** el servidor respon 403 Forbidden
- **AND** no s'executa cap query a la base de dades

#### Scenario: Event inexistent retorna 404

- **GIVEN** un token admin vàlid
- **WHEN** es fa `GET /api/admin/events/id-inexistent/stats`
- **THEN** el servidor respon 404 Not Found

#### Scenario: Testabilitat — AdminService.getEventStats() pot ser provat en unitari

- **WHEN** `AdminService` és instanciat en un test Vitest amb `PrismaService` mockejat
- **THEN** es pot cridar `getEventStats(eventId)` i verificar que retorna el `StatsActualitzacioPayload` calculat a partir de les dades mockejades

---

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

#### Scenario: Testabilitat — useAdminStats pot ser provat amb socket mockejat

- **WHEN** `useAdminStats(eventId)` és invocat en un test Vitest amb `$socket` mockejat i fetch mockejat
- **THEN** en simular la recepció de `stats:actualitzacio`, els refs retornats pel composable s'actualitzen amb els nous valors

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

## ADDED Requirements

### Requirement: GET /api/admin/reports retorna un llistat agregat per categoria de preu

L'`AdminEventController` (Laravel) SHALL exposar l'endpoint `GET /api/admin/reports` protegit per `auth:sanctum` + rol `admin`. L'`AdminEventService` MUST calcular i retornar un array de `CategoryReportRow` amb els camps: `category_id` (UUID), `event_nom` (string), `nom` (string), `preu` (decimal string), `total_seients` (integer), `seients_venuts` (integer), `percentatge_ocupacio` (number, 0-100 arrodonit a 2 decimals), `recaptacio` (decimal string). La recaptació es calcula com la suma de `order_items.price` dels seients d'aquella categoria amb `estat = VENUT`.

#### Scenario: Informe correcte amb vendes existents

- **GIVEN** existeixen dues categories: "VIP" (preu 50.00, 50 seients totals, 10 VENUT) i "General" (preu 25.00, 100 seients totals, 30 VENUT)
- **AND** hi ha `OrderItem` registrats per cada seient VENUT amb el preu corresponent
- **WHEN** l'administradora fa `GET /api/admin/reports` amb capçalera `Authorization: Bearer <token-admin>`
- **THEN** el servidor respon 200 OK amb un array que conté: `{ nom: "VIP", seients_venuts: 10, recaptacio: "500.00", percentatge_ocupacio: 20.0 }` i `{ nom: "General", seients_venuts: 30, recaptacio: "750.00", percentatge_ocupacio: 30.0 }`

#### Scenario: Categoria sense vendes retorna zeros

- **GIVEN** existeix una categoria "Estudiants" amb 20 seients totals i 0 VENUT
- **WHEN** es consulta `GET /api/admin/reports`
- **THEN** la resposta inclou `{ nom: "Estudiants", seients_venuts: 0, recaptacio: "0.00", percentatge_ocupacio: 0.0 }`

#### Scenario: Categoria sense seients no produeix divisió per zero

- **GIVEN** existeix una categoria "Premium" recentment creada sense cap seient assignat (`total_seients = 0`)
- **WHEN** es consulta `GET /api/admin/reports`
- **THEN** la resposta inclou `{ nom: "Premium", total_seients: 0, percentatge_ocupacio: 0.0 }` sense error

#### Scenario: Token invàlid o absent retorna 401

- **GIVEN** una petició a `GET /api/admin/reports`
- **WHEN** la capçalera `Authorization` és absent o el token és invàlid
- **THEN** el servidor respon 401 Unauthorized

#### Scenario: Usuari autenticat sense rol admin retorna 403

- **GIVEN** un token JWT vàlid d'un usuari amb rol `comprador`
- **WHEN** es fa `GET /api/admin/reports` amb el token de comprador
- **THEN** el servidor respon 403 Forbidden

#### Scenario: Testabilitat — AdminEventService.getSalesReport() pot ser provat en unitari

- **WHEN** `AdminEventService` és instanciat en un test PHPUnit amb factories de base de dades o mocks
- **THEN** es pot cridar `getSalesReport()` i verificar que retorna el `CategoryReportRow[]` calculat correctament a partir de dades conegudes, incloent la fórmula d'ocupació i la suma de recaptació

---

### Requirement: La pàgina /admin mostra la taula d'informes per categoria

La pàgina `pages/admin/index.vue` (Nuxt 3, CSR, `ssr: false`) SHALL incloure una nova secció que mostri la taula d'informes de categories. En muntar el component, MUST fer `GET /api/admin/reports` i mostrar les dades en una taula HTML amb les columnes: Categoria, Event, Preu, Total Seients, Venuts, % Ocupació, Recaptació. La taula MUST mostrar un estat de càrrega mentre espera la resposta i un missatge d'error si la crida falla.

#### Scenario: Taula carregada correctament en muntar el component

- **GIVEN** l'administradora obre `/admin` amb un token admin vàlid
- **WHEN** el component es munta (onMounted)
- **THEN** es fa `GET /api/admin/reports` i la taula mostra una fila per cada categoria retornada
- **AND** cada fila mostra: nom de categoria, nom d'event, preu unitari, total seients, seients venuts, percentatge d'ocupació i recaptació formatada en EUR

#### Scenario: Missatge de càrrega mentre arriba la resposta

- **GIVEN** l'administradora obre `/admin`
- **WHEN** la crida a `/api/admin/reports` està en curs
- **THEN** la secció mostra un indicador de càrrega (text o spinner)
- **AND** la taula no és visible fins que les dades estan disponibles

#### Scenario: Missatge d'error si la crida falla

- **GIVEN** l'administradora obre `/admin`
- **WHEN** la crida a `GET /api/admin/reports` retorna un error (ex: 500 o xarxa caiguda)
- **THEN** la secció mostra un missatge d'error llegible
- **AND** no es mostra cap taula buida

#### Scenario: Taula buida si no hi ha categories

- **GIVEN** no existeix cap `PriceCategory` a la base de dades
- **WHEN** es carrega `/admin`
- **THEN** la taula mostra un missatge "No hi ha dades d'informes disponibles" en lloc de files buides

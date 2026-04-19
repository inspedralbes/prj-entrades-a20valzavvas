# Capability: Order History

## Purpose

Endpoint autenticat per consultar les ordres de l'usuari loguejat. Substitueix el disseny original d'un endpoint públic per email (mai implementat).

---

## Requirements

### Requirement: Llistat d'ordres de l'usuari autenticat

El sistema SHALL exposar `GET /api/orders` protegit per `auth:sanctum` que retorni totes les ordres de l'usuari autenticat, ordenades per `created_at DESC`, amb els ítems, seients i event associats.

#### Scenario: Usuari autenticat amb ordres (happy path)

- **GIVEN** que l'usuari autenticat ha realitzat 2 compres prèvies
- **WHEN** s'envia `GET /api/orders` amb `Authorization: Bearer <token>`
- **THEN** la resposta té codi HTTP `200`
- **THEN** la resposta és un array de 2 objectes ordre, ordenats per `created_at DESC`
- **THEN** cada ordre conté `id`, `total_amount`, `status`, `created_at`, i `items`
- **THEN** cada ítem conté `id`, `price`, i `seat` (amb `row`, `number`, `price_category.name`, `event.name`, `event.slug`, `event.date`, `event.venue`)

#### Scenario: Usuari autenticat sense ordres

- **GIVEN** que l'usuari autenticat no ha realitzat cap compra
- **WHEN** s'envia `GET /api/orders` amb `Authorization: Bearer <token>`
- **THEN** la resposta té codi HTTP `200`
- **THEN** la resposta és un array buit `[]`

#### Scenario: Crida sense token (no autenticat)

- **GIVEN** que no s'inclou cap `Authorization` header
- **WHEN** s'envia `GET /api/orders`
- **THEN** la resposta té codi HTTP `401`

#### Scenario: Aïllament entre usuaris

- **GIVEN** que l'usuari A té 2 ordres i l'usuari B té 1 ordre
- **WHEN** l'usuari A envia `GET /api/orders` amb el seu token
- **THEN** la resposta conté exactament 2 ordres, cap de les quals pertany a l'usuari B

#### Scenario: Testabilitat — feature test Laravel

- **WHEN** s'executa el test de feature `OrderController::index` amb un usuari autenticat que té ordres
- **THEN** la resposta té codi `200` i l'array conté les ordres correctes sense ordres d'altres usuaris

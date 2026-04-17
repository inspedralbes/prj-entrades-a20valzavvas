## MODIFIED Requirements

### Requirement: Creació d'ordre al backend (POST /api/orders)
El sistema SHALL exposar l'endpoint `POST /api/orders` (autenticat via Sanctum) que accepta `{ nom, email, seat_ids?: string[] }`, crea una ordre amb tots els seients reservats de l'usuari, els marca com a `VENUT` i elimina les reserves, tot dins d'una transacció de base de dades. Si `seat_ids` s'envia i algun dels UUIDs no té reserva activa, el sistema SHALL retornar `409 { seients_expirats: string[] }` sense crear cap ordre.

#### Scenario: Compra completada amb èxit
- **GIVEN** que l'usuari autenticat té N reserves actives no expirades
- **WHEN** envia `POST /api/orders` amb `{ nom: "Joan", email: "joan@ex.com", seat_ids: [uuid1, uuid2] }`
- **THEN** el sistema retorna HTTP 201 amb `{ id, total_amount, items }`
- **THEN** crea un `Order` + N `OrderItem`s, actualitza cada `Seat.estat` a `VENUT`, i elimina les N `Reservation`s

#### Scenario: Seient expirat durant el checkout
- **GIVEN** que `seat_ids` conté un UUID la reserva del qual ha estat eliminada pel cron
- **WHEN** envia `POST /api/orders`
- **THEN** el sistema retorna HTTP 409 amb `{ seients_expirats: [uuid_expirat] }`
- **THEN** no es crea cap `Order`

#### Scenario: Sense reserves actives al servidor
- **GIVEN** que l'usuari no té reserves actives a la base de dades (i no envia `seat_ids`)
- **WHEN** envia `POST /api/orders`
- **THEN** el sistema retorna HTTP 409 amb `{ error: "No tens reserves actives." }`

#### Scenario: Validació email invàlid al servidor
- **GIVEN** que el cos de la petició conté `email: "no-es-un-email"`
- **WHEN** envia `POST /api/orders`
- **THEN** el sistema retorna HTTP 422 amb errors de validació per al camp `email`

#### Scenario: Validació nom buit al servidor
- **GIVEN** que el cos de la petició no conté el camp `nom`
- **WHEN** envia `POST /api/orders`
- **THEN** el sistema retorna HTTP 422 amb errors de validació per al camp `nom`

#### Scenario: Atomicitat — rollback en cas d'error
- **GIVEN** que durant la transacció es produeix un error (ex: DB constraint)
- **WHEN** s'executa `POST /api/orders`
- **THEN** cap `Order`, `OrderItem` ni canvi d'estat de `Seat` és persistit, i es retorna HTTP 500

#### Scenario: Accés no autenticat
- **GIVEN** que la petició no inclou cap token Sanctum vàlid
- **WHEN** s'envia `POST /api/orders`
- **THEN** el sistema retorna HTTP 401

#### Scenario: Testabilitat — creació d'ordre
- **WHEN** s'executa el test de feature `OrderControllerTest::test_store_creates_order`
- **THEN** la BD té 1 `Order`, N `OrderItem`s, els `Seat`s estan en estat `VENUT` i les `Reservation`s han estat eliminades

---

### Requirement: Gestió de seients expirats al frontend
La pàgina `/checkout` SHALL enviar els `seat_ids` actuals en el body de `POST /api/orders` i SHALL mostrar un missatge clar a l'usuari quan el servidor retorni `409 { seients_expirats }`, indicant quins seients (per etiqueta fila+numero) han expirat.

#### Scenario: Missatge d'error amb seients expirats
- **GIVEN** que `POST /api/orders` retorna HTTP 409 amb `{ seients_expirats: ["uuid-B5"] }`
- **WHEN** el frontend processa la resposta
- **THEN** es mostra un missatge d'error que identifica el seient B5 (fila B, numero 5) com expirat
- **THEN** el formulari roman visible (l'usuari pot tornar enrere per escollir nous seients)

#### Scenario: Emissió de compra:confirmar post-201
- **GIVEN** que `POST /api/orders` retorna HTTP 201
- **WHEN** el frontend processa la resposta exitosa
- **THEN** el frontend emet `compra:confirmar { orderId, eventId, seients: [{seatId, fila, numero}] }` via Socket.IO
- **THEN** s'invoca `reservaStore.netejarReserva()` i `orderConfirmed` passa a `true`

#### Scenario: Testabilitat — error 409 seients expirats
- **WHEN** el mock de `$fetch` per a `POST /api/orders` retorna `{ status: 409, data: { seients_expirats: ["uuid-B5"] } }`
- **THEN** el component mostra el nom del seient B5 en el missatge d'error
- **THEN** `reservaStore.netejarReserva` NO ha estat invocat

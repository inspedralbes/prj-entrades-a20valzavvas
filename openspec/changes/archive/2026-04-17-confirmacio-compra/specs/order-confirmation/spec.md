## ADDED Requirements

### Requirement: Detecció de seients expirats durant el checkout
El sistema SHALL detectar quins seients esperava comprar l'usuari i, si algun ha expirat durant el procés de checkout, retornar `409` amb la llista de seients expirats sense crear cap `Order`.

#### Scenario: Seient expirat durant el checkout (cas principal PE-28)
- **GIVEN** que el Comprador tenia les reserves de B5 i B6 actives quan va entrar al checkout
- **GIVEN** que el cron ha alliberat B5 (la seva reserva ha expirat) mentre l'usuari omplia el formulari
- **WHEN** el Comprador envia `POST /api/orders` amb `{ nom, email, seat_ids: ["uuid-B5", "uuid-B6"] }`
- **THEN** el sistema retorna HTTP 409 amb `{ seients_expirats: ["uuid-B5"] }`
- **THEN** no es crea cap `Order` ni `OrderItem` a la base de dades

#### Scenario: Tots els seients expirats durant el checkout
- **GIVEN** que el Comprador tenia B5 i B6 reservats
- **GIVEN** que el cron ha alliberat tots dos durant el checkout
- **WHEN** el Comprador envia `POST /api/orders` amb `{ nom, email, seat_ids: ["uuid-B5", "uuid-B6"] }`
- **THEN** el sistema retorna HTTP 409 amb `{ seients_expirats: ["uuid-B5", "uuid-B6"] }`
- **THEN** no es crea cap `Order`

#### Scenario: Sense cap seient expirat (happy path)
- **GIVEN** que el Comprador té 2 reserves actives (B5, B6) no expirades
- **WHEN** envia `POST /api/orders` amb `{ nom, email, seat_ids: ["uuid-B5", "uuid-B6"] }`
- **THEN** el sistema retorna HTTP 201 sense `seients_expirats`
- **THEN** es crea un `Order` amb 2 `OrderItem`s

#### Scenario: Testabilitat — 409 amb seients expirats
- **WHEN** s'executa el test de feature amb un `seat_ids` que conté un UUID sense reserva activa
- **THEN** la resposta és 409 amb `seients_expirats` que conté l'UUID absent i no hi ha cap `Order` creat a la BD

---

### Requirement: Broadcast de canvi d'estat VENUT via Socket.IO
Un cop creada l'ordre, el sistema SHALL notificar en temps real a tots els usuaris de la sala `event:{eventId}` que els seients venuts han passat a estat VENUT.

#### Scenario: Broadcast de seients venuts (AC principal PE-28)
- **GIVEN** que el Comprador amb `sessionToken A` té les reserves B5 i B6 actives
- **WHEN** `POST /api/orders` retorna 201 i el frontend emet `compra:confirmar { orderId, eventId, seients: [{seatId, fila, numero}] }`
- **THEN** el NestJS gateway fa broadcast `seient:canvi-estat { seatId, estat: VENUT, fila, numero }` a la sala `event:{eventId}` per a cada seient
- **THEN** els altres clients de la sala veuen B5 i B6 en gris (estat VENUT) sense recarregar

#### Scenario: Event privat compra:completada al comprador
- **GIVEN** que el NestJS gateway rep `compra:confirmar` d'un comprador autenticat
- **WHEN** el gateway processa l'event
- **THEN** emet `compra:completada { orderId, seients: [...] }` privadament al socket del comprador (no al room)

#### Scenario: compra:confirmar amb llista de seients buida (guard)
- **GIVEN** que el gateway rep `compra:confirmar` amb `seients: []`
- **WHEN** es processa l'event
- **THEN** no s'emet cap `seient:canvi-estat` i no es fa cap broadcast

#### Scenario: Testabilitat — broadcast del gateway
- **WHEN** s'executa el test unitari del handler `compra:confirmar` de `SeatsGateway` amb 2 seients
- **THEN** `server.to(eventRoom).emit` es crida 2 vegades amb `seient:canvi-estat` i `estat: VENUT`
- **THEN** `socket.emit('compra:completada', ...)` es crida 1 vegada

---

### Requirement: Extensió del tipus `CompraConfirmarPayload`
El tipus `CompraConfirmarPayload` de `shared/types/socket.types.ts` SHALL incloure `orderId`, `eventId` i els detalls de cada seient (`seatId`, `fila`, `numero`) per permetre el broadcast sense crida addicional a Laravel.

#### Scenario: Nou payload compra:confirmar
- **GIVEN** que el frontend ha rebut `201 { id, total_amount, items }` de `POST /api/orders`
- **WHEN** el frontend emet `compra:confirmar`
- **THEN** el payload té la forma `{ orderId: string, eventId: string, seients: Array<{ seatId: string, fila: string, numero: number }> }`

#### Scenario: Testabilitat — tipus shared
- **WHEN** es compila el projecte (`pnpm type-check`)
- **THEN** no hi ha errors de TypeScript relacionats amb `CompraConfirmarPayload` al frontend ni al NestJS gateway

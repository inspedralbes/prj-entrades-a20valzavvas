# Capability: order-confirmation (delta)

## MODIFIED Requirements

### Requirement: Broadcast de canvi d'estat VENUT via Socket.IO

Un cop creada l'ordre, el sistema SHALL notificar en temps real a tots els usuaris de la sala `event:{eventId}` que els seients venuts han passat a estat VENUT. A més, **el sistema SHALL enviar un email de confirmació** a l'usuari comprador (via `OrderConfirmationMail`) immediatament després de la transacció, fora del bloc `DB::transaction`.

#### Scenario: Broadcast de seients venuts (AC principal PE-28)

- **GIVEN** que el Comprador autenticat té les reserves B5 i B6 actives
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

#### Scenario: Email enviat en completar la compra (nou)

- **GIVEN** que `POST /api/orders` completa la transacció amb èxit
- **WHEN** la resposta `201` és a punt de ser retornada
- **THEN** `Mail::to($user->email)->send(new OrderConfirmationMail($order))` és cridat 1 vegada
- **THEN** la resposta al frontend no es veu retardada per una excepció d'SMTP

#### Scenario: Testabilitat — broadcast del gateway

- **WHEN** s'executa el test unitari del handler `compra:confirmar` de `SeatsGateway` amb 2 seients
- **THEN** `server.to(eventRoom).emit` es crida 2 vegades amb `seient:canvi-estat` i `estat: VENUT`
- **THEN** `socket.emit('compra:completada', ...)` es crida 1 vegada

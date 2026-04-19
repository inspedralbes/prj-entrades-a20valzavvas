# Capability: order-confirmation-email

## Purpose

Email HTML automàtic enviat a l'usuari en completar una compra, amb el resum de l'ordre. Implementat via Laravel `Mailable` + blade template.

---

## ADDED Requirements

### Requirement: Email de confirmació enviat en completar la compra

El sistema SHALL enviar un email HTML a l'adreça de l'usuari autenticat quan `POST /api/orders` retorna `201`, amb el resum de l'ordre (nom d'usuari, event, seients i preu total). L'enviament es produeix fora de la transacció de BD.

#### Scenario: Email enviat correctament (happy path)

- **GIVEN** que l'usuari autenticat amb email `user@example.com` completa una compra de 2 seients
- **WHEN** `POST /api/orders` processa la transacció correctament i retorna `201`
- **THEN** s'envia 1 email a `user@example.com`
- **THEN** l'email té com a assumpte "Confirmació de la teva compra"
- **THEN** el cos HTML conté el nom de l'usuari, el nom de l'event, la llista de seients (fila + número), i el preu total

#### Scenario: Fallada d'enviament no reverteix la compra

- **GIVEN** que el servidor SMTP no és accessible
- **WHEN** la transacció de BD s'ha completat correctament
- **THEN** l'ordre existeix a la BD amb `status: completed`
- **THEN** la resposta al client és `201` (la compra és vàlida)

#### Scenario: No s'envia email si la transacció falla

- **GIVEN** que la transacció de BD llança una excepció
- **WHEN** `POST /api/orders` retorna `500` o `409`
- **THEN** no s'envia cap email

#### Scenario: Testabilitat — Mail::fake()

- **WHEN** s'executa el test de feature de `POST /api/orders` amb compra exitosa i `Mail::fake()`
- **THEN** `Mail::assertSent(OrderConfirmationMail::class)` passa
- **THEN** el mail es dirigeix a l'email de l'usuari autenticat

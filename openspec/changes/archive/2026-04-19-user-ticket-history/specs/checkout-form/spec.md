# Capability: checkout-form (delta)

## MODIFIED Requirements

### Requirement: Formulari de checkout envia la comanda al backend

El sistema SHALL permetre al Comprador autenticat enviar el formulari de checkout per completar la compra dels seients reservats. Quan `POST /api/orders` retorna `201`, el sistema SHALL substituir el formulari pel panel de confirmació (`order-confirmation-ui`) en lloc de mostrar un missatge inline mínim.

#### Scenario: Compra exitosa mostra panel de confirmació (modificat)

- **GIVEN** que el Comprador té reserves actives i omple el formulari de checkout
- **WHEN** `POST /api/orders` retorna `201 { id, total_amount, items }`
- **THEN** `orderConfirmed` passa a `true` i `orderId` s'actualitza amb l'id rebut
- **THEN** el formulari desapareix i es mostra el panel de confirmació amb el resum de la compra
- **THEN** el panel inclou el botó "Veure les meves entrades" que navega a `/entrades`

#### Scenario: Error de seients expirats (409) mostra missatge d'error

- **GIVEN** que algun seient ha expirat durant el checkout
- **WHEN** `POST /api/orders` retorna `409 { seients_expirats: [...] }`
- **THEN** el formulari continua visible amb un missatge d'error indicant els seients expirats
- **THEN** `orderConfirmed` roman `false`

#### Scenario: Redirecció si no hi ha reserves actives

- **GIVEN** que el Comprador accedeix a `/checkout` sense reserves actives
- **WHEN** es munta la pàgina
- **THEN** és redirigit a `/`

#### Scenario: Testabilitat — renderització del panel de confirmació

- **WHEN** s'executa el test unitari de `checkout.vue` amb `orderConfirmed = true` i dades d'ordre mocades
- **THEN** el DOM conté "Compra confirmada!" i el resum de l'ordre
- **THEN** el formulari no és al DOM

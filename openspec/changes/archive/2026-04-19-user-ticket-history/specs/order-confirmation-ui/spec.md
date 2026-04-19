# Capability: order-confirmation-ui

## Purpose

Panel visual inline a `checkout.vue` que s'activa quan `orderConfirmed = true`, mostrant el resum de la compra i navegació cap a `/entrades`.

---

## ADDED Requirements

### Requirement: Panel de confirmació post-compra a checkout

El sistema SHALL mostrar un panel de confirmació a `checkout.vue` quan la compra es completa correctament, substituint el formulari de checkout amb un resum visual de l'ordre i CTAs per continuar.

#### Scenario: Panel de confirmació visible després de la compra (happy path)

- **GIVEN** que l'usuari ha completat el formulari de checkout i `POST /api/orders` ha retornat `201`
- **WHEN** `orderConfirmed` passa a `true`
- **THEN** el formulari de checkout desapareix
- **THEN** es mostra el panel amb: missatge "Compra confirmada!", resum de l'ordre (event, seients, total), i dos botons: "Veure les meves entrades" i "Tornar als events"
- **THEN** "Veure les meves entrades" navega a `/entrades`
- **THEN** "Tornar als events" navega a `/`

#### Scenario: El formulari no es mostra durant la confirmació

- **GIVEN** que `orderConfirmed` és `true`
- **WHEN** l'usuari visualitza la pàgina `/checkout`
- **THEN** el formulari d'introduir nom i email no és visible

#### Scenario: Testabilitat — renderització del panel

- **WHEN** s'executa el test unitari de `checkout.vue` amb `orderConfirmed = true`
- **THEN** el DOM conté el text "Compra confirmada!" i els botons de navegació
- **THEN** el formulari de checkout no és al DOM

## Why

Un cop l'usuari ha seleccionat i reservat els seus seients al mapa, necessita una pàgina de checkout per formalitzar la compra introduint el seu nom i email. Sense aquest formulari, el flux de reserva queda incomplet i les reserves expiren sense poder-se convertir en ordres.

## What Changes

- Nova pàgina `/checkout` (CSR) al frontend Nuxt 3 que mostra el resum de seients reservats, el temporitzador actiu i un formulari de compra.
- Validació client-side del formulari: nom complet (requerit, màx 100 caràcters) i email (format RFC vàlid).
- Redirecció automàtica a `/` si l'usuari accedeix a `/checkout` sense reserves actives.
- Crida `POST /api/orders` al confirmar la compra, que crea l'ordre al backend i marca els seients com a `VENUT`.
- Gestió de la resposta del servidor: èxit mostra confirmació, error mostra missatge inline.

## Capabilities

### New Capabilities

- `checkout-form`: Pàgina de checkout amb resum de reserva, temporitzador actiu, formulari (nom + email) i lògica de confirmació de compra via `POST /api/orders`.

### Modified Capabilities

<!-- Cap especificació existent canvia de requisits funcionals -->

## Impact

- **Frontend**: Nova pàgina `frontend/pages/checkout.vue` (CSR). Llegeix l'estat de reserves des del store `reserva.ts`. Pot reutilitzar el component `TemporitzadorReserva.vue`.
- **Backend**: Mòdul `orders` — endpoint `POST /api/orders` (ja existent o pendent). L'ordre ha d'actualitzar els seients de `RESERVAT` a `VENUT` i eliminar les reserves associades.
- **Stores**: El store `reserva.ts` ha de tenir les dades necessàries (seients reservats, `session_token`).
- **Tests**: Nous tests unitaris per al component `checkout.vue` (validació de formulari, redirecció, crida a l'API) i per al servei `OrdersService` si cal.
- **Jira**: [PE-27](https://lightweight-fitness.atlassian.net/browse/PE-27)
- **Dependències**: US-04-01 (reserva de seients), US-04-03 (temporitzador de reserva).

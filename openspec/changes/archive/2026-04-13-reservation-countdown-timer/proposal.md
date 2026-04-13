## Why

Un usuari amb seients reservats no sap quant temps li queda per completar la compra. Sense un temporitzador visible, podria perdre la reserva per sorpresa quan el servidor alliberi els seients en expirar el TTL de 5 minuts. Cal un component de compte enrere clar (PE-24) que mostri el temps restant i actuï sobre la store quan s'esgoti.

## What Changes

- **Nou composable** `useTemporitzador.ts`: llegeix `expira_en` de la store `reserva`, calcula els segons restants cada segon amb `setInterval`, i crida `reserva.netejarReserves()` quan arriba a zero.
- **Nou component** `TemporitzadorReserva.vue`: mostra el compte enrere en format `mm:ss`; canvia a estil d'urgència (vermell) quan resten ≤ 60 s; mostra un missatge d'expiració quan el temps arriba a `00:00`.
- Cap canvi de backend ni de protocol Socket.IO — el temporitzador es basa únicament en el camp `expira_en` que ja retorna el servidor en `reserva:confirmada`.

## Capabilities

### New Capabilities

- `reservation-countdown-timer`: Composable i component que mostren el temps restant d'una reserva activa i gestionen l'expiració local.

### Modified Capabilities

<!-- Cap especificació existent canvia de requisits. -->

## Impact

- **Frontend** (`frontend/`): nous fitxers `composables/useTemporitzador.ts` i `components/TemporitzadorReserva.vue`.
- **Store `reserva`**: necessita exposar `expira_en` (ja existent per US-04-01) i el mètode `netejarReserves()`.
- **Ruta `/events/[slug]`**: integra `TemporitzadorReserva.vue` quan hi ha reserva activa.
- **Tests**: s'han d'afegir tests unitaris per a `useTemporitzador.ts` (vitest + fake timers) i per al component.
- Cap canvi de base de dades, API REST ni protocol WebSocket.
- Depèn de PE-23 (US-04-01) — la store `reserva` ha d'existir i exposar `expira_en`.

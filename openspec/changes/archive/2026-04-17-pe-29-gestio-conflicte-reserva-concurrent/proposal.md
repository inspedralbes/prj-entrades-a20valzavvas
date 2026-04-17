## Why

Quan el servidor retorna `reserva:rebutjada` perquè un seient ha estat agafat per un altre usuari de forma concurrent, el frontend actual no mostra cap missatge específic de conflicte. L'usuari no sap per què el seient no s'ha reservat i pot quedar desorientat, augmentant el risc d'abandonament del flux de compra.

## What Changes

- El composable `useConflicte.ts` escolta l'event privat `reserva:rebutjada { seatId, motiu }` i dispara la notificació de conflicte.
- El component `NotificacioEstat.vue` mostra un toast no bloquejant amb el text "El seient [fila][numero] acaba de ser reservat. Escull un altre seient."
- El toast desapareix automàticament als 4 segons o en clicar-lo.
- El seient conflictiu es mostra immediatament com a `RESERVAT` al mapa sense recarregar la pàgina (ja gestionat pel broadcast `seient:canvi-estat`, però el composable pot forçar l'actualització local optimista si el broadcast arriba tard).
- No es crea cap nova reserva ni s'emet cap event WS addicional des del client.

## Capabilities

### New Capabilities

- `reservation-conflict-notification`: Gestió de la UX de conflicte de reserva concurrent. El composable `useConflicte.ts` escolta `reserva:rebutjada`, llegeix les dades del seient des de la store `seients` per construir el text de la notificació, i exposa un estat reactiu de notificació que `NotificacioEstat.vue` renderitza com a toast.

### Modified Capabilities

_(cap)_

## Impact

- **Frontend — composables**: `useConflicte.ts` (nou o existent buit) — s'afegeix la lògica d'escolta i gestió de l'event `reserva:rebutjada`.
- **Frontend — components**: `NotificacioEstat.vue` — s'implementa el toast no bloquejant amb auto-dismiss i clic per tancar.
- **Frontend — stores**: `seients.ts` — lectura de la fila i número del seient per construir el text del toast; cap canvi de comportament.
- **Shared**: cap canvi.
- **Backend**: cap canvi — el backend ja emet `reserva:rebutjada` correctament (PE-29 deps: US-04-01, US-03-02).
- **Testing**: tests unitaris per a `useConflicte.ts` (mock de `$socket` i store `seients`) i per a `NotificacioEstat.vue` (renderització condicional, auto-dismiss via fake timers).
- **Jira**: [PE-29](https://lightweight-fitness.atlassian.net/browse/PE-29)

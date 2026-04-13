## Why

Per evitar l'acaparament d'entrades, cal que el servidor rebutgi qualsevol intent de reservar un seient addicional quan el `sessionToken` ja ha assolit el màxim configurat per a aquell event (`max_seients_per_usuari`). Sense aquest control, un únic usuari podria bloquejar totes les places d'un event i impedir l'accés equitatiu a la resta de compradors. Jira: PE-23.

## What Changes

- El model `Event` del backend incorpora el camp `max_seients_per_usuari: Int` (enter positiu; valor per defecte recomanat: 4).
- `SeatsService.reservar()` comprova, dins la mateixa transacció atòmica, quantes reserves actives té el `sessionToken` per a l'event en curs i rebutja la petició si s'ha assolit o superat el límit.
- Quan el límit s'assoleix, el servidor emet `reserva:rebutjada { seatId, motiu: "limit_assolit" }` al client que ha fet la petició; no es fa cap broadcast a la sala ni cap canvi a la BD.
- El store Pinia `reserva.ts` exposa un getter `limitAssolit` que el frontend pot usar per desactivar o avisar a la UI.
- Els formularis de creació/edició d'events al panell d'admin inclouen el nou camp `max_seients_per_usuari`.

## Capabilities

### New Capabilities

*(cap nova capacitat independent — la lògica s'integra dins `seat-reservation`)*

### Modified Capabilities

- `seat-reservation`: S'afegeix un nou requirement de límit per `sessionToken`: el servidor ha de comptar les reserves actives del token per a l'event i retornar `reserva:rebutjada { motiu: "limit_assolit" }` quan s'ha assolit el màxim configurat. El store `reserva.ts` ha d'exposar el getter `limitAssolit`.

## Impact

- **Backend — `seats` module**: `SeatsService.reservar()` rep lògica addicional de comprovació de límit (consulta dins `prisma.$transaction`).
- **Backend — `events` module**: Migració Prisma per afegir `max_seients_per_usuari Int @default(4)` a `Event`.
- **Backend — `admin` module**: DTOs de creació i edició d'event exposen el nou camp.
- **Frontend — store `reserva.ts`**: Nou getter `limitAssolit` (boolean) calculat a partir del nombre de seients reservats actius vs. el límit de l'event.
- **Shared — `event.types.ts`**: Afegir `maxSeientPerUsuari` al tipus `EventDto` (o equivalent).
- **Testing**: Cal test unitari a `SeatsService` per als nous escenaris de límit i test del getter `limitAssolit` al store Pinia.
- **No breaking changes** en el protocol WebSocket per als clients existents (el missatge `reserva:rebutjada` ja existeix, s'afegeix un nou valor al camp `motiu`).

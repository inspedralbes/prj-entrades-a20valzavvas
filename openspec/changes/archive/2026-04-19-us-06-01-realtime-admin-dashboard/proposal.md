## Why

L'administradora necessita supervisar en directe l'evolució de vendes d'entrades sense recarregar la pàgina, especialment durant el pic de demanda quan els comptadors canvien cada pocs segons. Jira: [PE-31](https://lightweight-fitness.atlassian.net/browse/PE-31).

## What Changes

- Nova pàgina `/admin` amb dashboard reactiu de vendes en temps real
- Nou endpoint REST `GET /api/admin/events/:id/stats` per obtenir l'estat inicial de les estadístiques
- El backend emet l'event Socket.IO `stats:actualitzacio` a la sala `event:{eventId}` en cada canvi d'estat de seient
- El frontend subscriu a `stats:actualitzacio` i actualitza els comptadors reactius sense recarregar
- Camps mostrats: seients disponibles / reservats / venuts (xifres i %), usuaris connectats, reserves actives, recaptació total

## Capabilities

### New Capabilities
- `admin-realtime-dashboard`: Dashboard reactiu a `/admin` que mostra estadístiques de vendes en temps real per event via Socket.IO `stats:actualitzacio` i `GET /api/admin/events/:id/stats`

### Modified Capabilities
- `realtime-seat-sync`: El backend ha d'emetre `stats:actualitzacio` en cada canvi d'estat de seient, a més de `seient:canvi-estat`

## Impact

- **backend/admin**: Nou endpoint `GET /api/admin/events/:id/stats` al `AdminController` i `AdminService`
- **backend/seats**: `SeatsGateway` ha d'emetre `stats:actualitzacio` en cada transacció que modifica l'estat dels seients
- **frontend/pages/admin**: Nova pàgina `admin/index.vue` (CSR, `ssr:false`) amb comptadors reactius
- **shared/types/socket.types.ts**: Nou tipus per al payload de `stats:actualitzacio`
- **Tests**: Nou unit test per a `AdminService.getEventStats()`, i per al store/composable que gestioni les estadístiques al frontend

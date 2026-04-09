## Why

Els usuaris autenticats de Sala Onirica necessiten una pàgina on veure el mapa de seients d'una projecció i l'estat visual (disponible, reservat, venut) de cada seient en carregar la pàgina. Sense aquesta pàgina i els seus components, no existeix cap punt d'entrada per al flux de reserva i compra (EP-04). Jira: [PE-19 — US-03-01](https://lightweight-fitness.atlassian.net/browse/PE-19)

## What Changes

- Nova pàgina Nuxt `/events/[slug]` (renderització client-side) que carrega les dades de l'event i els seients via `GET /api/events/:slug/seats`
- Nous components Vue: `MapaSeients.vue` (grid de files/seients), `Seient.vue` (estat visual per color), `LlegendaEstats.vue` (4 estats), `NotificacioEstat.vue` (missatges no bloquejants)
- Nova store Pinia `seients.ts` amb acció `inicialitzar(slug)` que crida l'API i emmag­atzema l'estat inicial
- Nou endpoint Laravel `GET /api/events/{slug}/seats` que retorna les dades de l'event i la llista de seients agrupats per categoria de preu
- Responsiu: scroll horitzontal en mòbil si hi ha moltes files

## Capabilities

### New Capabilities

- `seat-map-view`: Pàgina `/events/[slug]`, components `MapaSeients`, `Seient`, `LlegendaEstats`, `NotificacioEstat` i store Pinia `seients.ts`
- `seats-api`: Endpoint Laravel `GET /api/events/{slug}/seats` amb informació de l'event i llista de seients per categoria

### Modified Capabilities

<!-- Cap especificació existent canvia de requeriments en aquest US -->

## Impact

- **Frontend (`src/frontend/`)**: nova pàgina `pages/events/[slug].vue`, components a `components/`, store `stores/seients.ts`
- **Laravel (`src/backend/laravel-service/`)**: nou `EventSeatsController` i ruta `GET /api/events/{slug}/seats`; cap canvi als models ni migrations existents
- **Shared (`src/shared/`)**: es reutilitza `EstatSeient` de `seat.types.ts`; no calen nous tipus
- **No-goals**: actualitzacions en temps real (US-03-02), interacció de reserva (US-04-01), SSR del mapa

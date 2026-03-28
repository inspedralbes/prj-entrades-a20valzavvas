## Why

El Node Service (NestJS) necessita cridar el Laravel Service per executar operacions de BD (reservar seient, alliberar reserva, expirar reserves, obtenir estadístiques). Aquesta comunicació és interna a la xarxa Docker (no passa per Nginx) i és el nexe crític entre els dos serveis de backend. Sense un client centralitzat, cada mòdul implementaria les seves pròpies crides HTTP amb gestió d'errors inconsistent i configuració duplicada. ([PE-56](https://lightweight-fitness.atlassian.net/browse/PE-56))

## What Changes

- Crear `LaravelClientService` a `src/backend/node-service/src/laravel-client/` amb mètodes stub per a tots els endpoints interns (`reserveSeat`, `releaseSeat`, `expireReservations`, `getStats`)
- Configurar `HttpModule` (`@nestjs/axios`) amb `LARAVEL_INTERNAL_URL` com a base URL i timeout configurable (per defecte 5s) via `LARAVEL_HTTP_TIMEOUT`
- Afegir gestió d'errors HTTP: traduir respostes 4xx/5xx de Laravel a excepcions NestJS corresponents
- Connectar `LaravelClientModule` perquè exporti `LaravelClientService` i els mòduls Gateway i Scheduler puguin injectar-lo
- Afegir tests unitaris per a `LaravelClientService` (mapatge d'errors, configuració, health check)

### Non-goals

- Implementar els endpoints interns de Laravel (`/internal/seats/reserve`, etc.) — això pertany a US-03-02 i US-04-01
- Omplir els mètodes stub més enllà de llançar `NotImplementedException` — els mètodes es completaran a les seves US respectives
- Afegir retry logic o circuit breaker — es mantindrà simple; es pot afegir més endavant si cal

## Capabilities

### New Capabilities
- `laravel-http-client`: Servei client HTTP intern a NestJS per comunicar-se amb el backend Laravel a través de la xarxa Docker interna

### Modified Capabilities
- `node-service-scaffold`: El `LaravelClientModule` buit actual es completarà amb providers, imports (`HttpModule`) i exports (`LaravelClientService`)

## Impact

- **Mòdul afectat**: `laravel-client` (nou servei + mòdul actualitzat), `app` (sense canvi estructural — mòdul ja importat)
- **Dependències**: Utilitza `@nestjs/axios` i `axios` (ja presents al `package.json` del node-service)
- **Configuració**: Noves variables d'entorn `LARAVEL_INTERNAL_URL` i `LARAVEL_HTTP_TIMEOUT` afegides a `.env.example`
- **Testing**: Nou `laravel-client.service.spec.ts` amb Vitest cobrint mapatge d'errors, health check i configuració
- **Xarxa**: Utilitza la xarxa interna Docker — les peticions no passen mai per Nginx

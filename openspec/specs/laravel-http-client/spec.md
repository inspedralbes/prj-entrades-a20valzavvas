## Purpose

Especificació del client HTTP NestJS per comunicar-se amb el servei Laravel intern. Cobreix la configuració del mòdul, el health check, el mapatge d'errors, els mètodes stub per a endpoints futurs i la documentació de variables d'entorn.

## Requirements

### Requirement: LaravelClientService injectable i configurat

El `LaravelClientModule` SHALL registrar un `LaravelClientService` injectable per qualsevol mòdul que importi `LaravelClientModule`. El `HttpModule` subjacent SHALL estar configurat amb `LARAVEL_INTERNAL_URL` com a base URL i un timeout configurable (per defecte 5000 ms) llegit de `LARAVEL_HTTP_TIMEOUT`.

#### Scenario: Servei injectable en un mòdul consumidor

- **GIVEN** que `GatewayModule` importa `LaravelClientModule`
- **WHEN** un provider de `GatewayModule` injecta `LaravelClientService`
- **THEN** NestJS resol la dependència sense errors

#### Scenario: Base URL llegida de l'entorn

- **GIVEN** que `LARAVEL_INTERNAL_URL=http://laravel-service:8000` està definit a l'entorn
- **WHEN** `LaravelClientService` fa qualsevol petició HTTP
- **THEN** la URL de la petició comença amb `http://laravel-service:8000`

#### Scenario: Timeout per defecte a 5000 ms

- **GIVEN** que `LARAVEL_HTTP_TIMEOUT` NO està definit a l'entorn
- **WHEN** `HttpModule` s'inicialitza
- **THEN** la instància Axios té un timeout de 5000 ms

#### Scenario: Timeout configurable via entorn

- **GIVEN** que `LARAVEL_HTTP_TIMEOUT=10000` està definit a l'entorn
- **WHEN** `HttpModule` s'inicialitza
- **THEN** la instància Axios té un timeout de 10000 ms

#### Scenario: Testabilitat — servei instanciable amb Vitest

- **WHEN** s'executa `pnpm --filter node-service test`
- **THEN** el test `laravel-client.service.spec.ts` passa verificant que `LaravelClientService` es pot instanciar amb un `HttpService` mockejat

---

### Requirement: Health check via endpoint intern

El `LaravelClientService` SHALL exposar un mètode `healthCheck()` que envia `GET /api/health` al servei Laravel i retorna `true` si rep HTTP 200.

#### Scenario: Health check correcte

- **GIVEN** que el servei Laravel està operatiu i respon 200 a `GET /api/health`
- **WHEN** es crida `laravelClient.healthCheck()`
- **THEN** retorna `true`

#### Scenario: Servei Laravel no accessible

- **GIVEN** que el servei Laravel no està operatiu
- **WHEN** es crida `laravelClient.healthCheck()`
- **THEN** llança `InternalServerErrorException` amb un missatge indicant que Laravel no és accessible

#### Scenario: Health check usa xarxa Docker interna

- **GIVEN** que `LARAVEL_INTERNAL_URL=http://laravel-service:8000`
- **WHEN** `healthCheck()` envia la petició
- **THEN** la petició va a `http://laravel-service:8000/api/health` (no passa per Nginx al port 80)

#### Scenario: Testabilitat — test unitari del health check

- **WHEN** s'executa `pnpm --filter node-service test`
- **THEN** un test verifica que `healthCheck()` retorna `true` quan `HttpService.get` resol amb status 200
- **THEN** un test verifica que `healthCheck()` llança excepció quan `HttpService.get` rebutja

---

### Requirement: Mapatge d'errors HTTP a excepcions NestJS

El `LaravelClientService` SHALL interceptar respostes d'error Axios i traduir-les a subclasses de `HttpException` de NestJS perquè els mòduls consumidors rebin errors natius de NestJS consistents.

#### Scenario: Laravel retorna 400

- **GIVEN** que Laravel respon amb HTTP 400 i cos `{ "message": "Invalid input" }`
- **WHEN** la resposta és interceptada
- **THEN** es llança `BadRequestException` amb missatge `"Invalid input"`

#### Scenario: Laravel retorna 404

- **GIVEN** que Laravel respon amb HTTP 404
- **WHEN** la resposta és interceptada
- **THEN** es llança `NotFoundException`

#### Scenario: Laravel retorna 409

- **GIVEN** que Laravel respon amb HTTP 409 i cos `{ "message": "Seat already reserved" }`
- **WHEN** la resposta és interceptada
- **THEN** es llança `ConflictException` amb missatge `"Seat already reserved"`

#### Scenario: Laravel retorna 422

- **GIVEN** que Laravel respon amb HTTP 422
- **WHEN** la resposta és interceptada
- **THEN** es llança `UnprocessableEntityException`

#### Scenario: Laravel retorna 5xx

- **GIVEN** que Laravel respon amb HTTP 500
- **WHEN** la resposta és interceptada
- **THEN** es llança `InternalServerErrorException`

#### Scenario: Testabilitat — tests unitaris de mapatge d'errors

- **WHEN** s'executa `pnpm --filter node-service test`
- **THEN** els tests verifiquen que cada codi d'estat HTTP (400, 404, 409, 422, 500) es mapeja a la classe d'excepció NestJS correcta

---

### Requirement: Mètodes stub per a endpoints interns futurs

El `LaravelClientService` SHALL definir els següents mètodes amb signatures TypeScript correctes. Cada mètode SHALL llançar `NotImplementedException` fins que sigui implementat a la seva US respectiva.

- `reserveSeat(seatId: string, userId: string): Promise<any>` — POST `/internal/seats/reserve`
- `releaseSeat(seatId: string): Promise<void>` — DELETE `/internal/seats/{id}/reserve`
- `expireReservations(): Promise<any>` — POST `/internal/seats/expire`
- `getStats(eventId: string): Promise<any>` — GET `/internal/stats/{eventId}`

#### Scenario: Cridar un mètode stub llança NotImplementedException

- **WHEN** es crida `laravelClient.reserveSeat('seat-1', 'user-1')`
- **THEN** llança `NotImplementedException`

#### Scenario: Els quatre mètodes stub existeixen

- **WHEN** s'inspecciona `LaravelClientService`
- **THEN** exposa els mètodes `reserveSeat`, `releaseSeat`, `expireReservations` i `getStats`

#### Scenario: Les signatures dels mètodes stub tenen tipus

- **WHEN** s'executa la compilació TypeScript
- **THEN** els mètodes stub tenen els tipus de paràmetres i retorn correctes sense errors de compilació

#### Scenario: Testabilitat — mètodes stub llancen en tests

- **WHEN** s'executa `pnpm --filter node-service test`
- **THEN** un test verifica que cada mètode stub llança `NotImplementedException`

---

### Requirement: Variables d'entorn documentades a .env.example

El fitxer `.env.example` SHALL incloure les entrades `LARAVEL_INTERNAL_URL` i `LARAVEL_HTTP_TIMEOUT` amb valors d'exemple.

#### Scenario: LARAVEL_INTERNAL_URL present a .env.example

- **WHEN** s'inspecciona `.env.example`
- **THEN** conté `LARAVEL_INTERNAL_URL=http://laravel-service:8000`

#### Scenario: LARAVEL_HTTP_TIMEOUT present a .env.example

- **WHEN** s'inspecciona `.env.example`
- **THEN** conté `LARAVEL_HTTP_TIMEOUT=5000`

#### Scenario: Testabilitat — variables documentades

- **WHEN** un desenvolupador llegeix `.env.example`
- **THEN** pot configurar les variables d'entorn requerides sense endevinar noms ni formats

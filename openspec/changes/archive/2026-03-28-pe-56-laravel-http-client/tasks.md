## 1. Configuració i dependències

- [x] 1.1 Verificar que `@nestjs/axios` i `axios` són a les dependències de `node-service/package.json`; afegir si falten
- [x] 1.2 Afegir `LARAVEL_INTERNAL_URL=http://laravel-service:8000` i `LARAVEL_HTTP_TIMEOUT=5000` a `.env.example`

## 2. Implementació del LaravelClientService (backend)

- [x] 2.1 Crear `src/backend/node-service/src/laravel-client/laravel-client.service.ts` amb classe `@Injectable()` injectant `HttpService` i `ConfigService`
- [x] 2.2 Afegir interceptor de resposta Axios a `onModuleInit()` per mapejar errors HTTP (400→BadRequestException, 404→NotFoundException, 409→ConflictException, 422→UnprocessableEntityException, 5xx→InternalServerErrorException)
- [x] 2.3 Implementar mètode `healthCheck()` — `GET /api/health`, retorna `true` amb 200
- [x] 2.4 Afegir mètodes stub (`reserveSeat`, `releaseSeat`, `expireReservations`, `getStats`) que llancen `NotImplementedException`

## 3. Connexió del LaravelClientModule (backend)

- [x] 3.1 Actualitzar `laravel-client.module.ts` per importar `HttpModule.registerAsync()` amb `ConfigService` (llegeix `LARAVEL_INTERNAL_URL` i `LARAVEL_HTTP_TIMEOUT`)
- [x] 3.2 Registrar `LaravelClientService` com a provider i exportar-lo des del mòdul

## 4. Tests

- [x] 4.1 Crear `src/backend/node-service/src/laravel-client/laravel-client.service.spec.ts` amb Vitest
- [x] 4.2 Test: instanciació del servei amb HttpService mockejat
- [x] 4.3 Test: `healthCheck()` retorna `true` amb HTTP 200 i llança amb error
- [x] 4.4 Test: mapatge d'errors — verificar que cada status HTTP (400, 404, 409, 422, 500) es mapeja a l'excepció NestJS correcta
- [x] 4.5 Test: els quatre mètodes stub llancen `NotImplementedException`

## 5. Verificació

- [x] 5.1 Executar `pnpm --filter node-service test` — tots els tests passen
- [x] 5.2 Executar `pnpm --filter node-service build` — compilació TypeScript sense errors
- [x] 5.3 Executar `pnpm lint` — sense errors de lint

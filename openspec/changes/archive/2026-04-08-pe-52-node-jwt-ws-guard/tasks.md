## 1. Configuració de l'entorn

- [x] 1.1 Verificar que `JWT_SECRET` existeix a `.env` del node-service; si no, afegir-lo
- [x] 1.2 Afegir `JWT_SECRET=your_secret_here` a `src/backend/node-service/.env.example` (si no consta ja)

## 2. Tipatge compartit per a sockets autenticats

- [x] 2.1 Crear `src/backend/node-service/src/auth/authenticated-socket.interface.ts` amb la interfície `AuthenticatedSocket` que extén `Socket` afegint `data: { userId: string; role: string }`

## 3. Implementació del JwtWsGuard

- [x] 3.1 Crear `src/backend/node-service/src/auth/jwt-ws.guard.ts` implementant `CanActivate` per a context WS
- [x] 3.2 Extreure el token de `client.handshake.auth.token` (primary) i `client.handshake.query.token` (fallback)
- [x] 3.3 Cridar `this.jwtService.verifyAsync(token, { secret: this.configService.get('JWT_SECRET') })` dins de `try/catch`
- [x] 3.4 En cas d'èxit, assignar `client.data.userId = payload.sub` i `client.data.role = payload.role`
- [x] 3.5 En cas d'error (absent, expirat, invàlid), llançar `new WsException('Unauthorized')`

## 4. Actualització del AuthModule

- [x] 4.1 Actualitzar `src/backend/node-service/src/auth/auth.module.ts` per importar `JwtModule.registerAsync` usant `ConfigService` per llegir `JWT_SECRET`
- [x] 4.2 Afegir `JwtWsGuard` com a provider del mòdul i exportar-lo perquè altres mòduls el puguin usar

## 5. Tests unitaris del JwtWsGuard

- [x] 5.1 Crear `src/backend/node-service/src/auth/jwt-ws.guard.spec.ts` amb `Test.createTestingModule` i mock de `JwtService` i `ConfigService`
- [x] 5.2 Test: token vàlid → `canActivate` retorna `true`, `socket.data.userId` conté `sub` i `socket.data.role` conté `role` del payload
- [x] 5.3 Test: token absent (ni `auth.token` ni `query.token`) → llança `WsException('Unauthorized')`
- [x] 5.4 Test: token expirat (`jwtService.verifyAsync` llança `TokenExpiredError`) → llança `WsException('Unauthorized')`
- [x] 5.5 Test: token amb signatura invàlida (`jwtService.verifyAsync` llança `JsonWebTokenError`) → llança `WsException('Unauthorized')`

## 6. Verificació final

- [x] 6.1 Executar `pnpm --filter node-service type-check` — ha de passar sense errors
- [x] 6.2 Executar `pnpm --filter node-service test` — tots els tests nous han de passar
- [x] 6.3 Verificar que el mòdul compila correctament: `pnpm --filter node-service build`

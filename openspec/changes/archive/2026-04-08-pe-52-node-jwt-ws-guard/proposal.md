## Why

Les connexions WebSocket al Node Service accepten actualment qualsevol client sense cap validació d'identitat. Sense un WS guard que verifiqui el JWT, qualsevol usuari no autenticat podria emetre events com `seient:reservar`, comprometent la integritat del flux de reserva. PE-52 introdueix la validació de JWT al NestJS Node Service usant el `JWT_SECRET` compartit amb Laravel, sense necessitat de consultar la BD.

## What Changes

- Nou `JwtWsGuard` al mòdul `auth`: extreu i verifica el JWT del handshake Socket.IO (camp `auth.token` o query param `token`)
- Afegeix `userId` i `role` a `socket.data` per a ús posterior als gateways
- Connexions sense token vàlid o expirat reben `disconnect` amb codi `401`
- `AuthModule` configura `JwtModule` amb `JWT_SECRET` via `ConfigService`
- El gateway principal (SeatsGateway) aplica `JwtWsGuard` als events que requereixen autenticació

## Capabilities

### New Capabilities

- `node-ws-jwt-guard`: Guard NestJS per a connexions Socket.IO que valida JWT usant el secret compartit i adjunta `userId`/`role` al context del socket

### Modified Capabilities

_(cap canvi de requeriments en specs existents)_

## Impact

- **Mòdul afectat**: `auth` (node-service) — s'hi afegeix `JwtWsGuard`, `JwtModule`
- **Mòdul afectat**: `gateway` (node-service) — SeatsGateway aplicarà el guard als events autenticats
- **Dependència nova**: `@nestjs/jwt` ja present a `package.json`; s'usarà `jsonwebtoken` internament via `JwtService`
- **Variable d'entorn**: `JWT_SECRET` ha d'estar present al `.env` del node-service (ja documentat a `.env.example` per US-00-01)
- **Tests**: nous tests unitaris a `src/auth/jwt-ws.guard.spec.ts` (vitest + `@nestjs/testing`)
- **Desbloqueja**: US-03-02 (sincronització en temps real) i US-04-01 (reserva temporal de seient)
- **Jira**: PE-52

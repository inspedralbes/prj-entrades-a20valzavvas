# node-ws-jwt-guard

> JWT validation guard for Socket.IO WebSocket connections in the NestJS Node Service.

## Requirements

### Requirement: JWT validation on WebSocket handshake

The Node Service (NestJS) SHALL validate the JWT token present in the Socket.IO handshake before allowing a connection to be established. The token MUST be read from `socket.handshake.auth.token` (primary) or `socket.handshake.query.token` (fallback). Validation MUST use `JwtService` configured with the shared `JWT_SECRET` environment variable, without querying the database.

#### Scenario: Authenticated client connects successfully

- **GIVEN** a Nuxt client with a valid, non-expired JWT
- **WHEN** it connects via `io(url, { auth: { token } })`
- **THEN** the WebSocket connection is established
- **AND** `socket.data.userId` contains the `sub` claim from the JWT payload
- **AND** `socket.data.role` contains the `role` claim from the JWT payload

#### Scenario: Client without token is rejected

- **GIVEN** a client that attempts to connect without providing any token
- **WHEN** the Socket.IO handshake is received by the gateway
- **THEN** the connection is refused with a `WsException('Unauthorized')`
- **AND** the client receives a disconnect event with code `401`

#### Scenario: Client with expired JWT is rejected

- **GIVEN** a client that provides a JWT whose `exp` claim is in the past
- **WHEN** it attempts to connect to the WebSocket
- **THEN** `JwtService.verifyAsync` throws a `TokenExpiredError`
- **AND** the guard catches the error and refuses the connection with `WsException('Unauthorized')`

#### Scenario: Client with tampered JWT is rejected

- **GIVEN** a client that provides a JWT with an invalid signature (wrong secret)
- **WHEN** `JwtService.verifyAsync` is called
- **THEN** it throws a `JsonWebTokenError`
- **AND** the guard refuses the connection with `WsException('Unauthorized')`

#### Scenario: Testability — guard can be unit-tested in isolation

- **WHEN** `JwtWsGuard` is instantiated with mocked `JwtService` and `ConfigService`
- **THEN** `canActivate` can be invoked with a mock `ExecutionContext` without starting an HTTP server
- **AND** the test can assert `socket.data.userId` and `socket.data.role` are set correctly on success

### Requirement: AuthModule provides JwtModule configuration

The `AuthModule` SHALL configure and export `JwtModule` with the shared `JWT_SECRET` (read from `ConfigService`) and provide `JwtWsGuard` as an injectable guard.

#### Scenario: JWT_SECRET is read from environment variable

- **GIVEN** `JWT_SECRET` is defined in the `.env` file of node-service
- **WHEN** `AuthModule` is initialized
- **THEN** `JwtModule.registerAsync` injects `ConfigService` to read `JWT_SECRET`
- **AND** `JWT_SECRET` is never hardcoded in source code

#### Scenario: JwtWsGuard is available for injection in gateway modules

- **GIVEN** `AuthModule` is imported into `GatewayModule`
- **WHEN** a gateway applies `@UseGuards(JwtWsGuard)`
- **THEN** NestJS DI resolves `JwtWsGuard` without errors

### Requirement: Authenticated socket context available downstream

After a successful guard validation, the `userId` and `role` SHALL be available on `socket.data` for all subsequent event handlers in gateway modules that rely on user identity (e.g., `seient:reservar`).

#### Scenario: userId accessible in gateway event handler

- **GIVEN** a connected and authenticated socket
- **WHEN** the socket emits `seient:reservar`
- **THEN** the event handler can read `socket.data.userId` without type errors (TypeScript)
- **AND** the value matches the `sub` claim of the original JWT

#### Scenario: Unauthenticated event emission is blocked

- **GIVEN** a gateway with `JwtWsGuard` applied
- **WHEN** a client without a valid token attempts to emit any guarded event
- **THEN** the guard's `canActivate` returns `false` before the handler executes

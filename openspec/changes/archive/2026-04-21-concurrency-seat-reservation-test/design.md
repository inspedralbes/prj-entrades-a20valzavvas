## Context

El `SeatsGateway` utilitza un bloqueig pessimista de PostgreSQL (`SELECT FOR UPDATE` dins de `prisma.$transaction`) per garantir l'exclusió mútua quan dos clients competeixen per reservar el mateix seient. Aquesta lògica existeix en producció però mai ha estat exercitada per un test automatitzat i determinista. L'única cobertura actual és el test unitari del `SeatsGateway` que moca el `SeatsService` — verifica el cablejat del gateway, no la garantia de concurrència a nivell de BD.

El pipeline de CI (`ci.yml`) ja executa els tests de backend amb un service container de PostgreSQL 16, de manera que la infraestructura necessària per córrer un test d'integració real ja existeix.

## Goals / Non-Goals

**Goals:**
- Crear un test d'integració Vitest determinista a `backend/test/concurrencia.spec.ts` que arranqui dos clients Socket.IO reals, dispari `seient:reservar` per al mateix seient via `Promise.all`, i afirmi l'invariant d'exclusió mútua.
- Assegurar que el test s'executa contra una instància NestJS en viu amb una BD PostgreSQL real (sense mocks per a la capa de persistència).
- Integrar el test al pipeline de CI perquè un error bloquegi el merge.

**Non-Goals:**
- Canviar la lògica de producció de `SeatsGateway` o `SeatsService`.
- Testejar races de tres o més clients (cobert per escenaris de spec però no requerit per la porta de CI).
- Canvis als tests de frontend.

## Decisions

### Decisió 1: App NestJS real amb stub d'exclusió mútua en memòria

**Triat**: Arrancar una app creada amb `NestFactory` al `beforeAll` amb un `StubLaravelClient` que usa un `Set` en memòria per garantir l'exclusió mútua. El `Set.has` + `Set.add` és atòmic en el model de concurrència monofil de Node.js, de manera que el comportament és equivalent al `SELECT FOR UPDATE` de PostgreSQL per al test del gateway.

**Alternativa considerada**: Connectar-se a PostgreSQL real via `DATABASE_URL` i fer HTTP real a Laravel per provar el `SELECT FOR UPDATE` de cap a cap.

**Raonament**: `node-service` no té accés directe a PostgreSQL — tota la persistència passa per `LaravelClientService` (HTTP → Laravel → PostgreSQL). Fer un test real de cap a cap requeriria arrencar el servei Laravel complet, cosa que va fora de l'abast d'un test d'integració de gateway. La garantia `SELECT FOR UPDATE` de Laravel queda coberta pels seus propis tests (`php artisan test`). El que valida aquest test és que `SeatsGateway` gestiona correctament dues respostes concurrents i emet `reserva:confirmada` i `reserva:rebutjada` exactament una vegada cada una.

---

### Decisió 2: `socket.io-client` com a client de test

**Triat**: Importar `io` de `socket.io-client` dins del test. Afegir `socket.io-client` com a `devDependency` al workspace del backend si encara no hi és.

**Alternativa considerada**: Usar `supertest` sobre HTTP. No aplicable perquè l'invariant de concurrència viu al gateway WebSocket, no en un endpoint HTTP.

**Raonament**: El client Socket.IO és la capa de protocol correcta. El test reflecteix exactament el que fa un client de navegador.

---

### Decisió 3: `Promise.all` per a l'emissió simultània

**Triat**: Embolcallar les dues crides `client.emit('seient:reservar', ...)` i els seus listeners de resposta dins d'un `Promise.all` perquè es despatchin en el mateix tick de l'event loop.

**Raonament**: Aquesta és l'aproximació més propera a la simultaneïtat real assolible en un test Node.js d'un sol procés sense scheduling de threads a nivell de SO. El bloqueig `SELECT FOR UPDATE` de PostgreSQL garanteix la correctesa independentment de l'interleaving exacte.

---

### Decisió 4: Estratègia de neteja de BD — rollback per test

**Triat**: Després del test, eliminar la fila `Reservation` i restablir `seat.estat` a `DISPONIBLE` via `prisma.$transaction`. La BD de test és el service container de CI; l'aïllament és per execució de test, no per cas de test.

**Alternativa considerada**: Truncació `RefreshDatabase` abans de cada test.

**Raonament**: Només tenim un cas de test en aquest fitxer. Una neteja dirigida és més ràpida i evita tornar a executar les migracions Prisma.

---

### Arquitectura: Diagrama de seqüència

```mermaid
sequenceDiagram
    participant T as Test (Vitest)
    participant C1 as SocketIO Client 1
    participant C2 as SocketIO Client 2
    participant GW as SeatsGateway
    participant SV as SeatsService
    participant DB as PostgreSQL

    T->>T: beforeAll — arranca app NestJS, sembra event+seient
    T->>C1: connecta a ws://localhost:PORT
    T->>C2: connecta a ws://localhost:PORT
    C1->>GW: event:unir { eventId }
    C2->>GW: event:unir { eventId }
    par Promise.all
        C1->>GW: seient:reservar { seatId }
        C2->>GW: seient:reservar { seatId }
    end
    GW->>SV: reservar(seatId, sessionToken)
    SV->>DB: BEGIN; SELECT ... FOR UPDATE; (un guanya)
    DB-->>SV: bloqueig adquirit pel guanyador
    SV->>DB: INSERT Reservation; UPDATE seat SET estat=RESERVAT; COMMIT
    GW-->>C1: reserva:confirmada O reserva:rebutjada
    GW-->>C2: reserva:rebutjada O reserva:confirmada
    T->>T: afirma exactament una confirmada, una rebutjada
    T->>DB: SELECT count(*) FROM Reservation WHERE seatId = ?
    T->>T: afirma count = 1
    T->>T: afterAll — neteja BD, desconnecta clients, tanca app
```

## Risks / Trade-offs

| Risc | Mitigació |
|------|-----------|
| El test és sensible al timing en runners de CI lents | `Promise.all` assegura que els dos emits estan en vol; el bloqueig de PostgreSQL els serialitza de forma determinista. No calen bucles `sleep` ni reintentos. |
| Conflictes de port al CI (múltiples jobs en paral·lel) | Usar `listen(0)` (port aleatori) a `NestFactory`, recuperar el port assignat via `app.getHttpServer().address().port`. |
| Estat de migració Prisma a la BD de test | Dependre del pas CI existent que executa `prisma migrate deploy` abans de la suite de tests. |
| Desajust de versió de `socket.io-client` amb el servidor | Fixar `socket.io-client` a la mateixa versió menor que `socket.io` al `package.json` del backend. |

## Migration Plan

1. Afegir `socket.io-client` a les devDependencies de `backend/package.json` (verificar primer — pot ja existir via workspace compartit).
2. Crear `backend/test/concurrencia.spec.ts`.
3. Verificar que `vitest.config.ts` del backend inclou `test/**/*.spec.ts` al glob `include`.
4. Verificar `.github/workflows/ci.yml` per assegurar que el pas de tests de backend cobreix `concurrencia.spec.ts`.
5. Validar en local: `pnpm --filter backend test` ha d'incloure `concurrencia.spec.ts`.

## Open Questions

- El `vitest.config.ts` del backend ja inclou `test/` al glob `include`? Si no, afegir `'test/**/*.spec.ts'` a l'array `include`.
- És `socket.io-client` ja una devDependency directa o transitiva al workspace del backend? (Verificar `backend/package.json` abans d'afegir.)

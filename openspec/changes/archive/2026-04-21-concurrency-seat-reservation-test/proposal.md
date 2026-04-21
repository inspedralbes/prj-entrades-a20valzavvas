## Why

El sistema utilitza bloqueig pessimista de PostgreSQL (`SELECT FOR UPDATE`) per evitar que dos clients reservin el mateix seient, però aquesta garantia mai ha estat validada per un test automatitzat i determinista. Sense ell, l'invariant de concurrència no es pot fer complir al CI i la porta de merge no ofereix cap protecció contra regressions. Jira: PE-36.

## What Changes

- Afegir un nou fitxer de test d'integració `backend/test/concurrencia.spec.ts` amb Vitest i el client Socket.IO.
- El test arranca dos clients simultanis que emeten `seient:reservar` per al mateix seient via `Promise.all`.
- Afirmacions: exactament un `reserva:confirmada` i un `reserva:rebutjada`; la BD conté exactament una reserva per aquell seient.
- El test ha de ser determinista i executable al pipeline de CI.
- El pas de CI del test de concurrència ha de bloquejar els merges si falla.

**Non-goals**
- Cap canvi a la lògica de producció del gateway Socket.IO ni a la transacció `SELECT FOR UPDATE`.
- Cap canvi als tests de frontend.
- Cap nou endpoint d'API.

## Capabilities

### New Capabilities
- `concurrency-seat-test`: Test de concurrència Socket.IO automatitzat que verifica l'invariant d'exclusió mútua quan dos clients intenten reservar el mateix seient simultàniament.

### Modified Capabilities
- `ci-pipeline`: Afegir el pas de test de concurrència perquè `pnpm --filter backend test` inclogui `concurrencia.spec.ts` com a porta de CI i bloquegi el merge si falla.

## Impact

- **Mòdul backend**: `seats` (SeatsGateway, SeatsService) — el test exercita el gateway en viu.
- **Infraestructura de testing**: Nou fitxer Vitest a `backend/test/`; pot requerir configuració de BD de test i estratègia de rollback per transacció.
- **CI/CD**: `ci.yml` verificat per assegurar que `concurrencia.spec.ts` s'inclou al pas de tests de backend.
- **Dependències**: `socket.io-client` necessari com a devDependency al workspace del backend per al client de test.

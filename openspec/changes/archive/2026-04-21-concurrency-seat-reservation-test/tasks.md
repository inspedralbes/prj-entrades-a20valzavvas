## 1. Setup i dependències

- [x] 1.1 Verificar si `socket.io-client` ja és devDependency al `backend/package.json`; afegir-lo si no hi és
- [x] 1.2 Verificar que `vitest.config.ts` del backend inclou `test/**/*.spec.ts` al glob `include`; actualitzar si cal
- [x] 1.3 Crear el directori `backend/test/` si no existeix

## 2. Test de concurrència

- [x] 2.1 Crear `backend/test/concurrencia.spec.ts` amb `beforeAll` que arranqui l'app NestJS en un port aleatori (`listen(0)`) i executi `prisma migrate deploy`
- [x] 2.2 Afegir seed al `beforeAll`: crear un `Event` i un `Seat` amb `estat: DISPONIBLE` via `prisma.seat.create`
- [x] 2.3 Implementar els dos clients Socket.IO (`io('ws://localhost:PORT')`) i unir-los a la sala `event:{eventId}` via `event:unir`
- [x] 2.4 Disparar `seient:reservar { seatId }` via `Promise.all` des dels dos clients i recollir les respostes (`reserva:confirmada` / `reserva:rebutjada`)
- [x] 2.5 Afirmar que exactament una resposta és `reserva:confirmada` i l'altra és `reserva:rebutjada`
- [x] 2.6 Afirmar que `SELECT COUNT(*) FROM "Reservation" WHERE "seatId" = ? AND "expiresAt" > NOW()` retorna 1
- [x] 2.7 Afegir `afterAll`: eliminar la `Reservation`, restablir `seat.estat` a `DISPONIBLE`, desconnectar clients, tancar l'app

## 3. CI pipeline

- [x] 3.1 Obrir `.github/workflows/ci.yml` i verificar que el pas de tests de backend usa `pnpm --filter backend test` (no un script separat)
- [x] 3.2 Si el pas de tests de backend usa un script diferent (ex. `pnpm --filter node-service test`), actualitzar-lo perquè apunti al workspace correcte on viu `concurrencia.spec.ts`
- [x] 3.3 Confirmar que la `DATABASE_URL` s'injecta com a variable d'entorn al job de CI (ja hauria d'existir; verificar)

## 4. Verificació

- [x] 4.1 Executar `pnpm --filter backend test` en local (amb Docker Compose actiu) i confirmar que `concurrencia.spec.ts` s'executa i passa
- [x] 4.2 Executar `pnpm type-check` i confirmar que no hi ha errors de TypeScript
- [x] 4.3 Executar `pnpm lint` i confirmar que no hi ha errors d'estil
- [x] 4.4 Fer push a la branca feature i confirmar que el workflow CI executa el test de concurrència i l'estat és verd

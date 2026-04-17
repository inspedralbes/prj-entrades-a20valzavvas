## 1. Revisar codi existent

- [x] 1.1 Llegir `frontend/composables/useConflicte.ts` per identificar si ja té codi o és buit
- [x] 1.2 Llegir `frontend/components/NotificacioEstat.vue` per identificar la implementació actual i evitar regressions
- [x] 1.3 Verificar que la store `seients` exposa `getSeat(seatId)` o equivalent per obtenir fila + número del seient

## 2. Implementar useConflicte.ts

- [x] 2.1 Afegir el listener `on('reserva:rebutjada', handler)` via `useNuxtApp().$socket` dins `useConflicte.ts`
- [x] 2.2 Implementar la construcció del missatge llegint fila i número des de `useSeients().getSeat(seatId)` amb fallback a text genèric si el seient no es troba
- [x] 2.3 Implementar el ref reactiu `conflicte: Ref<{ missatge: string } | null>` i l'acció `tancarConflicte()`
- [x] 2.4 Implementar el `setTimeout` de 4000ms per auto-dismiss amb `clearTimeout` del timer anterior si n'arriba un de nou
- [x] 2.5 Afegir la crida optimista `seients.actualitzarEstat(seatId, EstatSeient.RESERVAT)` quan arriba `reserva:rebutjada`
- [x] 2.6 Netejar el listener i el timer pendent a `onUnmounted` per evitar memory leaks

## 3. Implementar NotificacioEstat.vue

- [x] 3.1 Consumir `useConflicte()` al component i vincular `conflicte` via `v-if`
- [x] 3.2 Renderitzar el missatge `conflicte.missatge` dins el toast
- [x] 3.3 Afegir el handler de clic sobre el toast que crida `tancarConflicte()`
- [x] 3.4 Aplicar estils de toast no bloquejant (posició fixa, z-index adequat, `pointer-events` per no bloquejar el mapa)

## 4. Tests — useConflicte.ts

- [x] 4.1 Crear o actualitzar `frontend/composables/useConflicte.spec.ts` amb Vitest
- [x] 4.2 Test: `reserva:rebutjada` amb seient existent → `conflicte.value.missatge` conté fila + número
- [x] 4.3 Test: `reserva:rebutjada` amb seient no trobat → `conflicte.value.missatge` és el text genèric
- [x] 4.4 Test: `tancarConflicte()` estableix `conflicte.value = null` immediatament
- [x] 4.5 Test: auto-dismiss als 4000ms via `vi.useFakeTimers()`
- [x] 4.6 Test: segon conflicte reseteja el timer i actualitza el missatge
- [x] 4.7 Test: `seients.actualitzarEstat` és cridat amb `(seatId, EstatSeient.RESERVAT)` en rebre `reserva:rebutjada`

## 5. Tests — NotificacioEstat.vue

- [x] 5.1 Crear o actualitzar `frontend/components/NotificacioEstat.spec.ts` amb Vitest + `@nuxt/test-utils`
- [x] 5.2 Test: toast visible quan `conflicte.value` no és null
- [x] 5.3 Test: toast ocult quan `conflicte.value` és null
- [x] 5.4 Test: clic sobre el toast crida `tancarConflicte()`

## 6. Verificació

- [x] 6.1 `pnpm --filter frontend type-check` sense errors
- [x] 6.2 `pnpm --filter frontend lint` sense errors
- [x] 6.3 `pnpm --filter frontend test` passa tots els tests (inclosos els nous)
- [x] 6.4 Provar manualment en local: obrir dos navegadors a la mateixa pàgina d'event, fer clic al mateix seient des del segon navegador i verificar que el toast apareix i desapareix als 4 segons

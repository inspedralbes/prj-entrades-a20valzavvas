## 1. Composable useTemporitzador

- [x] 1.1 Implementar `frontend/composables/useTemporitzador.ts`: llegir `expiraEn` de la store `reserva` i calcular `secondsLeft` amb `setInterval` cada 1 s
- [x] 1.2 Exposar `isUrgent: ComputedRef<boolean>` (true quan `secondsLeft <= 60`)
- [x] 1.3 Quan `secondsLeft === 0`, cridar `reservaStore.netejarReserva()` i aturar l'interval
- [x] 1.4 Netejar l'interval en `onUnmounted`

## 2. Tests del composable

- [x] 2.1 Crear `frontend/composables/useTemporitzador.spec.ts` amb `vi.useFakeTimers()`
- [x] 2.2 Test: `secondsLeft` decrementa correctament cada segon a partir de `expiraEn`
- [x] 2.3 Test: `isUrgent` canvia a `true` quan `secondsLeft` passa a `60`
- [x] 2.4 Test: `netejarReserva()` es crida exactament 1 vegada quan `secondsLeft === 0`
- [x] 2.5 Test: l'interval és netejat en desmontar (no ticks addicionals)

## 3. Component TemporitzadorReserva

- [x] 3.1 Implementar `frontend/components/TemporitzadorReserva.vue`: mostrar `secondsLeft` en format `mm:ss` usant `useTemporitzador`
- [x] 3.2 Aplicar classe `urgencia` (color vermell) quan `isUrgent === true`
- [x] 3.3 Mostrar missatge d'expiració (en lloc del compte enrere) quan `secondsLeft === 0`
- [x] 3.4 Amagar el component quan no hi ha reserva activa (store `reserva` buida)

## 4. Tests del component

- [x] 4.1 Crear `frontend/components/TemporitzadorReserva.spec.ts`
- [x] 4.2 Test: el component renderitza `04:50` quan `secondsLeft = 290`
- [x] 4.3 Test: la classe `urgencia` s'aplica quan `isUrgent = true`
- [x] 4.4 Test: es mostra el missatge d'expiració quan `secondsLeft = 0`

## 5. Integració a la pàgina /events/[slug]

- [x] 5.1 Afegir `<TemporitzadorReserva />` a `frontend/pages/events/[slug].vue` condicionat a reserva activa
- [x] 5.2 Verificar visualment que el temporitzador apareix i desapareix correctament en reservar i alliberar seients

## 6. Verificació CI

- [x] 6.1 Executar `pnpm --filter frontend test` i assegurar que tots els tests passen
- [x] 6.2 Executar `pnpm --filter frontend type-check` sense errors
- [x] 6.3 Executar `pnpm --filter frontend lint` sense errors
- [x] 6.4 Executar `pnpm --filter frontend build` sense errors

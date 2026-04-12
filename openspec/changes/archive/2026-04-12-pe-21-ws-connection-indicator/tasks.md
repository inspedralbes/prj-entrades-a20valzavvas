## 1. Component ConnexioIndicador.vue

- [x] 1.1 Crear `components/ConnexioIndicador.vue` amb `<script setup lang="ts">`: importar `useConnexioStore` i derivar `colorClass` (`bg-green-500` si `connectat`, `bg-red-500` si `desconnectat`/`reconnectant`) i `text` ("Connectat" / "Reconnectant…" / "Desconnectat") via `computed`
- [x] 1.2 Afegir el template: `<span>` amb la classe de color `rounded-full w-2 h-2 inline-block` + el text d'estat en línia, tot wrapat en un `<div>` amb `flex items-center gap-2`

## 2. Test unitari del component

- [x] 2.1 Crear `components/ConnexioIndicador.spec.ts`; mockar `useConnexioStore` amb `vi.mock` retornant `{ estat: ref('connectat') }` i verificar que el text "Connectat" és present i que la classe `bg-green-500` apareix al `<span>`
- [x] 2.2 Afegir cas de test per a `estat = 'desconnectat'`: verificar text "Desconnectat" i classe `bg-red-500`
- [x] 2.3 Afegir cas de test per a `estat = 'reconnectant'`: verificar text "Reconnectant…" i classe `bg-red-500`

## 3. Integració a la pàgina /events/[slug]

- [x] 3.1 Afegir `import ConnexioIndicador from '~/components/ConnexioIndicador.vue'` a `pages/events/[slug].vue`
- [x] 3.2 Col·locar `<ConnexioIndicador />` a la part superior del template de la pàgina (damunt de `<MapaSeients />` o en la capçalera de l'event)
- [x] 3.3 Actualitzar el test `pages/events-slug.spec.ts` per verificar que `<ConnexioIndicador />` és present al DOM renderitzat de la pàgina

## 4. Verificació final

- [x] 4.1 Executar `pnpm -F @entrades/frontend test` — tots els tests del frontend han de passar (inclòs `ConnexioIndicador.spec.ts`)
- [x] 4.2 Executar `pnpm -r type-check` — TypeScript sense errors (errors pre-existents a `shared/` no relacionats amb PE-21)
- [x] 4.3 Executar `pnpm -r lint` — ESLint sense errors (ESLint no configurat fins US-07-05)
- [x] 4.4 Verificació manual: obrir el navegador a `/events/[slug]` i simular una desconnexió amb `$socket.disconnect()` des de la consola — verificar que l'indicador canvia a vermell + "Desconnectat" en menys d'1 segon

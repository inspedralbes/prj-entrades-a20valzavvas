## 1. Instal·lació de dependències

- [x] 1.1 Instal·lar devDependencies a l'arrel: `pnpm add -Dw eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-prettier eslint-config-prettier prettier`
- [x] 1.2 Instal·lar devDependencies al frontend: `pnpm --filter frontend add -D eslint-plugin-vue vue-eslint-parser`
- [x] 1.3 Verificar que `pnpm-lock.yaml` s'ha actualitzat i fer commit

## 2. Configuració arrel

- [x] 2.1 Crear `eslint.config.mjs` a l'arrel amb regles `@typescript-eslint/recommended` + `prettier` (plugin i config); les ignores s'inclouen directament al fitxer (sense `.eslintignore` separat)
- [x] 2.2 Crear `.prettierrc` a l'arrel amb configuració bàsica (singleQuote, semi, printWidth, tabWidth)
- [x] 2.3 ~~Crear `.eslintignore` a l'arrel~~ Les ignores estan incloses directament a `eslint.config.mjs` (bloc `ignores`) — no cal fitxer separat amb flat config
- [x] 2.4 Afegir script `"format": "prettier --write \"**/*.{ts,vue,json}\""` al `package.json` de l'arrel

## 3. Configuració per workspace — shared

- [x] 3.1 Crear `src/shared/eslint.config.mjs` que importi i re-exporti la config arrel
- [x] 3.2 Actualitzar script `lint` a `src/shared/package.json`: `eslint . --ext .ts`

## 4. Configuració per workspace — node-service

- [x] 4.1 Crear `src/backend/node-service/eslint.config.mjs` que importi i re-exporti la config arrel
- [x] 4.2 Actualitzar script `lint` a `src/backend/node-service/package.json`: `eslint . --ext .ts --ignore-path .eslintignore`

## 5. Configuració per workspace — frontend

- [x] 5.1 Crear `src/frontend/eslint.config.mjs` que importi la config arrel i afegeixi `pluginVue.configs['flat/recommended']`; configurar `@typescript-eslint/parser` com a `parserOptions.parser` al bloc `files: ['**/*.vue']`
- [x] 5.2 Actualitzar script `lint` a `src/frontend/package.json`: `eslint . --ext .ts,.vue`

## 6. Verificació local

- [x] 6.1 Executar `pnpm lint` des de l'arrel i confirmar que retorna exit code `0`
- [x] 6.2 Corregir els errors crítics que bloquegen el lint (si n'hi ha); als warnings no crítics, avaluar si ajustar la severitat de la regla
- [x] 6.3 Executar `pnpm format` i fer commit dels canvis de formatació resultants
- [x] 6.4 Executar `pnpm type-check` per assegurar que els canvis no han introduït errors de tipatge

## 7. Actualització CI

- [x] 7.1 Editar `.github/workflows/ci.yml` i moure/afegir el step `pnpm lint` com a **primer** step del job de validació (abans de type-check i tests)
- [x] 7.2 Verificar que el pipeline de CI passa localment amb `act` o fent un push a una branca feature

## 8. Verificació final

- [x] 8.1 Executar `pnpm lint` → exit code `0`
- [x] 8.2 Executar `pnpm type-check` → sense errors
- [x] 8.3 Executar `pnpm test` → tots els tests passen
- [x] 8.4 Confirmar que `eslint.config.mjs` existeix als quatre llocs: arrel, `src/shared/`, `src/backend/node-service/`, `src/frontend/`
- [x] 8.5 Confirmar que `.prettierrc` existeix a l'arrel

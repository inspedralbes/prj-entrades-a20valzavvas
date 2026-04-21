## ADDED Requirements

### Requirement: ESLint configurat als tres workspaces del monorepo

El monorepo SHALL tenir ESLint configurat amb un fitxer `.eslintrc.cjs` a l'arrel que estableixin les regles base TypeScript + Prettier. Cada workspace (`frontend/`, `backend/node-service/`, `shared/`) SHALL tenir el seu propi `.eslintrc.cjs` que estengui la configuració arrel. L'script `pnpm lint` (executat des de l'arrel) MUST propagar als tres workspaces i retornar codi de sortida `0` quan el codi no conté errors.

#### Scenario: pnpm lint passa sense errors

- **WHEN** s'executa `pnpm lint` des de l'arrel del monorepo
- **THEN** ESLint s'executa als tres workspaces (`frontend/`, `node-service/`, `shared/`)
- **AND** el procés retorna codi de sortida `0`
- **AND** no s'imprimeix cap error ni warning crític per pantalla

#### Scenario: Error de lint atura la comanda

- **WHEN** existeix una variable no usada o un patró prohibit per ESLint en algun workspace
- **THEN** ESLint reporta l'error amb fitxer, línia i regla
- **AND** `pnpm lint` retorna codi de sortida diferent de `0`

#### Scenario: Testabilitat — els fitxers de configuració existeixen

- **WHEN** s'inspeccionà l'arrel del repositori
- **THEN** existeix un fitxer `eslint.config.mjs` a l'arrel
- **AND** existeix un fitxer `eslint.config.mjs` dins de `src/frontend/`
- **AND** existeix un fitxer `eslint.config.mjs` dins de `src/backend/node-service/`
- **AND** existeix un fitxer `eslint.config.mjs` dins de `src/shared/`

---

### Requirement: Prettier integrat com a regla d'ESLint

La configuració d'ESLint SHALL integrar Prettier via `eslint-plugin-prettier` i `eslint-config-prettier`. Les infraccions de formatació MUST ser reportades com a errors d'ESLint (no pas com a warnings).

#### Scenario: Infracció de format reportada per lint

- **WHEN** un fitxer `.ts` o `.vue` té indentació o cometes que violen la config de Prettier
- **THEN** `pnpm lint` reporta l'error amb la regla `prettier/prettier`
- **AND** el procés retorna codi de sortida diferent de `0`

#### Scenario: Fitxer ben formatat no genera errors de Prettier

- **WHEN** un fitxer respecta la configuració del `.prettierrc`
- **THEN** `pnpm lint` no reporta errors de la regla `prettier/prettier` per a aquest fitxer

#### Scenario: Testabilitat — paquets Prettier instal·lats

- **WHEN** s'inspeccionà el `package.json` de l'arrel
- **THEN** `prettier`, `eslint-plugin-prettier` i `eslint-config-prettier` apareixen a `devDependencies`

---

### Requirement: Prettier configurat per a formatació automàtica

L'arrel del monorepo SHALL tenir un fitxer `.prettierrc` que defineixin la configuració de formatació compartida. L'script `pnpm format` MUST formatar tots els fitxers `.ts`, `.vue` i `.json` del monorepo.

#### Scenario: pnpm format escriu fitxers correctament formatats

- **WHEN** s'executa `pnpm format` des de l'arrel
- **THEN** Prettier processa els fitxers `.ts`, `.vue` i `.json`
- **AND** els fitxers queden escrits amb la formatació definida al `.prettierrc`
- **AND** una execució posterior de `pnpm format` no fa canvis addicionals (idempotent)

#### Scenario: Testabilitat — .prettierrc existeix i és vàlid

- **WHEN** s'inspeccionà l'arrel del repositori
- **THEN** existeix un fitxer `.prettierrc`
- **AND** el fitxer és JSON vàlid parsejable per Prettier

---

### Requirement: Regles Vue 3 aplicades al workspace frontend

El fitxer `.eslintrc.cjs` del workspace `frontend/` SHALL incloure `eslint-plugin-vue` amb el preset `vue3-recommended`. El parser per a fitxers `.vue` MUST ser `vue-eslint-parser` amb `@typescript-eslint/parser` com a `parserOptions.parser`.

#### Scenario: Regles Vue detecten patrons incorrectes

- **WHEN** un fitxer `.vue` conté `v-for` sense `:key`
- **THEN** `pnpm --filter frontend lint` reporta l'error corresponent de `vue/require-v-for-key`

#### Scenario: Fitxers .vue del frontend s'analitzen sense errors de parser

- **WHEN** s'executa `pnpm --filter frontend lint`
- **THEN** ESLint processa tots els fitxers `.vue` del directori `frontend/` sense errors de parser
- **AND** no es reporta `Parsing error: unexpected token` en fitxers Vue

#### Scenario: Testabilitat — eslint-plugin-vue al frontend

- **WHEN** s'inspeccionà `src/frontend/package.json`
- **THEN** `eslint-plugin-vue` i `vue-eslint-parser` apareixen a `devDependencies`

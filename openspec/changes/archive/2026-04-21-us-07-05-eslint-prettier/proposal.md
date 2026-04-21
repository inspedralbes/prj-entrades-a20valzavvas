## Why

El monorepo no té cap eina de linting ni formatació configurada, cosa que provoca inconsistències de codi entre workspaces i perd temps en revisions de format. ESLint + Prettier estableixen un estàndard automàtic que el CI pot validar com a primer pas.

Relacionat amb: [PE-37](https://lightweight-fitness.atlassian.net/browse/PE-37)

## What Changes

- Afegir `eslint` i `prettier` com a dev-dependencies a l'arrel del monorepo
- Crear `.eslintrc.cjs` a l'arrel amb regles Vue 3 recommended + TypeScript recommended, Prettier integrat com a regla d'ESLint
- Crear `.prettierrc` a l'arrel amb la configuració de formatació compartida
- Afegir script `lint` (`eslint . --ext .ts,.vue`) al `package.json` de l'arrel
- Afegir script `format` (`prettier --write "**/*.{ts,vue,json}"`) al `package.json` de l'arrel
- El CI ejecuta `pnpm lint` com a primer pas del pipeline

## Capabilities

### New Capabilities

- `monorepo-lint-config`: Configuració d'ESLint i Prettier a l'arrel del monorepo, aplicable als tres workspaces (`frontend/`, `backend/`, `shared/`). Inclou scripts `pnpm lint` i `pnpm format` i les regles compartides.

### Modified Capabilities

- `ci-pipeline`: S'afegeix el pas `pnpm lint` com a primer step del workflow de CI, abans dels tests. Cap canvi als criteris d'acceptació existents però s'incorpora lint com a gate obligatori.

## Impact

- **Fitxers nous**: `.eslintrc.cjs`, `.prettierrc`, `.eslintignore` a l'arrel
- **package.json (arrel)**: nous scripts `lint` i `format`, noves dev-dependencies (`eslint`, `prettier`, `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin`, `eslint-plugin-vue`, `eslint-config-prettier`, `eslint-plugin-prettier`)
- **`.github/workflows/ci.yml`**: nou step `pnpm lint` afegit com a primer pas
- **Scope**: afecta els tres workspaces; no modifica lògica de negoci ni APIs
- **No-goals**: no s'apliquen correccions automàtiques al codi existent en aquest US (auto-fix es deixa per a l'equip)

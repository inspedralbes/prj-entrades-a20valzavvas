## MODIFIED Requirements

### Requirement: Lint i type-check passen en CI

El workflow SHALL executar lint i type-check de tots els workspaces. El pas de lint (`pnpm lint`) MUST ser el primer step de validació del workflow, executat **abans** del type-check i dels tests. Qualsevol error de lint o de tipatge MUST fer fallar el workflow.

#### Scenario: Lint passa sense errors

- **WHEN** el workflow executa `pnpm lint`
- **THEN** el pas completa amb codi de sortida 0
- **AND** no es reporta cap error d'estil de codi

#### Scenario: Type-check passa sense errors

- **WHEN** el workflow executa el type-check de frontend i backend
- **THEN** la compilació de TypeScript no retorna errors (`tsc --noEmit` o equivalent)
- **AND** el pas completa amb codi de sortida 0

#### Scenario: Error de tipus atura el pipeline

- **WHEN** existeix un error de tipatge en el codi enviat
- **THEN** el pas de type-check falla amb codi de sortida diferent de 0
- **AND** el workflow es marca com a `failure` i no continua amb els tests

#### Scenario: Lint s'executa com a primer step de validació

- **WHEN** s'inspeccionà el fitxer `.github/workflows/ci.yml`
- **THEN** el step `pnpm lint` apareix **abans** dels steps de type-check i tests en la seqüència del job
- **AND** si `pnpm lint` falla, el workflow s'atura i no executa els tests

#### Scenario: pnpm lint executa ESLint real (no stub)

- **WHEN** el workflow executa `pnpm lint`
- **THEN** ESLint s'invoca realment en els tres workspaces (no el missatge `echo 'eslint not configured yet'`)
- **AND** el workflow falla si existeix algun error d'ESLint o Prettier

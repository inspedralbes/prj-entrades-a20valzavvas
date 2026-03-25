## MODIFIED Requirements

### Requirement: Scripts globals al package.json arrel

El `package.json` arrel SHALL definir almenys els scripts `dev`, `lint`, `test` i `build`, que deleguen als workspaces corresponents, de manera que qualsevol membre de l'equip pugui operar el projecte sencer des de l'arrel sense entrar a cada directori.

#### Scenario: Script dev arrenca front i node-service en paral·lel

- **WHEN** s'executa `pnpm dev` des de l'arrel
- **THEN** el procés arrenca el servidor de Nuxt 3 (port 3000) i el servidor NestJS node-service (port 3001) simultàniament
- **NOTA**: l'entorn complet amb PostgreSQL s'arrenca via `docker compose up --build`; `pnpm dev` és per a development ràpid sense contenidors

#### Scenario: Script lint cobreix tots els workspaces

- **WHEN** s'executa `pnpm lint` des de l'arrel
- **THEN** s'executa la comprovació de lint als workspaces `frontend`, `backend` i `shared` sense saltar cap workspace

#### Scenario: Script build executa la compilació completa

- **WHEN** s'executa `pnpm build` des de l'arrel
- **THEN** s'executa `build` als tres workspaces i finalitza sense errors de compilació TypeScript

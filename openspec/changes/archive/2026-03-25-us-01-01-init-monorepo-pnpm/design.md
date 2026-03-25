## Context

El projecte Sala Onirica és un monorepo nou sense cap estructura existent. Aquesta és la primera història (US-01-01, PE-10): establir l'esquelet complet del monorepo pnpm amb tres workspaces (`src/frontend/`, `src/backend/node-service/`, `src/shared/`) i els tipus TypeScript compartits que tot el projecte reutilitzarà.

El canvi és transversal: afecta la configuració de TypeScript de frontend i backend, la gestió de dependències, els scripts de desenvolupament i el paquet `shared` que serà importat per ambdues capes.

## Goals / Non-Goals

**Goals:**

- Monorepo pnpm operatiu amb un únic `pnpm install` a l'arrel
- Três workspaces independents però interconnectats: `src/frontend/`, `src/backend/node-service/`, `src/shared/`
- Àlies TypeScript `@shared/*` resolt correctament a `frontend` i `node-service`
- Tipus base del domini definits a `src/shared/types/`: `EstatSeient`, `IEvent`, missatges Socket.IO
- Scripts globals unificats a l'arrel
- Versió de Node.js fixada per garantir consistència entre entorns locals i CI

**Non-Goals:**

- Configuració de Docker (US-01-02)
- Scaffold complet de node-service amb mòduls NestJS (US-01-05)
- Scaffold de laravel-service (US-01-06)
- Esquema BD amb Eloquent migrations Laravel (US-01-03)
- Seeds de dades (US-01-04)
- Implementació de cap servei, controlador ni component
- Tests E2E o d'integració (EP-07)
- Configuració d'ESLint/Prettier (US-07-05)

## Decisions

### D1 — Gestor de paquets: pnpm workspaces

**Decisió**: pnpm amb `pnpm-workspace.yaml` a l'arrel.

**Alternativa considerada**: npm workspaces o Nx/Turborepo.

**Raó**: pnpm és significativament més ràpid que npm en instal·lació, produeix un `node_modules` amb hard links que estalvia espai, i és l'estàndard de facto per monorepos TypeScript moderns. Nx/Turborepo afegeix complexitat innecessària per a la mida d'aquest projecte.

```yaml
# pnpm-workspace.yaml (v2.0 — backend dual)
packages:
  - "src/frontend"
  - "src/backend/node-service"   # NestJS — temps real (WebSockets, cron)
  - "src/shared"
# Nota: src/backend/laravel-service és PHP i NO s'inclou al workspace pnpm
```

### D2 — Estructura de directoris

**Decisió**: tot el codi font de l'aplicació agrupa sota `src/`. Els workspaces JS viuen a `src/frontend`, `src/backend/node-service` i `src/shared`. Laravel no és workspace pnpm.

> **v2.0 — Pivotatge:** `backend/` s'ha dividit en `backend/node-service/` (NestJS, pnpm workspace) i `backend/laravel-service/` (Laravel PHP, no workspace pnpm). Tot el codi font s'agrupa sota `src/` per separar-lo dels fitxers de configuració de l'arrel.

```
prj-entrades-a20valzavvas/
├── src/
│   ├── frontend/                  # Nuxt 3 (pnpm workspace)
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── nuxt.config.ts
│   │   └── vitest.config.ts
│   ├── backend/
│   │   ├── node-service/          # NestJS — temps real (pnpm workspace)
│   │   │   ├── package.json
│   │   │   ├── tsconfig.json
│   │   │   └── vitest.config.ts
│   │   └── laravel-service/       # Laravel PHP — BD i auth (NO pnpm workspace)
│   │       ├── composer.json
│   │       └── ...
│   └── shared/                    # Tipus compartits TS (pnpm workspace)
│       ├── package.json
│       ├── vitest.config.ts
│       └── types/
│           ├── seat.types.ts
│           ├── seat.types.spec.ts
│           ├── event.types.ts
│           ├── event.types.spec.ts
│           ├── socket.types.ts
│           ├── socket.types.spec.ts
│           ├── auth.types.ts      # NOU v2.0: User, JwtPayload
│           └── auth.types.spec.ts # NOU v2.0
├── doc/
├── openspec/
├── pnpm-workspace.yaml
├── package.json               # scripts globals
├── .nvmrc
├── .gitignore
└── README.md
```

**Alternativa considerada**: workspaces directament a l'arrel sense `src/`.

**Raó**: agrupar tot el codi font sota `src/` separa clarament el codi de l'aplicació dels fitxers de configuració del monorepo (pnpm-workspace.yaml, package.json, .nvmrc, .gitignore). Convenció habitual en monorepos de producció.

### D3 — Àlies TypeScript per a `shared`

**Decisió**: `paths` al `tsconfig.json` de cada workspace JS apuntant a `../../shared/types` (per a `src/backend/node-service`) o `../shared/types` (per a `src/frontend`). Els paths relatius entre workspaces no canvien en moure'ls a `src/` perquè continuen sent germans.

```json
// src/backend/node-service/tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@shared/*": ["../../shared/types/*"]
    }
  }
}

// src/frontend/tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@shared/*": ["../shared/types/*"]
    }
  }
}
```

**Alternativa considerada**: publicar `shared` com a paquet npm local (`workspace:*`) i importar-lo com a dependència.

**Raó**: la referència via `paths` és directa i sense etapa de build per a `shared`. Com que els tipus no es compilen separadament, la resolució per camí relatiu és més simple i ràpid durant el desenvolupament.

**Nota**: Cal afegir `shared` com a dependència del workspace als `package.json` de `src/frontend` i `src/backend/node-service` per garantir que pnpm resolgui correctament:

```json
{ "dependencies": { "shared": "workspace:*" } }
```

### D4 — Fixació de la versió de Node.js

**Decisió**: `.nvmrc` a l'arrel amb la versió LTS actual + camp `engines` al `package.json` arrel.

```
# .nvmrc
20.x
```

```json
// package.json arrel
{ "engines": { "node": ">=20.0.0" } }
```

**Raó**: garanteix que tots els membres de l'equip i el CI/CD (GitHub Actions) utilitzen la mateixa versió de Node.js. Evita errors subtils per incompatibilitat de versions.

### D5 — Tipus base del domini a `shared/types/`

**Decisió**: tres fitxers de tipus, un per domini semàntic:

```typescript
// shared/types/seat.types.ts
export enum EstatSeient {
  DISPONIBLE = "DISPONIBLE",
  RESERVAT = "RESERVAT",
  VENUT = "VENUT",
}

export interface ISeient {
  id: string;
  fila: string;
  numero: number;
  estat: EstatSeient;
  preu: number;
  categoria: string;
  colorHex: string;
}
```

```typescript
// shared/types/event.types.ts
export interface IEvent {
  id: string;
  slug: string;
  nom: string;
  data: string; // ISO date
  hora: string; // HH:MM
  recinte: string;
  imatgeUrl: string;
  totalSeients: number;
  seientsDisponibles: number;
}
```

```typescript
// shared/types/socket.types.ts
export interface SeientCanviEstatPayload {
  seatId: string;
  estat: EstatSeient;
  fila: string;
  numero: number;
}

export interface ReservaConfirmadaPayload {
  seatId: string;
  expiraEn: string; // ISO timestamp
}

export interface ReservaRebutjadaPayload {
  seatId: string;
  motiu: string;
}
```

**Raó**: separar per domini evita fitxers massius i facilita imports específics. Cada fitxer té una responsabilitat clara.

### D6 — Scripts globals

**Decisió**: scripts al `package.json` arrel que deleguen als workspaces via `--filter` o `--recursive`.

```json
{
  "scripts": {
    "dev": "pnpm --parallel -r dev",
    "lint": "pnpm -r lint",
    "test": "pnpm -r test",
    "build": "pnpm -r build",
    "type-check": "pnpm -r type-check"
  }
}
```

**Raó**: permet executar operacions globals des de l'arrel sense entrar a cada workspace. El flag `--parallel` per a `dev` arrenca frontend i backend simultàniament.

### D7 — Framework de testing: Vitest (unificat als tres workspaces)

**Decisió**: Vitest com a framework de tests per a `src/shared/`, `src/backend/node-service/` i `src/frontend/`.

**Alternativa considerada**: Jest (defecte de NestJS) per al backend i Vitest per al frontend.

**Raó**: Vitest és significativament més ràpid que Jest (aprofita el graph de mòduls de Vite), ofereix una API compatible amb Jest (migració zero-cost si calgués), i unificar el framework elimina discrepàncies de configuració entre workspaces. NestJS no requereix Jest específicament; Vitest funciona perfectament amb els decoradors de NestJS i les utilitats de `@nestjs/testing`.

```typescript
// vitest.config.ts (backend — exemple)
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: "node",
  },
});
```

```typescript
// vitest.config.ts (frontend — exemple)
import { defineVitestConfig } from "@nuxt/test-utils/config";

export default defineVitestConfig({
  test: {
    environment: "nuxt",
    globals: true,
  },
});
```

**Nota**: `vite-tsconfig-paths` és essencial per al backend per garantir que l'àlies `@shared/*` es resol correctament dins de Vitest.

### D8 — Estratègia de testing per a shared/types/

**Decisió**: tests unitaris als fitxers `*.spec.ts` co-localitzats amb els tipus, verificant valors d'enums i forma d'objectes.

**Raó**: els tipus TypeScript desapareixen en runtime. Els enums, en canvi, es compilen a objectes JavaScript i els seus valors sí que es poden verificar. Els tests de `shared/` garanteixen que cap refactor canvia accidentalment un valor d'enum que el backend i frontend esperen.

```typescript
// shared/types/seat.types.spec.ts
import { describe, it, expect } from "vitest";
import { EstatSeient } from "./seat.types";

describe("EstatSeient", () => {
  it("has the correct string values", () => {
    expect(EstatSeient.DISPONIBLE).toBe("DISPONIBLE");
    expect(EstatSeient.RESERVAT).toBe("RESERVAT");
    expect(EstatSeient.VENUT).toBe("VENUT");
  });

  it("has exactly three members", () => {
    const values = Object.values(EstatSeient);
    expect(values).toHaveLength(3);
  });
});
```

## Risks / Trade-offs

- **[Risc] Canvis a `shared/types/` trenquen frontend i backend simultàniament** → Mitigació: definir les interfícies de domini correctament des del principi i canviar-les amb pull requests que incloguin les adaptacions als dos workspaces. Els tests de `shared/types/*.spec.ts` actuen com a xarxa de seguretat.

- **[Risc] Els `paths` de TypeScript no funcionen al runtime de Node.js sense una eina de resolució** → Mitigació: NestJS utilitza `tsconfig-paths` per resoldre àliess en temps d'execució. Cal afegir-lo com a dependència del backend. Per a Vitest, s'utilitza `vite-tsconfig-paths` al `vitest.config.ts` del backend. Nuxt 3 resol els `paths` automàticament via Vite.

- **[Trade-off] `shared` sense build pròpia** → Si en el futur `shared` ha d'exportar lògica compilada (utils, validadors) i no sols tipus, caldrà afegir una etapa de build amb `tsc` o `tsup`. Per ara, els tipus purs no requereixen compilació.

- **[Trade-off] Vitest en lloc de Jest al backend** → NestJS funciona correctament amb Vitest però els exemples oficials usen Jest. La configuració és lleument diferent però l'API és compatible. La guany en velocitat i consistència justifica el canvi.

## Migration Plan

No hi ha estat previ a migrar. Tots els fitxers es creen des de zero:

1. Crear `src/` a l'arrel i l'estructura de directoris `src/frontend`, `src/backend/node-service`, `src/shared`
2. Crear `pnpm-workspace.yaml` amb paths `src/*`
3. Crear `package.json` arrel amb scripts globals i `engines`
4. Crear `.nvmrc`, `.gitignore` i `README.md`
5. Scaffold `src/shared/`: `package.json` + `types/` amb els quatre fitxers de tipus + `vitest.config.ts`
6. Scaffold `src/backend/node-service/`: `package.json` + `tsconfig.json` amb `paths` per a `@shared/*` + `vitest.config.ts` (amb `vite-tsconfig-paths`)
7. Scaffold `src/frontend/`: `package.json` + `tsconfig.json` / `nuxt.config.ts` amb `paths` per a `@shared/*` + `vitest.config.ts`
8. Executar `pnpm install` i verificar que no hi ha errors
9. Escriure tests unitaris de `src/shared/types/*.spec.ts` (enums + forma d'objectes)
10. Verificar que `pnpm test` des de l'arrel executa tots els workspaces sense errors

## Open Questions

- Cal afegir `eslint` i `prettier` en aquesta mateixa història o es farà a US-07-05? → Segons el backlog, la configuració d'ESLint/Prettier és US-07-05 (fase 6). No s'inclou aquí.
- Nuxt 3 genera el seu propi `tsconfig.json` amb `extends: "./.nuxt/tsconfig.json"`. Cal assegurar-se que el `paths` de `@shared/*` s'hereti correctament o s'afegeixi al `tsconfig.json` d'usuari de Nuxt.
- Cal configurar `@nuxt/test-utils` a la history US-01-01 o es pot diferir a la primera US de frontend que tingui components testables? → Preferiblement aquí: establir el setup de Vitest complet ara evita configuració repartida. Si `@nuxt/test-utils` requereix un entorn massa complex, es pot simplificar a Vitest pur per al frontend fins que calgui el mode `environment: 'nuxt'`.

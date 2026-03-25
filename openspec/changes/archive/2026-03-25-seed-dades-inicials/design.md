## Context

El backend és Laravel 11 (PHP 8.4) amb Eloquent i PostgreSQL. El seed s'implementa com un `DatabaseSeeder` estàndard de Laravel que utilitza `updateOrCreate` per garantir idempotència. Les migracions de US-01-03 (`events`, `price_categories`, `seats`, `users`) han d'estar aplicades prèviament.

No hi ha lògica de negoci implicada (reserva, pagament, concurrència): el seed és una operació simple de dades per a entorns de desenvolupament i testing.

## Goals / Non-Goals

**Goals:**
- Crear un estat inicial consistent i reproducible a la BD amb un únic comando
- Garantir idempotència: executar el seed N vegades produeix exactament el mateix estat
- Temps d'execució < 10 segons

**Non-Goals:**
- Seeds per a múltiples esdeveniments
- Dades de reservations o orders (les creen els tests)
- Seed per a entorns de producció
- Suport al camp `color` de `PriceCategory` (no existeix a l'esquema actual)

## Decisions

### 1. Idempotència via `updateOrCreate`

**Decisió:** Usar `Model::updateOrCreate()` d'Eloquent en comptes d'insercions directes o truncat de taules.

**Rationale:** El truncat forçaria una dependència d'ordre entre taules (FK constraints) i destruiria dades existents. `updateOrCreate` permet executar el seed en un entorn amb dades parcials sense efectes secundaris.

**Alternativa descartada:** `DB::table()->truncate()` → destrueix dades existents i requereix desactivar FK checks.

### 2. Identificació de seients per (event_id, row, number)

**Decisió:** El `updateOrCreate` dels Seats utilitza la clau composta `[event_id, row, number]` com a clau de cerca.

**Rationale:** Aquesta combinació és naturalment única per al domini (un seient és identificat per la seva fila i número dins d'un event). Evita duplicats sense dependre de l'UUID generat.

### 3. Usuaris de prova amb passwords hashejats

**Decisió:** Els usuaris admin i comprador es creen passant el password en text pla a `updateOrCreate`. El model `User` té el cast `'password' => 'hashed'` (Laravel 10+), que aplica el hash automàticament en el moment del `fill()`. Les credencials (`admin@salaonirica.cat` / `comprador@salaonirica.cat`, password: `password`) es documenten al `README` del servei.

**Rationale:** Delegar el hashing al model és més segur i consistent que cridar `Hash::make` manualment al seeder: el comportament és el mateix independentment de com s'assigni el camp (factory, seeder, controlador).

### 4. Seeders separats per entitat

**Decisió:** `DatabaseSeeder` crida seeders específics en ordre: `UserSeeder`, `EventSeeder`. `EventSeeder` s'encarrega de l'event, categories i seients.

**Rationale:** Facilita la reutilització individual de cada seeder en els tests i manté el codi organitzat.

## Risks / Trade-offs

- **Migracions no aplicades** → El seed fallarà amb error de taula inexistent. Mitigació: documentar la dependència i fer-ho explícit als criteris d'acceptació.
- **Canvi d'esquema futur** → Si s'afegeix el camp `color` a `price_categories`, el seed s'haurà d'actualitzar. Risc baix; canvi puntual.
- **Temps d'execució** → 200 insercions individuals amb `updateOrCreate` poden ser lentes. Mitigació: si supera 10s, agrupar en chunks o usar `upsert()` massiu.

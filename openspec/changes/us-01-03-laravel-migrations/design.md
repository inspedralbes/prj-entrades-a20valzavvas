## Context

El backend del projecte ha migrat de NestJS+Prisma a Laravel (PHP). L'accés a la BD és responsabilitat exclusiva del `laravel-service`. L'esquema de la BD s'ha de definir amb **Laravel Migrations** i els models s'han d'implementar amb **Eloquent ORM**.

La BD és PostgreSQL 16, accessible via Docker Compose. Les credencials s'injecten via `.env`. Totes les PKs han de ser UUID. El `session_token` que identificava compradors en versions anteriors és eliminat i substituït per `user_id` (FK a la nova taula `users`).

## Goals / Non-Goals

**Goals:**
- Definir les migrations Laravel per a totes les entitats del domini en l'ordre correcte (respectant FK constraints).
- Implementar els models Eloquent amb totes les relacions (`hasMany`, `belongsTo`, `hasManyThrough`).
- Garantir que `php artisan migrate` s'executa sense errors al contenidor `laravel-service`.
- Mantenir l'enum `SeatStatus` (DISPONIBLE, RESERVAT, VENUT) com a check constraint PostgreSQL.

**Non-Goals:**
- Seeders o dades de prova (US-01-04).
- Lògica de negoci als models (validació avançada, scopes de query, events Eloquent).
- Autenticació d'usuaris (login, tokens) — aquest US només crea l'estructura de la taula `users`.

## Decisions

### D1 — Ordre de migrations amb timestamps al nom de fitxer
**Decisió**: Cada migració té un prefix de timestamp (`YYYY_MM_DD_HHMMSS_`) que garanteix l'ordre d'aplicació.
**Alternativa considerada**: migrations sense ordre explícit i dependència de l'ordre alfabètic.
**Raó**: Laravel aplica les migrations per ordre de timestamp; és el patró estàndard i evita errors de FK en la creació de taules.

Ordre d'aplicació:
1. `users`
2. `events`
3. `price_categories` (FK → events)
4. `seats` (FK → events, price_categories)
5. `reservations` (FK → seats, users)
6. `orders` (FK → users)
7. `order_items` (FK → orders, seats)

### D2 — UUID com a PK amb `$table->uuid('id')->primary()`
**Decisió**: Totes les PKs son UUID generats per Laravel (`Str::uuid()` al model amb `static::creating()`).
**Alternativa considerada**: Auto-increment integer PKs.
**Raó**: Consistència amb la convenció del projecte; evita exposar seqüències predibles a l'API.

### D3 — `SeatStatus` com a string + check constraint
**Decisió**: La columna `estat` de `seats` és `string` amb un check constraint PostgreSQL que limita els valors a `DISPONIBLE`, `RESERVAT`, `VENUT`.
**Alternativa considerada**: Enum natiu de PostgreSQL (requereix `CREATE TYPE` separat i és difícil de modificar).
**Raó**: Més senzill de gestionar en migrations Laravel; no requereix tipus personalitzats; els valors vàlids queden documentats al check constraint.

### D4 — Relacions Eloquent explícites als models
**Decisió**: Cada model declara les relacions completes (`hasMany`, `belongsTo`, `hasManyThrough` si escau).
**Raó**: Permet fer eager loading (`Event::with(['seats', 'priceCategories'])`) sense N+1 queries, que és el criteri d'acceptació del US.

## Risks / Trade-offs

- **[Risc] FK constraint en ordre invers** → Garantit per l'ordre de timestamps. Si algú afegeix una migració manualment sense respectar l'ordre, pot fallar. Mitigació: documentar l'ordre en el comentari de cada fitxer de migració.
- **[Risc] UUID com a PK té overhead de performance** → Acceptable per al volum esperat (venda d'entrades per a esdeveniments). Mitigació: índexs addicionals sobre `slug` i `expires_at` on es consulta freqüentment.
- **[Trade-off] Check constraint vs Enum natiu PostgreSQL**: El check constraint és menys expressiu a nivell de tipus BD, però és molt més fàcil d'alterar amb noves migrations additives.
- **[Risc] `users` sense autenticació real en aquest US** → La taula existeix però cap endpoint la fa servir fins a US posteriors. No és un problema però pot generar confusió. Mitigació: documentar a la spec que l'autenticació és fora d'abast d'aquest US.

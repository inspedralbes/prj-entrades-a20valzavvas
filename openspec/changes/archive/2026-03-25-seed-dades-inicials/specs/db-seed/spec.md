## ADDED Requirements

### Requirement: Seed crea l'event Dune 4K Dolby Atmos
El sistema SHALL crear (o actualitzar si ja existeix) exactament 1 event amb slug `dune-4k-dolby-2026`, nom *"Dune: Projecció Especial 4K Dolby Atmos"*, data 2026-06-15 21:00, recinte "Sala Onirica" i `total_capacity: 200`.

> **Nota d'esquema:** Els camps `max_seats_per_user` i `published` no existeixen a la migració actual. El camp de data s'anomena `date` (no `starts_at`). El seed usa els camps reals de l'esquema.

#### Scenario: Event creat en primera execució
- **GIVEN** que les migracions estan aplicades i no existeix cap event amb slug `dune-4k-dolby-2026`
- **WHEN** s'executa `php artisan db:seed` al contenidor `laravel-service`
- **THEN** existeix exactament 1 registre a `events` amb `slug = 'dune-4k-dolby-2026'`

#### Scenario: Event no es duplica en segona execució
- **GIVEN** que el seed s'ha executat una primera vegada
- **WHEN** s'executa `php artisan db:seed` una segona vegada
- **THEN** el nombre de registres a `events` amb `slug = 'dune-4k-dolby-2026'` continua sent 1

#### Scenario: Atributs de l'event són correctes
- **GIVEN** que el seed s'ha executat
- **WHEN** es consulta `SELECT * FROM events WHERE slug = 'dune-4k-dolby-2026'`
- **THEN** `name = 'Dune: Projecció Especial 4K Dolby Atmos'`, `venue = 'Sala Onirica'`, `total_capacity = 200`, `date` correspon a 2026-06-15 21:00:00

---

### Requirement: Seed crea 2 PriceCategories
El sistema SHALL crear (o actualitzar) exactament 2 categories de preu associades a l'event: **VIP** (50,00€, files A–B) i **General** (25,00€, files C–J).

#### Scenario: Categories creades correctament
- **GIVEN** que el seed s'ha executat
- **WHEN** es consulta `SELECT name, price FROM price_categories WHERE event_id = :event_id`
- **THEN** existeixen exactament 2 registres: `{name: 'VIP', price: 50.00}` i `{name: 'General', price: 25.00}`

#### Scenario: Categories no es dupliquen
- **GIVEN** que el seed s'ha executat una primera vegada
- **WHEN** s'executa el seed una segona vegada
- **THEN** el nombre de `price_categories` associades a l'event continua sent 2

#### Scenario: No existeix camp color
- **GIVEN** que el seed s'ha executat
- **WHEN** es consulta l'estructura de `price_categories`
- **THEN** no existeix cap columna `color` a la taula (fora d'abast de l'esquema actual)

---

### Requirement: Seed crea 200 Seats
El sistema SHALL crear (o actualitzar) exactament 200 seients per a l'event: 10 files (A–J) × 20 seients (1–20), tots amb `estat = 'DISPONIBLE'`.

#### Scenario: Nombre total de seients correcte
- **GIVEN** que el seed s'ha executat
- **WHEN** es consulta `SELECT COUNT(*) FROM seats WHERE event_id = :event_id`
- **THEN** el resultat és 200

#### Scenario: Seients VIP assignats a files A i B
- **GIVEN** que el seed s'ha executat
- **WHEN** es consulta `SELECT COUNT(*) FROM seats s JOIN price_categories pc ON s.price_category_id = pc.id WHERE pc.name = 'VIP' AND s.event_id = :event_id`
- **THEN** el resultat és 40 (2 files × 20 seients)

#### Scenario: Seients General assignats a files C–J
- **GIVEN** que el seed s'ha executat
- **WHEN** es consulta `SELECT COUNT(*) FROM seats s JOIN price_categories pc ON s.price_category_id = pc.id WHERE pc.name = 'General' AND s.event_id = :event_id`
- **THEN** el resultat és 160 (8 files × 20 seients)

#### Scenario: Tots els seients estan disponibles
- **GIVEN** que el seed s'ha executat
- **WHEN** es consulta `SELECT COUNT(*) FROM seats WHERE event_id = :event_id AND estat != 'DISPONIBLE'`
- **THEN** el resultat és 0

#### Scenario: Idempotència dels seients
- **GIVEN** que el seed s'ha executat una primera vegada
- **WHEN** s'executa el seed una segona vegada
- **THEN** el nombre de seients a `seats` continua sent 200

---

### Requirement: Seed crea usuaris de prova
El sistema SHALL crear (o actualitzar) exactament 1 usuari administrador i 1 usuari comprador de prova.

#### Scenario: Usuari admin creat
- **GIVEN** que el seed s'ha executat
- **WHEN** es consulta `SELECT * FROM users WHERE email = 'admin@salaonirica.cat'`
- **THEN** existeix exactament 1 registre amb `role = 'admin'` (o camp equivalent)

#### Scenario: Usuari comprador creat
- **GIVEN** que el seed s'ha executat
- **WHEN** es consulta `SELECT * FROM users WHERE email = 'comprador@salaonirica.cat'`
- **THEN** existeix exactament 1 registre

#### Scenario: Usuaris no es dupliquen
- **GIVEN** que el seed s'ha executat una primera vegada
- **WHEN** s'executa el seed una segona vegada
- **THEN** el nombre d'usuaris a `users` amb email `admin@salaonirica.cat` o `comprador@salaonirica.cat` continua sent 2 (no es creen duplicats)

---

### Requirement: Seed és idempotent i ràpid
El sistema SHALL completar l'execució del seed en menys de 10 segons i ser segur d'executar múltiples vegades.

#### Scenario: Execució dins del temps límit
- **GIVEN** que les migracions estan aplicades i PostgreSQL és accessible
- **WHEN** s'executa `php artisan db:seed` al contenidor `laravel-service`
- **THEN** el comando finalitza amb codi de sortida 0 en menys de 10 segons

#### Scenario: Seed testable via Artisan en CI
- **GIVEN** que existeix un entorn de test amb PostgreSQL accessible
- **WHEN** s'executa `php artisan db:seed` en el context de tests
- **THEN** els models `Event`, `PriceCategory`, `Seat` i `User` retornen els comptes esperats via Eloquent (`Event::count() === 1`, `Seat::count() === 200`, etc.)

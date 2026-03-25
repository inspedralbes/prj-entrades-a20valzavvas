## Why

Durant el desenvolupament i les demos cal disposar d'un estat inicial consistent a la base de dades sense haver de crear dades manualment cada vegada. El seed és també la base dels tests automatitzats que necessiten un event real amb seients i categories de preu per executar-se de forma reproducible. Referència: [PE-13](https://lightweight-fitness.atlassian.net/browse/PE-13).

## What Changes

- Nou `DatabaseSeeder` a `backend/laravel-service/database/seeders/DatabaseSeeder.php` que crea (o upserta si ja existeix):
  - 1 Event: *"Dune: Projecció Especial 4K Dolby Atmos"*, slug `dune-4k-dolby-2026`, 15/06/2026 21:00h, recinte Sala Onirica, max 4 seients per usuari, publicat: true
  - 2 PriceCategories: VIP (50€, files A–B) i General (25€, files C–J)
  - 200 Seats (10 files × 20 seients), `estat: DISPONIBLE`
  - 1 usuari administrador de prova
  - 1 usuari comprador de prova
- El seed és idempotent: executar-lo dues vegades no duplica dades

## Capabilities

### New Capabilities

- `db-seed`: Script de seed idempotent que pobla la BD amb un event complet, categories de preu, seients i usuaris de prova per al desenvolupament i testing.

### Modified Capabilities

<!-- Cap especificació existent canvia de requisits. -->

## Impact

- **Fitxer afectat**: `backend/laravel-service/database/seeders/DatabaseSeeder.php`
- **Mòduls Laravel**: Models `Event`, `PriceCategory`, `Seat`, `User` (operacions d'upsert)
- **Dependència**: Migracions de US-01-03 han d'estar aplicades (`events`, `price_categories`, `seats`, `users`)
- **Execució**: `php artisan db:seed` al contenidor `laravel-service`
- **No hi ha canvis d'API ni de schema** — el seed és exclusivament una operació de dades
- **Tests**: La spec de `db-seed` definirà els criteris d'acceptació verificables via `php artisan db:seed` + consultes SQL

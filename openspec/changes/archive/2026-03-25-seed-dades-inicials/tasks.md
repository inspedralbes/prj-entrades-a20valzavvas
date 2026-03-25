## 1. Seeders: Usuaris

- [x] 1.1 Crear `database/seeders/UserSeeder.php` amb `updateOrCreate` per a l'usuari admin (`admin@salaonirica.cat`, role `admin`) i l'usuari comprador (`comprador@salaonirica.cat`)
- [x] 1.2 Verificar que els passwords s'emmagatzemen hashejats (`Hash::make('password')`)

## 2. Seeders: Event, Categories i Seients

- [x] 2.1 Crear `database/seeders/EventSeeder.php` que faci `updateOrCreate` de l'event `dune-4k-dolby-2026` amb tots els atributs (nom, slug, venue, max_seats_per_user, published, starts_at)
- [x] 2.2 Crear les 2 `PriceCategory` amb `updateOrCreate` (clau: `[event_id, name]`): VIP 50€ (files A–B) i General 25€ (files C–J)
- [x] 2.3 Crear els 200 `Seat` amb `updateOrCreate` (clau: `[event_id, row, number]`): files A–J, números 1–20, `estat: DISPONIBLE`, `price_category_id` assignat per fila

## 3. DatabaseSeeder: Orquestació

- [x] 3.1 Actualitzar `database/seeders/DatabaseSeeder.php` per cridar `UserSeeder` i `EventSeeder` en l'ordre correcte
- [x] 3.2 Verificar que `php artisan db:seed` s'executa sense errors al contenidor `laravel-service`
- [x] 3.3 Verificar idempotència: executar el seed dues vegades i comprovar que els comptes a BD són els mateixos (1 event, 2 categories, 200 seients, 2 usuaris)

## 4. Verificació de criteris d'acceptació

- [x] 4.1 Comprovar `Event::count() === 1` i atributs de l'event correctes
- [x] 4.2 Comprovar `PriceCategory::count() === 2` amb noms i preus correctes
- [x] 4.3 Comprovar `Seat::count() === 200` i tots amb `estat = 'DISPONIBLE'`
- [x] 4.4 Comprovar 40 seients VIP (files A–B) i 160 seients General (files C–J)
- [x] 4.5 Comprovar `User::count() === 2` (admin + comprador)
- [x] 4.6 Mesurar temps d'execució: ha de ser < 10 segons

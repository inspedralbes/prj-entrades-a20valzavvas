## 1. Migrations — Taules base (sense FK externes)

- [x] 1.1 Crear migració `users`: `id` (UUID PK), `name`, `email` (unique), `password`, `role` (string, check `IN ('comprador','admin')`), `timestamps`
- [x] 1.2 Crear migració `events`: `id` (UUID PK), `name`, `slug` (unique), `description`, `date`, `venue`, `total_capacity`, `timestamps`
- [x] 1.3 Crear migració `price_categories`: `id` (UUID PK), `event_id` (FK → events, cascade delete), `name`, `price` (decimal), `timestamps`

## 2. Migrations — Taules amb FK a events/price_categories

- [x] 2.1 Crear migració `seats`: `id` (UUID PK), `event_id` (FK → events), `price_category_id` (FK → price_categories), `row`, `number`, `estat` (string, default `DISPONIBLE`, check `IN ('DISPONIBLE','RESERVAT','VENUT')`), `timestamps`

## 3. Migrations — Taules transaccionals

- [x] 3.1 Crear migració `reservations`: `id` (UUID PK), `seat_id` (FK → seats), `user_id` (FK → users, cascade delete), `expires_at` (timestamp, indexat), `timestamps`
- [x] 3.2 Crear migració `orders`: `id` (UUID PK), `user_id` (FK → users), `total_amount` (decimal), `status` (string), `timestamps`
- [x] 3.3 Crear migració `order_items`: `id` (UUID PK), `order_id` (FK → orders, cascade delete), `seat_id` (FK → seats), `price` (decimal), `timestamps`

## 4. Models Eloquent

- [x] 4.1 Crear model `User`: `$fillable`, UUID boot (`creating`), relacions `hasMany(Reservation)`, `hasMany(Order)`
- [x] 4.2 Crear model `Event`: UUID boot, relacions `hasMany(Seat)`, `hasMany(PriceCategory)`
- [x] 4.3 Crear model `PriceCategory`: UUID boot, relació `belongsTo(Event)`, `hasMany(Seat)`
- [x] 4.4 Crear model `Seat`: UUID boot, relacions `belongsTo(Event)`, `belongsTo(PriceCategory)`, `hasMany(Reservation)`, `hasMany(OrderItem)`
- [x] 4.5 Crear model `Reservation`: UUID boot, relacions `belongsTo(Seat)`, `belongsTo(User)`
- [x] 4.6 Crear model `Order`: UUID boot, relacions `belongsTo(User)`, `hasMany(OrderItem)`
- [x] 4.7 Crear model `OrderItem`: UUID boot, relacions `belongsTo(Order)`, `belongsTo(Seat)`

## 5. Verificació de l'esquema

- [x] 5.1 Executar `php artisan migrate` al contenidor `laravel-service` i verificar que totes les taules es creen sense errors
- [x] 5.2 Verificar via `php artisan migrate:rollback` que el rollback funciona correctament
- [x] 5.3 Executar `php artisan model:show Event` i verificar que les relacions apareixen correctament

## 6. Verificació de criteris d'acceptació

- [x] 6.1 Verificar criteri 1: `php artisan migrate` executa sense errors amb `.env` correcte
- [x] 6.2 Verificar criteri 2: `Event::with(['seats', 'priceCategories'])->first()` retorna les relacions correctament
- [x] 6.3 Verificar que `seats.estat` rebutja valors invàlids (check constraint actiu)
- [x] 6.4 Verificar que `events.slug` té constraint unique (inserció duplicada falla)
- [x] 6.5 Verificar que les taules `reservations` i `orders` NO tenen columna `session_token`

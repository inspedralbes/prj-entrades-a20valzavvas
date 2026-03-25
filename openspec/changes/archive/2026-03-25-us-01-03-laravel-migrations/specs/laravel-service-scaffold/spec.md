## ADDED Requirements

### Requirement: Directoris de migrations i models presents al scaffold

El scaffold del `laravel-service` SHALL contenir els directoris `database/migrations/` i `app/Models/` amb els fitxers de migració i models Eloquent generats per US-01-03.

#### Scenario: Directoris existeixen al repositori

- **WHEN** s'inspeccioneu el repositori
- **THEN** existeix el directori `backend/laravel-service/database/migrations/` amb almenys 7 fitxers de migració (un per entitat)
- **THEN** existeix el directori `backend/laravel-service/app/Models/` amb almenys 7 fitxers de model (User, Event, PriceCategory, Seat, Reservation, Order, OrderItem)

#### Scenario: Models registrats i autocarregats per Laravel

- **GIVEN** que el servei Laravel arrenca
- **WHEN** s'executa `php artisan model:show User`
- **THEN** Laravel mostra l'estructura del model `User` sense errors de classe no trobada

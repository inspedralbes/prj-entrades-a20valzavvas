## Why

US-05-01 "Consulta d'entrades" estava dissenyada sobre un endpoint públic `GET /api/orders?email=:email` que mai es va implementar. Des d'aleshores el sistema ha incorporat autenticació completa (Sanctum tokens, login/register, `user_id` FK a `orders`), cosa que fa obsolet el disseny original i permet una solució més segura i millor per a l'usuari. Jira: PE-30.

## What Changes

- **Nou endpoint** `GET /api/orders` (auth:sanctum) que retorna totes les ordres de l'usuari autenticat amb els seus ítems, seients i dades de l'event.
- **Nova vista autenticada** `/entrades` ("Les meves entrades") que substitueix el TODO buit a `pages/entrades.vue` — llista visual de totes les compres de l'usuari.
- **Confirmació post-compra millorada** a `checkout.vue` — quan `orderConfirmed = true` s'mostra un panel visual amb el resum de la compra i un CTA cap a `/entrades`.
- **Email automàtic HTML** enviat en completar la compra, amb dades de l'ordre (event, seients, preu total), sense PDF adjunt. Implementat via Laravel `Mailable` + blade template.

## Capabilities

### New Capabilities

- `order-history`: Endpoint `GET /api/orders` (auth:sanctum) amb eager loading `orderItems → seat → event`. Retorna les ordres paginades de l'usuari autenticat.
- `ticket-list-view`: Vista `/entrades` amb llista de ticket cards en estil cinematogràfic (dark OLED, accent gold). Inclou estat buit, loading skeleton i navegació cap al detall de l'event.
- `order-confirmation-ui`: Panel de confirmació post-compra inline a `checkout.vue` quan `orderConfirmed = true`. Mostra resum de l'ordre i CTA "Veure les meves entrades".
- `order-confirmation-email`: `Mailable` Laravel `OrderConfirmationMail` + blade template HTML enviat síncronament (o via Queue) quan es crea una ordre. Inclou nom de l'usuari, event, seients i preu total.

### Modified Capabilities

- `order-confirmation`: El flux de confirmació ja existent a `checkout.vue` s'estén amb el nou panel visual. El `OrderController::store()` passa a disparar l'enviament de l'email.
- `checkout-form`: Petita extensió per renderitzar el nou panel de confirmació en lloc del comportament actual post-submit.

## Impact

- **Backend** (Laravel): `OrderController` (nou mètode `index`, extensió de `store`), nou `OrderConfirmationMail` Mailable, nou blade template `resources/views/emails/order-confirmation.blade.php`, actualització de `routes/api.php`.
- **Frontend** (Nuxt 3): `pages/entrades.vue` (implementació completa), `pages/checkout.vue` (extensió panel confirmació), nou store o composable `useOrders` per a la crida autenticada.
- **Testing**: Tests de feature Laravel per a `GET /api/orders` (autenticat, paginació, ordres buides), test de l'enviament de l'email (fake mail), tests unitaris Vitest pel store/composable frontend.
- **Sense breaking changes**: cap endpoint existent es modifica ni elimina.

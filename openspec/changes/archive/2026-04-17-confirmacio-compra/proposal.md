## Why

El flux de compra (EP-04) necessita el pas final que consolida permanentment les reserves: convertir els seients de RESERVAT a VENUT en una sola transacció atòmica per evitar inconsistències sota alta concurrència. Sense aquest endpoint, cap usuari pot completar una compra real. Correspon a PE-28 (US-04-07).

## What Changes

- Nou endpoint `POST /api/orders` al mòdul `orders` que, en una sola transacció Prisma:
  1. Valida que totes les reserves del `session_token` encara estiguin actives.
  2. Actualitza els seients a `VENUT` (`UPDATE seats SET estat = VENUT`).
  3. Crea el registre `Order` i els `OrderItem` corresponents.
  4. Elimina les reserves (`DELETE reservations`).
  5. Retorna `201 { order_id, seients[], total }`.
- Si algun seient ha expirat durant el checkout → `409 { seients_expirats[] }` sense crear cap `Order`.
- Broadcast via Socket.IO a la sala `event:{eventId}`: `seient:canvi-estat { estat: VENUT }` per a cada seient venut.
- Nou event Socket.IO privat `compra:completada` enviat al client comprador.

## Capabilities

### New Capabilities

- `order-confirmation`: Endpoint `POST /api/orders` que executa la compra en una transacció atòmica, crea l'ordre, marca seients com VENUT i fa broadcast en temps real.

### Modified Capabilities

- `checkout-form`: Afegir la crida al nou endpoint `POST /api/orders` i gestionar les respostes 201 i 409 (seients expirats).

## Impact

- **Backend — orders module**: Nou mètode `OrdersService.confirmOrder()` amb `prisma.$transaction` i pessimistic lock (`SELECT FOR UPDATE`). Nou endpoint `POST /api/orders` a `OrdersController`.
- **Backend — seats/SeatsGateway**: Reutilitzar el broadcast existent de `seient:canvi-estat` per emetre l'estat VENUT.
- **Frontend — checkout page** (`/checkout`): Cridar `POST /api/orders` en submit, gestionar 201 (redirigir a `/entrades`) i 409 (mostrar seients expirats a l'usuari).
- **Frontend — connexio store / socket**: Escoltar l'event privat `compra:completada`.
- **Tests**: Nous tests unitaris per a `OrdersService.confirmOrder()` cobrind el cas happy path i el 409.
- **No breaking changes** per a altres mòduls existents.

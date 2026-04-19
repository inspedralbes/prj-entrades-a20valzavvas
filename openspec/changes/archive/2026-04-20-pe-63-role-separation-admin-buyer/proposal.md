## Why

El sistema permet que un usuari amb rol `admin` arribi al flux de reserva i checkout sense cap bloqueig actiu: `POST /api/orders` i `POST /api/seats/{id}/reserve` no comproven el rol, i el frontend no oculta les CTAs de compra per a admins. Això pot provocar que un admin bloquegi seients temporalment o creï ordres involuntàries, comprometent la integritat del flux de compra. PE-63 (US-00-07) formalitza la separació estricta entre el rol `admin` (gestió i monitorització) i el rol `comprador` (reserva i compra).

## What Changes

- **Backend**: `POST /api/orders` retorna `403 Forbidden` si `user.role === 'admin'`, amb missatge explícit.
- **Backend**: `POST /api/seats/{seatId}/reserve` retorna `403 Forbidden` si `user.role === 'admin'` — un admin no pot bloquejar seients.
- **Frontend — checkout**: la pàgina `/checkout` afegeix un guard de rol que redirigeix l'admin a `/admin` si intenta accedir-hi.
- **Frontend — mapa de seients**: la vista `/events/[slug]` entra en mode lectura per a admins: el mapa es renderitza amb disponibilitat en temps real però sense CTAs de reserva ni botó de compra.
- **UI/UX**: revisió de consistència visual (espaiat, tipografia, jerarquia) al dashboard admin, a `/events/[slug]` i als elements condicionats per rol.
- **Docs**: comentaris inline als fitxers de rutes i middleware per deixar explícita la política.

## Capabilities

### New Capabilities

- `buyer-role-guard`: Protecció de backend per garantir que `POST /api/orders` i `POST /api/seats/{seatId}/reserve` retornen `403 Forbidden` quan l'usuari autenticat té `role = 'admin'`, amb el missatge `"El rol admin no pot realitzar compres"`. Inclou tests de feature per als dos endpoints.

### Modified Capabilities

- `seat-map-view`: Afegir mode lectura per a admins a `/events/[slug]`. L'admin veu el mapa i la disponibilitat en temps real, però les accions de reserva (clic en seient, CTA "Reservar") queden deshabilitades i ocultes. L'indicador de connexió WS es manté visible.
- `checkout-form`: Afegir guard de rol al frontend: si l'usuari autenticat té `role = 'admin'`, la pàgina `/checkout` ha de redirigir a `/admin` sense renderitzar el formulari.

## Impact

- **Backend** (`OrderController.php`): afegir verificació de rol a `store()`.
- **Backend** (`SeatReservationController.php`): afegir verificació de rol a `store()`.
- **Frontend** (`pages/checkout.vue`): guard de rol en `definePageMeta` o `onMounted`.
- **Frontend** (`pages/events/[slug].vue`): prop/computed `esAdmin` per condicionar CTAs i interacció amb `MapaSeients.vue`.
- **Frontend** (`components/MapaSeients.vue`): prop `readOnly` o equivalent per deshabilitar clics quan l'admin visualitza.
- **Tests**: nous tests de feature a `OrderControllerTest.php` i `SeatReservationControllerTest.php`; nous tests unitaris a `checkout.spec.ts` i a la pàgina `events/[slug].spec.ts`.
- **Jira**: [PE-63](https://lightweight-fitness.atlassian.net/browse/PE-63)

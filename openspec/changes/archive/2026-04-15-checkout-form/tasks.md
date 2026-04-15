## 1. Backend — Endpoint GET /api/seats

- [x] 1.1 Crear `app/Http/Controllers/SeatController.php` amb el mètode `indexByIds` que retorna detalls dels seients per array d'IDs (fila, numero, categoria, preu)
- [x] 1.2 Afegir ruta `GET /api/seats` al grup `auth:sanctum` a `routes/api.php`
- [x] 1.3 Escriure test de feature `SeatControllerTest` que cobreixi: consulta amb IDs vàlids (HTTP 200), IDs inexistents (array buit/parcial), i accés no autenticat (HTTP 401)

## 2. Backend — Endpoint POST /api/orders

- [x] 2.1 Crear `app/Http/Requests/StoreOrderRequest.php` amb validació de `nom` (requerit, màx 100 chars) i `email` (requerit, email vàlid RFC)
- [x] 2.2 Crear `app/Http/Controllers/OrderController.php` amb el mètode `store` que: comprova reserves actives de l'usuari (retorna 409 si no n'hi ha), i dins d'un `DB::transaction` crea `Order` + `OrderItem`s, actualitza `Seat.status` a `VENUT` i elimina les `Reservation`s
- [x] 2.3 Afegir ruta `POST /api/orders` al grup `auth:sanctum` a `routes/api.php`
- [x] 2.4 Escriure test de feature `OrderControllerTest` que cobreixi: compra completada (HTTP 201, Order+OrderItems creats, Seats VENUT, Reservations eliminades), sense reserves actives (HTTP 409), validació email invàlid (HTTP 422), validació nom buit (HTTP 422), accés no autenticat (HTTP 401)

## 3. Frontend — Pàgina /checkout

- [x] 3.1 Implementar la lògica de redirecció a `/` a `checkout.vue`: en `onMounted`, si `reservaStore.teReservaActiva === false`, invocar `navigateTo('/')`
- [x] 3.2 Implementar la càrrega de detalls de seients: cridar `GET /api/seats?ids[]=...` amb els `seatIds` del store `reserva`, emmagatzemar el resultat en un ref local
- [x] 3.3 Implementar la taula de resum de seients (fila, número, categoria, preu unitari) i el preu total calculat
- [x] 3.4 Integrar el component `TemporitzadorReserva` per mostrar el compte enrere actiu
- [x] 3.5 Implementar el formulari reactiu amb els camps `nom` (requerit, màx 100 chars) i `email` (format RFC), amb `ref` per a valors i errors, i errors inline per camp
- [x] 3.6 Implementar la validació client-side al handler del botó "Confirmar compra": verificar nom i email abans d'enviar cap petició
- [x] 3.7 Implementar la crida `POST /api/orders` amb `{nom, email}` i gestió de resposta: èxit → `reservaStore.netejarReserva()` + missatge confirmació; error → mostrar missatge d'error inline

## 4. Frontend — Tests unitaris de checkout.vue

- [x] 4.1 Escriure `checkout.spec.ts` amb el test: redirecció automàtica quan `teReservaActiva = false` (verificar que `navigateTo('/')` és invocat)
- [x] 4.2 Escriure test: error inline "Introdueix un email vàlid" quan l'email és invàlid i no s'invoca `$fetch`
- [x] 4.3 Escriure test: error inline quan el nom és buit i no s'invoca `$fetch`
- [x] 4.4 Escriure test: submit correcte invoca `$fetch` amb `POST /api/orders` i, en rebre 201, invoca `reservaStore.netejarReserva()`
- [x] 4.5 Escriure test: error del servidor en `POST /api/orders` mostra missatge d'error i no neteja el store

## 5. Verificació i CI

- [x] 5.1 Executar `php artisan test` (backend) i verificar que tots els tests passen
- [x] 5.2 Executar `./vendor/bin/pint` (PHP linter) i corregir qualsevol error de format
- [x] 5.3 Executar `pnpm --filter frontend test` i verificar que tots els tests passen
- [x] 5.4 Executar `pnpm --filter frontend type-check` i verificar que no hi ha errors TypeScript
- [x] 5.5 Executar `pnpm --filter frontend lint` i corregir qualsevol error
- [x] 5.6 Verificar el flux complet manualment: reservar seients → anar a `/checkout` → confirmar compra → comprovar que els seients estan marcats com a `VENUT` a la BD

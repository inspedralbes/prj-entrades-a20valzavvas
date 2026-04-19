# Capability: Checkout Form

## Purpose

Gestió del flux de compra de seients reservats. Inclou la pàgina `/checkout` amb validació client-side, la creació d'ordres al backend i la neteja de l'estat al frontend un cop completada la compra.

---

## Requirements

### Requirement: Redirecció automàtica sense reserves actives
El sistema SHALL redirigir l'usuari a `/` quan accedeix a `/checkout` sense tenir reserves actives al store `reserva`.

#### Scenario: Accés directe sense reserves
- **GIVEN** que el store `reserva` té `teReservaActiva = false`
- **WHEN** l'usuari (Comprador) navega a `/checkout`
- **THEN** el sistema redirigeix automàticament a `/` (HTTP 302 / `navigateTo('/')`)

#### Scenario: Reserves expirades abans de carregar el checkout
- **GIVEN** que les reserves de l'usuari han expirat i el cron scheduler les ha eliminat
- **WHEN** l'usuari navega a `/checkout`
- **THEN** el sistema redirigeix a `/` perquè `teReservaActiva` és fals

#### Scenario: Testabilitat — redirecció sense reserves
- **WHEN** es munta el component `checkout.vue` amb el store `reserva` buit (mock)
- **THEN** s'invoca `navigateTo('/')` i el component no renderitza el formulari

---

### Requirement: Resum de seients reservats
La pàgina `/checkout` SHALL mostrar un resum de tots els seients reservats amb fila, número, categoria i preu unitari, a més del preu total.

#### Scenario: Visualització del resum
- **GIVEN** que l'usuari (Comprador) té N seients reservats al store `reserva`
- **WHEN** es carrega la pàgina `/checkout`
- **THEN** el sistema crida `GET /api/seats?ids[]=...` i mostra una taula amb fila, número, categoria i preu per cada seient, i el total és la suma de tots els preus

#### Scenario: Temporitzador actiu visible
- **GIVEN** que l'usuari té reserves actives amb `expiraEn` al store
- **WHEN** es mostra la pàgina `/checkout`
- **THEN** el component `TemporitzadorReserva` és visible i mostra el compte enrere fins a l'expiració

#### Scenario: Testabilitat — resum de seients
- **WHEN** es munta `checkout.vue` amb mock del `$fetch` que retorna detalls de 2 seients
- **THEN** la taula renderitza 2 files i el total és la suma dels dos preus

---

### Requirement: Formulari de compra amb validació client-side
La pàgina `/checkout` SHALL mostrar un formulari amb els camps nom complet (requerit, màx 100 caràcters) i email (format RFC vàlid). La validació SHALL executar-se al client abans d'enviar cap petició al servidor.

#### Scenario: Enviament amb email invàlid
- **GIVEN** que el camp email conté `"no-es-un-email"`
- **WHEN** l'usuari (Comprador) prem "Confirmar compra"
- **THEN** es mostra l'error inline "Introdueix un email vàlid" i no s'envia cap petició `POST /api/orders`

#### Scenario: Enviament amb nom buit
- **GIVEN** que el camp nom complet està buit
- **WHEN** l'usuari prem "Confirmar compra"
- **THEN** es mostra l'error inline "El nom complet és obligatori" i no s'envia cap petició

#### Scenario: Nom supera 100 caràcters
- **GIVEN** que el camp nom conté 101 caràcters
- **WHEN** l'usuari prem "Confirmar compra"
- **THEN** es mostra l'error inline "El nom no pot superar els 100 caràcters" i no s'envia cap petició

#### Scenario: Tots els camps vàlids — petició enviada
- **GIVEN** que nom i email són vàlids
- **WHEN** l'usuari prem "Confirmar compra"
- **THEN** el sistema envia `POST /api/orders` amb `{nom, email}` i el token Sanctum a la capçalera

#### Scenario: Testabilitat — validació email invàlid
- **WHEN** s'executa el handler de submit del formulari amb email `"invalidemail"` via test unitari
- **THEN** el camp d'error per a email té valor `"Introdueix un email vàlid"` i `$fetch` no és invocat

---

### Requirement: Creació d'ordre al backend (POST /api/orders)
El sistema SHALL exposar l'endpoint `POST /api/orders` (autenticat via Sanctum) que accepta `{ nom, email, seat_ids?: string[] }`, crea una ordre amb tots els seients reservats de l'usuari, els marca com a `VENUT` i elimina les reserves, tot dins d'una transacció de base de dades. Si `seat_ids` s'envia i algun dels UUIDs no té reserva activa, el sistema SHALL retornar `409 { seients_expirats: string[] }` sense crear cap ordre.

#### Scenario: Compra completada amb èxit
- **GIVEN** que l'usuari autenticat té N reserves actives no expirades
- **WHEN** envia `POST /api/orders` amb `{ nom: "Joan", email: "joan@ex.com", seat_ids: [uuid1, uuid2] }`
- **THEN** el sistema retorna HTTP 201 amb `{ id, total_amount, items }`
- **THEN** crea un `Order` + N `OrderItem`s, actualitza cada `Seat.estat` a `VENUT`, i elimina les N `Reservation`s

#### Scenario: Seient expirat durant el checkout
- **GIVEN** que `seat_ids` conté un UUID la reserva del qual ha estat eliminada pel cron
- **WHEN** envia `POST /api/orders`
- **THEN** el sistema retorna HTTP 409 amb `{ seients_expirats: [uuid_expirat] }`
- **THEN** no es crea cap `Order`

#### Scenario: Sense reserves actives al servidor
- **GIVEN** que l'usuari no té reserves actives a la base de dades
- **WHEN** envia `POST /api/orders`
- **THEN** el sistema retorna HTTP 409 amb `{error: "No tens reserves actives."}`

#### Scenario: Validació email invàlid al servidor
- **GIVEN** que el cos de la petició conté `email: "no-es-un-email"`
- **WHEN** envia `POST /api/orders`
- **THEN** el sistema retorna HTTP 422 amb errors de validació per al camp `email`

#### Scenario: Validació nom buit al servidor
- **GIVEN** que el cos de la petició no conté el camp `nom`
- **WHEN** envia `POST /api/orders`
- **THEN** el sistema retorna HTTP 422 amb errors de validació per al camp `nom`

#### Scenario: Atomicitat — rollback en cas d'error
- **GIVEN** que durant la transacció es produeix un error (ex: DB constraint)
- **WHEN** s'executa `POST /api/orders`
- **THEN** cap `Order`, `OrderItem` ni canvi d'estat de `Seat` és persistit, i es retorna HTTP 500

#### Scenario: Accés no autenticat
- **GIVEN** que la petició no inclou cap token Sanctum vàlid
- **WHEN** s'envia `POST /api/orders`
- **THEN** el sistema retorna HTTP 401

#### Scenario: Testabilitat — creació d'ordre
- **WHEN** s'executa el test de feature `OrderControllerTest::test_store_creates_order`
- **THEN** la DB té 1 `Order`, N `OrderItem`s, els `Seat`s estan en estat `VENUT` i les `Reservation`s han estat eliminades

---

### Requirement: Consulta de detalls de seients per ID (GET /api/seats)
El sistema SHALL exposar l'endpoint `GET /api/seats?ids[]=...` (autenticat via Sanctum) que retorna els detalls (fila, número, categoria, preu) dels seients pels IDs indicats.

#### Scenario: Consulta de múltiples seients vàlids
- **GIVEN** que l'usuari autenticat sol·licita detalls de 3 `seatId`s vàlids
- **WHEN** envia `GET /api/seats?ids[]=uuid1&ids[]=uuid2&ids[]=uuid3`
- **THEN** el sistema retorna HTTP 200 amb un array de 3 objectes `{id, fila, numero, categoria, preu}`

#### Scenario: IDs inexistents
- **GIVEN** que alguns dels `seatId`s no existeixen a la base de dades
- **WHEN** envia `GET /api/seats?ids[]=inexistent`
- **THEN** el sistema retorna HTTP 200 amb un array buit o només els que existeixen

#### Scenario: Accés no autenticat
- **GIVEN** que la petició no inclou cap token Sanctum vàlid
- **WHEN** s'envia `GET /api/seats?ids[]=...`
- **THEN** el sistema retorna HTTP 401

#### Scenario: Testabilitat
- **WHEN** s'executa el test de feature `SeatControllerTest::test_index_by_ids`
- **THEN** retorna els camps `id`, `fila`, `numero`, `categoria` i `preu` per cada seient sol·licitat

---

### Requirement: Confirmació i neteja de l'estat al frontend
Després d'una compra completada amb èxit, el sistema SHALL netejar l'estat de reserves al store `reserva` i mostrar un missatge de confirmació a l'usuari.

#### Scenario: Compra completada — neteja de l'estat
- **GIVEN** que `POST /api/orders` retorna HTTP 201
- **WHEN** el frontend processa la resposta
- **THEN** s'invoca `reservaStore.netejarReserva()` i el store `reserva.seients` queda buit

#### Scenario: Error del servidor durant la compra
- **GIVEN** que `POST /api/orders` retorna un error HTTP (4xx o 5xx)
- **WHEN** el frontend processa la resposta d'error
- **THEN** es mostra un missatge d'error a l'usuari i el formulari roman visible (no es neteja l'estat)

#### Scenario: Testabilitat — neteja post-compra
- **WHEN** el mock de `$fetch` per a `POST /api/orders` retorna 201
- **THEN** `reservaStore.netejarReserva` ha estat invocat i `teReservaActiva` és fals

---

### Requirement: Formulari de checkout envia la comanda al backend

El sistema SHALL permetre al Comprador autenticat enviar el formulari de checkout per completar la compra dels seients reservats. Quan `POST /api/orders` retorna `201`, el sistema SHALL substituir el formulari pel panel de confirmació (`order-confirmation-ui`) en lloc de mostrar un missatge inline mínim.

#### Scenario: Compra exitosa mostra panel de confirmació (modificat)

- **GIVEN** que el Comprador té reserves actives i omple el formulari de checkout
- **WHEN** `POST /api/orders` retorna `201 { id, total_amount, items }`
- **THEN** `orderConfirmed` passa a `true` i `orderId` s'actualitza amb l'id rebut
- **THEN** el formulari desapareix i es mostra el panel de confirmació amb el resum de la compra
- **THEN** el panel inclou el botó "Veure les meves entrades" que navega a `/entrades`

#### Scenario: Error de seients expirats (409) mostra missatge d'error

- **GIVEN** que algun seient ha expirat durant el checkout
- **WHEN** `POST /api/orders` retorna `409 { seients_expirats: [...] }`
- **THEN** el formulari continua visible amb un missatge d'error indicant els seients expirats
- **THEN** `orderConfirmed` roman `false`

#### Scenario: Redirecció si no hi ha reserves actives

- **GIVEN** que el Comprador accedeix a `/checkout` sense reserves actives
- **WHEN** es munta la pàgina
- **THEN** és redirigit a `/`

#### Scenario: Testabilitat — renderització del panel de confirmació

- **WHEN** s'executa el test unitari de `checkout.vue` amb `orderConfirmed = true` i dades d'ordre mocades
- **THEN** el DOM conté "Compra confirmada!" i el resum de l'ordre
- **THEN** el formulari no és al DOM

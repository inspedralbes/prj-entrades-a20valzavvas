# Spec: reservation-countdown-timer

## Purpose

Mostrar un compte enrere visible a la pàgina de detall d'esdeveniment (`/events/[slug]`) mentre l'usuari té una reserva de seients activa. El temporitzador es basa en el camp `expiraEn` retornat pel servidor i usa el composable `useTemporitzador`. Quan el temps s'esgota, la store de reserva es neteja i es notifica l'usuari.

---

## Requirements

### Requirement: Compte enrere visible basat en expiraEn del servidor

El sistema SHALL mostrar un compte enrere en format `mm:ss` a la pàgina `/events/[slug]` sempre que l'usuari tingui una reserva activa. El composable `useTemporitzador` MUST calcular els segons restants comparant `expiraEn` (de la store `reserva`) amb `Date.now()`, actualitzant-se cada segon via `setInterval`.

#### Scenario: Mostra el temps correcte 10 segons després de la reserva

- **GIVEN** la store `reserva` té `expiraEn = T+300s` (5 minuts des d'ara)
- **WHEN** passen 10 segons (via fake timer en test o real)
- **THEN** `TemporitzadorReserva.vue` mostra `04:50`
- **AND** `secondsLeft` val `290`

#### Scenario: Format mm:ss correcte per a valors inferiors a 1 minut

- **GIVEN** `secondsLeft = 45`
- **WHEN** el component renderitza el compte enrere
- **THEN** es mostra `00:45`

#### Scenario: Format mm:ss correcte per a valors superiors a 1 minut

- **GIVEN** `secondsLeft = 125`
- **WHEN** el component renderitza el compte enrere
- **THEN** es mostra `02:05`

#### Scenario: Testabilitat — useTemporitzador calcula secondsLeft correctament

- **GIVEN** `vi.useFakeTimers()` activat i `expiraEn = Date.now() + 300_000`
- **WHEN** s'invoca `useTemporitzador()` en un test Vitest i s'avança el rellotge 10 s amb `vi.advanceTimersByTime(10_000)`
- **THEN** `secondsLeft.value` és `290`

---

### Requirement: Estil d'urgència quan resten 60 s o menys

El component `TemporitzadorReserva.vue` SHALL canviar a un estil visual d'urgència (classe CSS `urgencia`, color vermell) quan `secondsLeft <= 60`. El composable MUST exposar `isUrgent: ComputedRef<boolean>` amb el llindar de 60 s.

#### Scenario: Activació de l'estil d'urgència exactament a 60 s

- **GIVEN** `secondsLeft = 61`
- **WHEN** passa 1 segon i `secondsLeft` passa a `60`
- **THEN** `isUrgent` és `true`
- **AND** el component aplica la classe `urgencia`

#### Scenario: Estil normal quan resten més de 60 s

- **GIVEN** `secondsLeft = 120`
- **WHEN** el component renderitza el compte enrere
- **THEN** `isUrgent` és `false`
- **AND** el component NO aplica la classe `urgencia`

#### Scenario: Testabilitat — isUrgent canvia de valor al llindar correcte

- **GIVEN** `vi.useFakeTimers()` i `expiraEn = Date.now() + 61_000`
- **WHEN** s'avança el rellotge 1 s (`vi.advanceTimersByTime(1_000)`)
- **THEN** `isUrgent.value` canvia de `false` a `true`

---

### Requirement: Expiració — neteja de la store i missatge a l'usuari

Quan `secondsLeft` arriba a `0`, el composable `useTemporitzador` MUST cridar `reservaStore.netejarReserva()` i aturar l'interval. El component `TemporitzadorReserva.vue` SHALL mostrar un missatge d'expiració en lloc del compte enrere quan la reserva ha expirat.

#### Scenario: Crida a netejarReserva quan el temporitzador arriba a zero

- **GIVEN** la store `reserva` té una reserva activa amb `expiraEn = T+1s`
- **WHEN** passa 1 segon i `secondsLeft` arriba a `0`
- **THEN** `reservaStore.netejarReserva()` és cridat exactament 1 vegada
- **AND** l'interval és aturat (no s'executa cap tick addicional)

#### Scenario: Missatge d'expiració visible a l'usuari

- **GIVEN** `secondsLeft` ha arribat a `0`
- **WHEN** el component renderitza
- **THEN** es mostra un missatge d'expiració visible (p. ex. "La reserva ha expirat")
- **AND** el compte enrere `mm:ss` ja no és visible

#### Scenario: Neteja de l'interval en desmontar el component

- **GIVEN** `useTemporitzador` ha registrat un `setInterval`
- **WHEN** el component és desmontat (`onUnmounted`)
- **THEN** `clearInterval` és cridat i no es produeixen ticks addicionals

#### Scenario: Testabilitat — netejarReserva és cridat en expiració

- **GIVEN** `vi.useFakeTimers()`, Pinia stubbat amb `netejarReserva` com a `vi.fn()`, i `expiraEn = Date.now() + 1_000`
- **WHEN** s'avança el rellotge 1 s amb `vi.advanceTimersByTime(1_000)`
- **THEN** `netejarReserva` ha estat cridat exactament 1 vegada

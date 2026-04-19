# Capability: Ticket List View

## Purpose

Vista autenticada `/entrades` que mostra totes les entrades comprades de l'usuari en format ticket card cinematogràfic.

---

## Requirements

### Requirement: Vista "Les meves entrades" per a usuari autenticat

El sistema SHALL mostrar a `/entrades` la llista de totes les ordres de l'usuari autenticat en format ticket card, amb informació de l'event, seients i preu total.

#### Scenario: Usuari autenticat visualitza les seves entrades

- **GIVEN** que l'usuari està loguejat i ha realitzat 2 compres
- **WHEN** navega a `/entrades`
- **THEN** veu 2 ticket cards, cadascuna amb el nom de l'event, la data, la sala, la fila i números de seient, la categoria de preu i el total
- **THEN** les cards estan ordenades de més recent a més antiga

#### Scenario: Estat de càrrega (loading skeleton)

- **GIVEN** que la crida `GET /api/orders` encara no ha respost
- **WHEN** l'usuari accedeix a `/entrades`
- **THEN** es mostra un skeleton de càrrega en lloc de les cards reals

#### Scenario: Estat buit (cap entrada)

- **GIVEN** que l'usuari autenticat no té cap compra
- **WHEN** navega a `/entrades`
- **THEN** es mostra un missatge "Cap entrada encara" amb un CTA "Descobreix els propers events" que navega a `/`

#### Scenario: Redirecció si no autenticat

- **GIVEN** que l'usuari no està loguejat
- **WHEN** intenta accedir a `/entrades`
- **THEN** és redirigit a `/auth/login` pel middleware `auth`

#### Scenario: Testabilitat — composable useOrders

- **WHEN** s'executa el test unitari del composable `useOrders` amb `$fetch` mockat
- **THEN** `orders` conté l'array retornat per la API
- **THEN** `isLoading` és `false` un cop resolta la promesa
- **THEN** `error` és `null` en cas d'èxit i conté el missatge d'error en cas de fallada

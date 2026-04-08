## ADDED Requirements

### Requirement: Botó d'eliminació amb modal de confirmació a la llista d'events admin

La pàgina `/admin/events` SHALL mostrar un botó "Eliminar" per a cada event de la llista. En fer clic, SHALL obrir un modal de confirmació que demani a l'administradora que confirmi l'acció. Si l'administradora confirma, SHALL enviar `DELETE /api/admin/events/:id` al backend. En cas de resposta `204`, SHALL eliminar l'event de la llista sense recarregar la pàgina. En cas de resposta `422`, SHALL mostrar un missatge d'error dins el modal indicant que l'event té reserves actives o compres asociades i no pot ser eliminat.

#### Scenario: Clic "Eliminar" obre el modal de confirmació

- **GIVEN** que l'administradora es troba a la pàgina `/admin/events`
- **WHEN** fa clic al botó "Eliminar" d'un event
- **THEN** s'obre un modal de confirmació amb el nom de l'event i els botons "Confirmar" i "Cancel·lar"

#### Scenario: Confirmació exitosa elimina l'event de la llista

- **GIVEN** que el modal de confirmació és obert per a un event sense reserves actives
- **WHEN** l'administradora fa clic a "Confirmar"
- **THEN** s'envia `DELETE /api/admin/events/:id` amb el token JWT a la capçalera
- **THEN** el backend retorna `204 No Content`
- **THEN** l'event desapareix de la llista sense recarregar la pàgina
- **THEN** el modal es tanca

#### Scenario: Error 422 mostra missatge dins el modal

- **GIVEN** que el modal de confirmació és obert per a un event amb reserves actives
- **WHEN** l'administradora fa clic a "Confirmar"
- **THEN** s'envia `DELETE /api/admin/events/:id`
- **THEN** el backend retorna `422 Unprocessable Entity`
- **THEN** el modal mostra un missatge d'error: "No es pot eliminar: l'event té reserves actives o compres associades"
- **THEN** l'event NO desapareix de la llista

#### Scenario: Cancel·lar tanca el modal sense acció

- **GIVEN** que el modal de confirmació és obert
- **WHEN** l'administradora fa clic a "Cancel·lar"
- **THEN** el modal es tanca
- **THEN** no s'envia cap petició al backend
- **THEN** la llista d'events no canvia

#### Scenario: Testabilitat del component modal d'eliminació

- **GIVEN** un entorn de test Vitest + @nuxt/test-utils
- **WHEN** s'executa el test de component de la pàgina `/admin/events`
- **THEN** es pot verificar que el modal s'obre en fer clic a "Eliminar", que es fa la crida DELETE en confirmar, i que es mostra l'error quan el mock retorna 422

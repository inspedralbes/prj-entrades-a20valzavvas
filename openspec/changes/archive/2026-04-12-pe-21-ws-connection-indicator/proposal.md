# Proposal — PE-21: WS Connection Indicator

**Jira:** PE-21 (US-03-03)

## Why

Un usuari a la pàgina d'un event no té cap senyal visual que indiqui si la connexió Socket.IO és activa o s'ha interromput; sense aquest indicador podria prendre decisions de compra basades en un mapa de seients obsolet. Ara que `connexio.ts` existeix (PE-20), es pot implementar el component presentacional de forma immediata.

## What Changes

- **Nou component** `components/ConnexioIndicador.vue`: mostra un punt verd/vermell i un text reactiu ("Connectat" / "Reconnectant...") llegint l'estat de `useConnexioStore`.
- Integrar `ConnexioIndicador` a la pàgina `pages/events/[slug].vue` (capçalera o zona superior del mapa).
- Escriure tests unitaris del component (`components/ConnexioIndicador.spec.ts`).

## Capabilities

### New Capabilities

- `ws-connection-indicator` — Component visual que reflecteix l'estat de connexió Socket.IO en temps real.

### Modified Capabilities

_(Cap canvi de requisits als specs existents.)_

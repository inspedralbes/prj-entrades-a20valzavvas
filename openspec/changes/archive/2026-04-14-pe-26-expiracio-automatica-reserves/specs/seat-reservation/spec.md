## MODIFIED Requirements

### Requirement: Comprador pot reservar temporalment un seient disponible

El sistema SHALL permetre a un Comprador autenticat (JWT via handshake WS) reservar temporalment un seient amb estat `DISPONIBLE` emetent l'event WebSocket `seient:reservar { seatId }`. Si la reserva prospera, el sistema MUST crear un registre `Reservation` amb `expires_at = NOW() + 5 minuts`, actualitzar `seat.estat` a `RESERVAT` dins d'una transacció atòmica, i notificar el client privadament amb `reserva:confirmada`. El servidor MUST garantir que si el client desapareix (tanca el navegador, perd la connexió), el seient és alliberat automàticament quan `expires_at` és superat, sense intervenció manual (vegeu `seat-expiry`).

#### Scenario: Reserva exitosa d'un seient disponible

- **GIVEN** el Comprador està autenticat i és a la pàgina `/events/[slug]` i el seient B5 té `estat: DISPONIBLE`
- **WHEN** el Comprador emet `seient:reservar { seatId: "B5-id" }`
- **THEN** el client rep `reserva:confirmada { seatId: "B5-id", expiraEn: <ISO en 5min> }`
- **AND** `seat.estat` a la BD és `RESERVAT`
- **AND** existeix un registre `Reservation { seat_id: "B5-id", user_id: <id> }` amb `expires_at` aproximadament 5 minuts en el futur

#### Scenario: Reserva rebutjada si el seient ja és RESERVAT

- **GIVEN** el seient B5 té `estat: RESERVAT` per un altre Comprador
- **WHEN** un segon Comprador emet `seient:reservar { seatId: "B5-id" }`
- **THEN** el segon client rep `reserva:rebutjada { seatId: "B5-id", motiu: "no_disponible" }`
- **AND** no es crea cap nova `Reservation` per al segon Comprador
- **AND** `seat.estat` a la BD continua sent `RESERVAT`

#### Scenario: Reserva rebutjada si el seient ja és VENUT

- **GIVEN** el seient B5 té `estat: VENUT`
- **WHEN** qualsevol Comprador emet `seient:reservar { seatId: "B5-id" }`
- **THEN** el client rep `reserva:rebutjada { seatId: "B5-id", motiu: "no_disponible" }`
- **AND** `seat.estat` a la BD continua sent `VENUT`

#### Scenario: Garantia d'expiració automàtica — el seient és retornat al pool si el client desapareix

- **GIVEN** el Comprador B5 ha reservat el seient F6 (expires_at = T+5min) i posteriorment tanca el navegador
- **WHEN** transcorren 5 minuts i el cron del scheduler s'executa (≤ 30s de marge)
- **THEN** `seat.estat: DISPONIBLE` per a F6 a la BD
- **AND** el registre `Reservation` de F6 ha estat eliminat
- **AND** qualsevol client connectat a la room de l'event rep `seient:canvi-estat { seatId: "F6-id", estat: "DISPONIBLE" }`

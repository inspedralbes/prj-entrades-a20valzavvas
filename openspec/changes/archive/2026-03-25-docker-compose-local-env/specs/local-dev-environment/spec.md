## ADDED Requirements

### Requirement: docker-compose.yml a l'arrel arrenca tots els serveis
El sistema SHALL disposar d'un `docker-compose.yml` a l'arrel del repositori que defineixi els serveis `db`, `backend` i `frontend`, de manera que `docker compose up --build` arrenqui els tres serveis sense errors.

#### Scenario: Arrencada completa sense errors
- **GIVEN** que existeix un fitxer `.env` a l'arrel basat en `.env.example`
- **WHEN** s'executa `docker compose up --build`
- **THEN** els tres serveis (`db`, `backend`, `frontend`) arrenquen sense errors
- **THEN** PostgreSQL és accessible a `localhost:5432`
- **THEN** el backend respon a `http://localhost:3001/api`
- **THEN** el frontend és accessible a `http://localhost:3000`

#### Scenario: Servei backend espera que db estigui sa
- **GIVEN** que el servei `db` té un health check configurat
- **WHEN** s'executa `docker compose up`
- **THEN** el servei `backend` no arrenca fins que el health check de `db` retorna `healthy`
- **THEN** no es produeix cap error de connexió a la base de dades en l'arrencada de NestJS

#### Scenario: Aturada neta dels serveis
- **WHEN** s'executa `docker compose down`
- **THEN** tots els contenidors s'aturen i s'eliminen sense errors
- **THEN** el volum de dades de PostgreSQL persisteix (no s'elimina)

#### Scenario: Testabilitat — verificació dels ports exposats
- **WHEN** s'executa `docker compose up -d` i els serveis estan en estat `healthy`
- **THEN** `curl http://localhost:3001/api` retorna HTTP 200 o 404 (servidor actiu)
- **THEN** `curl http://localhost:3000` retorna HTTP 200 (frontend actiu)

### Requirement: Sense credencials hardcoded al docker-compose.yml
El `docker-compose.yml` NO SHALL contenir cap contrasenya, token o secret directament; totes les variables sensibles SHALL referenciar `${VAR}` llegit del fitxer `.env`.

#### Scenario: Inspecció del docker-compose.yml no revela secrets
- **WHEN** s'inspecciona el fitxer `docker-compose.yml` al repositori
- **THEN** no conté cap valor literal de contrasenya, token ni credencial
- **THEN** totes les variables sensibles (com `POSTGRES_PASSWORD`) usen la sintaxi `${VARIABLE_NAME}`

#### Scenario: Fitxer .env no commitejat
- **WHEN** s'executa `git status` en un repositori clonat
- **THEN** el fitxer `.env` no apareix com a fitxer tractat per git
- **THEN** el fitxer `.env` està inclòs al `.gitignore`

#### Scenario: Arrencada sense .env falla amb missatge clar
- **GIVEN** que no existeix cap fitxer `.env` a l'arrel
- **WHEN** s'executa `docker compose up`
- **THEN** Docker Compose mostra un avís de variables sense definir o el servei falla amb un missatge que indica quina variable manca

### Requirement: .env.example documenta totes les variables necessàries
El repositori SHALL incloure un `.env.example` a l'arrel que documenti totes les variables d'entorn requerides pel `docker-compose.yml`, amb valors d'exemple o descripcions.

#### Scenario: .env.example conté totes les variables del docker-compose
- **WHEN** s'inspecciona `.env.example`
- **THEN** conté almenys: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `DATABASE_URL`, `BACKEND_PORT` (3001), `FRONTEND_PORT` (3000)
- **THEN** tots els valors d'exemple no són secrets reals

#### Scenario: .env.example és versionat al repositori
- **WHEN** s'executa `git log --oneline .env.example`
- **THEN** el fitxer existeix al repositori i té almenys un commit

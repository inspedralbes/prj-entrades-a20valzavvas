## Context

El Laravel Service ja té `laravel/sanctum` llistat com a dependència al `composer.json` (per l'spec `laravel-service-scaffold`), però no s'ha publicat la configuració ni s'ha completat la integració. Cal configurar Sanctum per emetre tokens d'API i fer que el model `User` els pugui gestionar.

El sistema usa un `JWT_SECRET` compartit entre Laravel Service i Node Service, de manera que ambdós serveis puguin validar tokens sense consultar la BD en cada petició.

## Goals / Non-Goals

**Goals:**
- Publicar i configurar `config/sanctum.php` amb TTL de token via env
- Afegir el trait `HasApiTokens` al model `User`
- Executar (o verificar) la migració `personal_access_tokens` de Sanctum
- Definir `JWT_SECRET` i `SANCTUM_TOKEN_TTL` a `.env.example`
- Registrar el middleware de Sanctum a `bootstrap/app.php` o `Kernel.php`

**Non-Goals:**
- Implementar endpoints de register i login (PE-48 / US-00-02, PE-49 / US-00-03)
- Modificar el Node Service per consumir els tokens (documentació només)
- Canvis al frontend

## Decisions

**Decisió 1 — Sanctum en mode API tokens (no sessions)**

Sanctum suporta dos modes: sessions de web (cookie-based) i API tokens. Per a aquesta plataforma s'usaran API tokens, ja que el frontend és una SPA i el Node Service és un client d'API.

- Alternativa considerada: Laravel Passport (OAuth2). Descartat per sobrecàrrega; Sanctum és suficient per a tokens d'API simples.

**Decisió 2 — JWT_SECRET compartit via variable d'entorn**

El secret es defineix una única vegada a `.env` i és accessible a Laravel via `config('sanctum.secret')`. El Node Service llegeix la mateixa variable `JWT_SECRET` del seu propi `.env`.

- S'afegirà a `config/sanctum.php` la clau `'secret' => env('JWT_SECRET')` per exposar-lo via el sistema de configuració de Laravel.

**Decisió 3 — SANCTUM_TOKEN_TTL en minuts**

Laravel Sanctum permet configurar el TTL dels tokens via la clau `expiration` a `sanctum.php`. El valor per defecte de Sanctum és `null` (sense expiració). S'establirà `SANCTUM_TOKEN_TTL` al `.env` per controlar-ho.

## Risks / Trade-offs

- [Risc] El `JWT_SECRET` ha de ser idèntic als dos serveis. Si es roten, cal actualitzar-lo simultàniament als dos `.env`. → Mitigació: documentar al `README` i al `.env.example` que la variable és compartida.
- [Trade-off] Sanctum API tokens no són JWT estàndard (no contenen payload); la validació és sempre contra la BD (`personal_access_tokens`). Si es vol validació stateless real, caldria una alternativa com `tymon/jwt-auth`. Per a la fase actual, la validació contra BD és acceptable.
- [Risc] La migració `personal_access_tokens` pot fallar si la BD no és accessible en el moment del deploy. → Mitigació: garantir que el servei de BD arrenqui abans del Laravel Service al `docker-compose.yml` (ja configurat via `depends_on`).

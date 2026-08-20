# Security & ops backlog

From an audit on 2026-07-03 (before real marketing traffic). Ranked by severity. Each item notes
whether it touches a file a work track owns (see `ROADMAP.md` coordination rules) so fixes can be
scheduled without merge conflicts.

> **Owner decision (2026-07-03): security is DEPRIORITIZED.** All readable data is already-public
> register data and the graph is restorable, so confidentiality/DR findings are not being actioned.
> Do NOT plan a security merge window or hold back track work for these. The only items worth
> revisiting *if marketing traffic materializes* are reliability, not security: H1 (OOM on unbounded
> queries) and H2 (unauth write endpoint → Atlas cost/pollution). C1's code fix already exists on
> branch `fix/cypher-injection` and doubles as a connection-leak fix — fold into a normal deploy.

**Correction to an earlier worry:** `infrastructure/terraform.tfstate` is NOT committed — it's
gitignored and was never in git history. No secrets are committed. `main.tf` (committed) discloses
topology only, no credentials.

## CRITICAL

- [x] **C1 — Cypher injection in search** (`gateways/neo4j/neo4j.gateway.ts:55`). Raw `searchTerm`
      interpolated into a fulltext query; with APOC/GDS unrestricted this allowed arbitrary
      procedure execution. **FIXED on branch `fix/cypher-injection`** (parameterized + awaited
      session close; verified against live Neo4j — injection payload now treated as literal search
      text). Not yet merged/deployed. No track conflict.
- [ ] **C2 — Neo4j EC2 open to 0.0.0.0/0** on ports 7474, 7687, AND 22 (`infrastructure/main.tf:31-56`),
      public IP, basic auth only, bolt no TLS, procedures unrestricted. Restrict SG to Heroku
      egress/bastion, enable bolt TLS, strong `NEO4J_AUTH`, narrow `unrestricted`. Ops-owned
      (`main.tf`) — needs the user's AWS access. **Highest live risk.**

## HIGH

- [ ] **H1 — Whole-collection OOM** (`routes/api.ts:61-77`): `/api/shareholders` & `/api/companies`
      `find({})` with undefined options load the entire collection into memory. Enforce default +
      hard-max limit. **Touches `api.ts` (shared).**
- [ ] **H2 — No rate limiting + unauth arbitrary Mongo write** (`routes/api.ts:404`, `index.ts:28-33`,
      `models/models.ts:198`): `POST /api/user-event` stores the body verbatim (guard only checks
      `type`); 50MB body limit; no rate limiter anywhere. Add `express-rate-limit`, whitelist event
      fields, shrink body limits. **Touches `index.ts`, `api.ts`, `models.ts` (all shared).**
- [ ] **H3 — Expensive GDS endpoints uncapped** (`routes/api.ts:329`, `neo4j.gateway.ts:216`):
      `all-paths` feeds uncapped `limit` as `k` into Yen's; `shortest-path` Dijkstra over full graph;
      no auth/rate limit. Cap `limit`/`k` (≤25), rate-limit graph routes, lower connection timeouts.
      **Touches `api.ts` (shared) + `neo4j.gateway.ts` (free).**
- [ ] **H4 — No Neo4j backup/DR**: EBS unencrypted, single volume/instance/AZ, no snapshots, local
      unencrypted TF state. Enable EBS encryption + DLM snapshots, remote-encrypted TF state,
      restore runbook. Verify Atlas tier has PITR backups (console check). Ops-owned.
- [ ] **H5 — Outdated deps**: server `axios@0.24` (SSRF/ReDoS CVEs — bump to ≥1.7 now, small surface);
      client CRA5/React17/RR5 (plan migration). `server/package.json`, `client/package.json`.

## MEDIUM

- [ ] **M1 — NoSQL operator injection** (`api.ts:53`): cast query params to strings /
      `express-mongo-sanitize`. **`api.ts`.**
- [ ] **M2 — CORS fails open to `*`** if `CORS_ALLOWED_ORIGINS` unset (`index.ts:22`). Fail-closed. **`index.ts`.**
- [ ] **M3 — No server-side Sentry; error handler unreachable** (registered after `listen()` and after
      the `/*` catch-all, `index.ts:46-56`). Add `@sentry/node`, reorder middleware. **`index.ts`.**
- [ ] **M4 — No `helmet`/security headers** (`index.ts`). **`index.ts`.**
- [ ] **M5 — Oversized body parsing** (`index.ts:28-35`, 50MB + global `raw()`). Shrink & scope. **`index.ts`.**
- [ ] **M6 — `validationResult(req.body)` bug** (`api.ts:408`, should be `req`) — validator is a no-op;
      add real validators to write route + `:searchTerm` params. **`api.ts`.**
- [ ] **M7 — Neo4j session leak**: `session.close()` not awaited (`neo4j.gateway.ts:22`).
      **Fixed as part of C1 branch.**

## LOW

- [ ] **L1** — tfstate on disk exposes AWS acct/IP/resource IDs (recon; keep out of tree, remote backend).
- [ ] **L2** — brreg proxy path-traversal on `orgnr` (`routes/brreg.ts:15`): `isNumeric().isLength(9)`.
- [ ] **L3** — no `/health` endpoint for uptime monitoring.
- [ ] **L4** — client Sentry DSN hardcoded (public by design; set `sendDefaultPii:false`).
- [ ] **L5** — `config.requestTimeout` defined but unused; add request-timeout middleware.

## Suggested order
1. Deploy C1 (done, awaiting merge) and fix C2 — the two internet-exploitable issues.
2. Batch the `index.ts` hardening (H2 rate-limit/body, M2 CORS, M3 Sentry+order, M4 helmet, M5) and
   the `api.ts` hardening (H1, H2 endpoint, H3 caps, M1, M6) into two focused PRs during a
   coordinated merge window with Track 2/3.
3. H4/H5/backups.

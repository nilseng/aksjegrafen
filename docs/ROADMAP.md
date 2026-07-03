# Aksjegrafen — business roadmap & session coordination

> **For Claude sessions:** this file is the shared plan for turning aksjegrafen.com into a business.
> Multiple sessions work in parallel, one per track. Before starting work: read this file,
> pick/confirm your track with the user, and check the **Status log** so you don't duplicate
> or conflict with another session. Update your track's checkboxes and append to the status
> log as you complete things. Work on a branch named `track/<n>-<slug>` unless told otherwise.

## Strategy (July 2026 research summary)

**Wedge:** nobody in Norway combines (a) an interactive explorable ownership network, (b) multi-year
shareholder history 2014→present, (c) shortest-path/relationship search, and (d) a sub-enterprise
price. Graph players (Enin 1 295 kr/user/mnd, Strise, Infotorg, TIC) sell to compliance at
15k–150k+ kr/år; aksjeeiere.no (199 kr/år) has history but no viz; Proff/1881 have neither.

**Commercial model:** free tier for journalists/public (distribution + trust) plus a paid
professional tier (~200–1 300 kr/mnd) for accountants/lawyers doing KYC/RRR ownership mapping.
Compliance is the strongest segment: RRR registration mandatory since 31 July 2025, daily fines
since June 2026, and the official register is self-reported with no chains/history — obliged
entities must verify independently. Price anchors: RN Kundesjekk 1 250–1 750 kr/mnd,
Enin 1 295 kr/user/mnd, Proff Pluss 99 kr/mnd (consumer floor).

**Key dates/facts:**
- Aksjonærregisteret bulk CSV: ordered free via skatteetaten.no/deling/aksjonarregisteret/
  (form → ShareFile email within 5 business days, link expires in 1 week; no API). Opens mid-May
  yearly; 2025 data opened 18 May 2026; next drop ~May 2027. The May drop is an annual news event —
  time launches to it.
- Brreg data IS automatable: `data.brreg.no/enhetsregisteret/api/enheter/lastned` (entities),
  `.../roller/totalbestand` (roles). Requires NLOD 1.0 attribution.
- Legal: Legelisten precedent (HR-2021-2403-A) supports publishing person data in economic roles
  under GDPR Art 6(1)(f). Needed hygiene: documented interest-balancing, Art 14 privacy notice,
  objection channel, source-attribution page, data-vintage labels.
- Risks (monitor, don't panic): proposed "samordnet aksjeeierregister" (no ETA since 2014 promise);
  C-37/20-style privacy challenge.

Full research details live in the Claude project memory (`business-strategy.md`,
`yearly-shareholder-import.md`) — shared across all sessions in this project.

---

## Track 1 — Marketing & trust

Goal: reach potential customers, build trust, test use cases. Mostly content + outreach prep;
code work is limited to trust pages and analytics funnels.

- [ ] **Kilder/om-oss page** modeled on proff.no/info/kilder: every data source, update frequency,
      NLOD 1.0 attribution for Brreg, data vintage ("per 31.12.20XX") shown on data views.
- [ ] **Privacy package**: Art 6(1)(f) interest-balancing doc, Art 14 privacy notice page,
      objection/correction channel (email is enough to start).
- [ ] **Use-case funnels**: define one funnel per use case (relationship search, ownership history,
      financials, brreg lookup) on top of existing GA4 + `user_events` pipeline
      (`POST /api/user-event`, types in `client/src/models/models.ts`). Add missing events.
- [ ] **Landing copy per use case** (can be static sections/pages): "hvem eier X", "finn koblingen
      mellom A og B", "eierhistorikk". NOTE: the **KYC/reelle-rettighetshavere** offer page +
      accountant outreach kit + concierge playbook are owned by the **coordinator/revenue-validation**
      workstream (`docs/marketing/compliance-gtm.md`) — do NOT rebuild these here. Track 1 focuses on
      awareness/PR (Kode24, Shifter, LinkedIn), the kilder page, privacy, and analytics funnels.
- [ ] **Pitch drafts**: Kode24 (hei@kode24.no — hobbyprosjekt/tech angle: D3 + Neo4j + 1.7M rows),
      Shifter (tips@shifter.no — commercial milestone angle), founder LinkedIn post series
      (graph screenshots of newsworthy companies).
- [ ] **Customer discovery**: script + shortlist for 5–10 interviews with accountants
      (Regnskap Norge segment) about AML/eierskaps-documentation workflow; journalist outreach
      list (Data-SKUP, økonomijournalistikk community).

## Track 2 — Technical: auto-import & SEO

Goal: next registry drop should be "drop CSV in a bucket, press go"; make the site crawlable.

Import automation (details/gotchas in memory `yearly-shareholder-import.md`):
- [x] **De-hardcode years**: year list `server/src/importCli.ts:18`, `stocks_20XX` type in
      `importShareholderRegistryToGraph.ts:5-28`, year defaults in `routes/api.ts`,
      `neo4j.mapper.ts`, `mongoDB.gateway.ts`, `findHistoricalInvestments.ts`, `Year` type in
      `models.ts`. Derive available years from data.
- [x] **Fix destructive reload**: replace clear-all-then-import-one-year
      (`clearGraphDatabase.ts` wipes ALL years + roles) with additive per-year import
      (delete only that year's `OWNS {year}` edges, then MERGE).
- [ ] **Automate Brreg refresh**: scheduled job downloading `enheter/lastned` +
      `roller/totalbestand` (streaming, filenames from config not hardcoded), re-running the
      roles-to-graph import monthly. node-cron is already a dependency (unused) or use
      Heroku Scheduler / cron on the EC2 box.
- [ ] **Run imports server-side**: execute on the Neo4j EC2 box (local bolt, no laptop/caffeinate),
      CSV pulled from S3.
- [ ] **Registry watcher**: small job polling skatteetaten.no/deling/aksjonarregisteret/ for next
      year's availability, notify by email.

SEO (currently greenfield: CRA SPA, 2 routes, UUID query params, no sitemap/OG/JSON-LD):
- [ ] **Server-rendered company pages** `/selskap/:orgnr` from Express using existing data
      (`/api/company`, `/api/investors`, financials proxy): title, meta description, OG tags,
      JSON-LD Organization, top shareholders, key financials, prominent link into the interactive
      graph. (No framework migration needed.)
- [ ] **sitemap.xml** generated from the companies collection + `Sitemap:` line in robots.txt.
- [ ] **Canonicals + per-page meta** on the SPA shell; human-readable orgnr-based share URLs.

## Track 3 — Features & portal

Goal: one page per company aggregating everything (this is the same build as the SEO pages —
coordinate with Track 2 on `/selskap/:orgnr`), plus the first paid features.

- [ ] **Indirect ownership calculation**: effective % through chains (Neo4j path queries).
      The documented market gap and the core KYC feature.
- [ ] **KYC/RRR report export**: PDF/CSV "eierskapskart" documenting the chain with sources +
      date, formatted for an AML file. First paid feature.
- [ ] **Company portal page**: ownership graph, shareholder history, roles, financials, brreg
      info in one view (builds on Track 2's server-rendered page or a richer client route).
- [ ] **Year-over-year diff**: "what changed in X's ownership since last year".
- [ ] **Monitoring/alerts**: watch a company/person, notify on ownership/role changes.
- [ ] **Auth + payments** (email login, Stripe/Vipps) — only once a paid feature exists.

---

## Coordination rules

1. **One track per session.** Claim it in the status log before starting.
2. **Branches**: `track/1-marketing`, `track/2-import`, `track/2-seo`, `track/3-features` etc.
   Rebase on master often; master stays deployable (Heroku `git push heroku master`).
3. **Shared touchpoints to watch for conflicts**: `server/src/routes/api.ts`, `server/src/index.ts`
   (route mounting), `client/src/App.tsx` (routes), `server/src/models.ts`. If your change touches
   these, note it in the status log.
4. Track 2 SEO pages and Track 3 portal overlap on `/selskap/:orgnr` — Track 2 owns the
   route/rendering skeleton, Track 3 enriches content.
5. Update checkboxes + status log in this file as part of your commits (merge conflicts in this
   file are cheap; duplicated work is not).

## Status log

_Append entries: date — session/track — what was done / claimed / decided._

- 2026-07-03 — planning session — market research done, roadmap created. No tracks claimed yet.
- 2026-07-03 — planning session — usage baseline from Atlas: 868 tracked events all-time, ~50–100/mo
  (flat for 14 months). Feature mix: GraphLoad 468, investor/investment tables 373 combined,
  **relationship search only 27** (most differentiated feature is least discovered — marketing +
  UI-placement signal). DB scale: 579,562 companies (→ sitemap needs ~12 files at 50k URLs each),
  3.26M shareholders, 10.3M ownerships.
- 2026-07-03 — planning session — **security audit done → `docs/SECURITY-BACKLOG.md`.** Two
  internet-exploitable issues found (C1 Cypher injection, C2 open Neo4j SG).
- 2026-07-03 — coordinator — **Revenue-validation workstream started (compliance-first)** →
  `docs/marketing/compliance-gtm.md` + offer/landing page (Artifact). Concierge "eierskapssjekk"
  is the validation mechanism (sell before building the KYC export). **Track 1: do not rebuild the
  KYC offer page / accountant outreach / concierge — see the note under Track 1's "Landing copy" item.**
- 2026-07-03 — coordinator — **Owner deprioritized security** (data is already public + restorable).
  **No security merge window; do not hold back track work for it.** The C1 code fix exists on branch
  `fix/cypher-injection` (also fixes a connection leak) — fold into a normal deploy, not a security
  push. Only H1 (OOM) and H2 (unauth write) are worth revisiting later, as *reliability* items if
  traffic grows.
- 2026-07-03 — session on `track/2-import` — **claimed Track 2 (import automation + SEO)**. Starting
  with de-hardcoding years and fixing the destructive graph reload. Will touch `routes/api.ts` and
  `models.ts` (shared touchpoints).
- 2026-07-03 — track/2-import — De-hardcode years done (`Year` is now `number`; new
  `services/yearService.ts` derives available years from OWNS edges at startup; API year defaults
  and mongo sort follow the data; import CLI accepts 2015→current year). Fix destructive reload
  done (`clearGraphYear.ts` deletes only the target year's OWNS edges + `total_stocks_<year>`;
  `--clearYearFirst` default true, `--clearGraphDBFirst` now defaults **false**). Verified against
  live DBs: year detection returns [2025], graph/mongo endpoints OK, clearGraphYear dry-run on an
  empty year left 2025's 3.06M edges intact. Touched shared files: `routes/api.ts`, `index.ts`,
  `models.ts` (server+client).

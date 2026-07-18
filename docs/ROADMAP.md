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

- [x] **Kilder/om-oss page** modeled on proff.no/info/kilder: every data source, update frequency,
      NLOD 1.0 attribution for Brreg, data vintage ("per 31.12.20XX") shown on data views.
      → `/kilder` (`client/src/components/Kilder.tsx`) + `DataSourceNote` on investor/investment
      tables and financials. "Om"-link in NavBar.
- [x] **Privacy package**: Art 6(1)(f) interest-balancing doc, Art 14 privacy notice page,
      objection/correction channel (email is enough to start).
      → `docs/legal/interesseavveining.md` (internal) + `/personvern`
      (`client/src/components/Personvern.tsx`); objection channel = teodor.nilseng@gmail.com.
- [x] **Use-case funnels**: define one funnel per use case (relationship search, ownership history,
      financials, brreg lookup) on top of existing GA4 + `user_events` pipeline
      (`POST /api/user-event`, types in `client/src/models/models.ts`). Add missing events.
      → `docs/marketing/funnels.md`; added `FinancialsLoad` + `UnitInformationLoad` events
      (client+server enums in sync). Follow-ups (session id, search events, GA4 mirroring)
      listed in the doc.
- [x] **Landing copy per use case** (can be static sections/pages): "hvem eier X", "finn koblingen
      mellom A og B", "eierhistorikk", "KYC/reelle rettighetshavere".
      → `docs/marketing/landing-copy.md` (ready for Track 2's server-rendered pages / front-page
      sections; not yet mounted as routes to avoid conflicting with Track 2).
      NOTE (coordinator): the paid **KYC/reelle-rettighetshavere** offer/pricing page + accountant
      outreach kit + concierge playbook live in the coordinator/revenue-validation workstream
      (`docs/marketing/compliance-gtm.md`); Track 1's landing copy here covers the public use-cases.
- [x] **Pitch drafts**: Kode24 (hei@kode24.no — hobbyprosjekt/tech angle: D3 + Neo4j + 1.7M rows),
      Shifter (tips@shifter.no — commercial milestone angle), founder LinkedIn post series
      (graph screenshots of newsworthy companies).
      → `docs/marketing/pitch-kode24.md`, `pitch-shifter.md`, `linkedin-series.md` (drafts with
      pre-send checklists; Shifter waits for a milestone).
- [x] **Customer discovery**: script + shortlist for 5–10 interviews with accountants
      (Regnskap Norge segment) about AML/eierskaps-documentation workflow; journalist outreach
      list (Data-SKUP, økonomijournalistikk community).
      → `docs/marketing/customer-discovery.md` (script, recruiting channels, interview log,
      journalist list skeleton).

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
      _Code done (`npm run refresh-roles` → download + clear roles + re-import; filenames via
      `DATA_DIR`/`BRREG_ROLES_FILE` env). Remaining: schedule it monthly — belongs with
      "Run imports server-side" below (cron on the EC2 box)._
- [ ] **Run imports server-side**: execute on the Neo4j EC2 box (local bolt, no laptop/caffeinate),
      CSV pulled from S3.
- [ ] **Registry watcher**: small job polling skatteetaten.no/deling/aksjonarregisteret/ for next
      year's availability, notify by email.

SEO (currently greenfield: CRA SPA, 2 routes, UUID query params, no sitemap/OG/JSON-LD):
- [x] **Server-rendered company pages** `/selskap/:orgnr` from Express using existing data
      (`/api/company`, `/api/investors`, financials proxy): title, meta description, OG tags,
      JSON-LD Organization, top shareholders, key financials, prominent link into the interactive
      graph. (No framework migration needed.)
- [x] **sitemap.xml** generated from the companies collection + `Sitemap:` line in robots.txt.
- [x] **Canonicals + per-page meta** on the SPA shell; human-readable orgnr-based share URLs.

## Track 3 — Features & portal

Goal: one page per company aggregating everything (this is the same build as the SEO pages —
coordinate with Track 2 on `/selskap/:orgnr`), plus the first paid features.

- [x] **Indirect ownership calculation**: effective % through chains (Neo4j path queries).
      The documented market gap and the core KYC feature.
      _Done on `track/3-features`: `GET /api/graph/indirect-investors` (uuid or orgnr, year,
      maxDepth, minShare floor for mega-caps, pagination) + "Indirekte eierskap" modal table in
      the graph UI. Level-by-level aggregation, not path enumeration — Equinor answers in ~1.5s._
- [x] **KYC/RRR report export**: PDF/CSV "eierskapskart" documenting the chain with sources +
      date, formatted for an AML file. First paid feature.
      _Done on `track/3-features`: `GET /api/ownership-report?uuid|orgnr&year&format=pdf|csv`
      (pdfkit; Norwegian copy; sections: eiere etter effektiv andel, minst-25 %-liste
      (RRR-indikasjon), eierskapskjeder for eiere ≥ 5 %, kilder/forbehold med datovintage).
      Download links in the "Indirekte eierskap" modal. Currently free — gate behind payment
      when auth lands._
- [ ] **Company portal page**: ownership graph, shareholder history, roles, financials, brreg
      info in one view (builds on Track 2's server-rendered page or a richer client route).
- [x] **Year-over-year diff**: "what changed in X's ownership since last year".
      _Done on `track/3-features`: `GET /api/ownership-changes?orgnr&year&compareYear` — per-investor
      New/Exited/Increased/Decreased/Unchanged with share/stocks both years + summary counts, and an
      "Endringer i eierskap" modal table with year selector. Runs on MongoDB (holdings cover all
      years; the graph only holds the imported year — NB: the 2025 reload wiped 2019–2024 OWNS
      edges in Neo4j, so graph-based history is empty until Track 2's additive re-import).
      Classification/sort/summary pushed into a Mongo aggregation: DNB Bank answers in ~2 s._
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
- 2026-07-03 — track/2-import — Brreg refresh code done: `downloadBrregFiles.ts` (streaming,
  atomic temp-file swap), gzip-aware data readers, `clearGraphRoles.ts` (delete non-OWNS rels so
  lapsed roles disappear), `refreshRolesCli.ts` / `npm run refresh-roles` as the monthly job entry
  point. Verified: downloaded the real 131MB roles dump and stream-parsed it. Data paths now come
  from `config.ts` (`DATA_DIR`, `BRREG_ROLES_FILE`, `BRREG_ENTITIES_FILE`) — the hardcoded
  `roller_2026-05-23...json` filename is gone; run `refresh-roles` (or set the env var) before the
  next roles import. Scheduling still pending (EC2 cron, with "Run imports server-side").
- 2026-07-05 — track/2-import — SEO done: server-rendered `/selskap/:orgnr` pages (Express, no
  framework: title/meta/OG/JSON-LD Organization, top-10 aksjonærer per latest company year from
  Mongo, nøkkeltall from the brreg regnskap API with 3s timeout, NLOD attribution + data vintage,
  404+noindex for unknown orgnr, Cache-Control 1d). Sharded sitemap: `/sitemap.xml` index →
  `/sitemap-static.xml` + 12× `/sitemap-companies-N.xml` (50k URLs each, 580k companies);
  `Sitemap:` line in robots.txt. SPA shell: lang=no, OG tags, dynamic canonical
  (`CanonicalLink`), and stable share URLs `/?graphType=Default&sourceOrgnr=<orgnr>` —
  `/api/node` now resolves orgnr→node (Track 3: use these for portal links). Verified locally
  against live DBs: Statkraft + Equinor pages, sitemap shards, 404s, node-by-orgnr. Touched
  shared files: `routes/api.ts`, `index.ts` (route mounting), `App.tsx`. NOTE for Track 3: the
  `/selskap/:orgnr` skeleton is in `server/src/routes/selskap.ts` — enrich there.
- 2026-07-03 — track 3 session — **claimed Track 3 (features & portal)** on branch
  `track/3-features` (worktree). Starting with indirect ownership calculation.
- 2026-07-03 — track 3 session — indirect ownership done (API + graph-UI table), verified
  against live Neo4j. Touches shared files `server/src/routes/api.ts`, `server/src/models/models.ts`,
  `client/src/models/models.ts` (new UserEventType `IndirectOwnershipLoad`). The endpoint accepts
  `orgnr` so Track 2's `/selskap/:orgnr` pages can embed it directly. Next: KYC/RRR report export
  on top of it.
- 2026-07-03 — track 3 session — KYC/RRR report export done: PDF/CSV eierskapsrapport endpoint
  + download links in the graph UI, verified against live data (Equinor report generates in
  ~1.6 s). New server dep `pdfkit`. Shared files touched again: `server/src/routes/api.ts`,
  both `models.ts` (UserEventType `OwnershipReportDownload`). Next: company portal page
  (coordinate with Track 2 on `/selskap/:orgnr`) or year-over-year diff.
- 2026-07-05 — track 3 session — year-over-year ownership diff done (Mongo aggregation +
  modal table). **Heads-up for Track 2:** confirmed Neo4j currently only has 2025 OWNS edges —
  the 2025 reload wiped 2019–2024; the diff therefore runs on MongoDB. Also bumped client
  `Year` type to include 2025 (was stale). Shared files touched: `routes/api.ts`, both
  `models.ts`. Remaining track 3: portal page (awaits Track 2 skeleton), monitoring/alerts,
  auth + payments (gate the report export).
- 2026-07-03 — track 1 session — **claimed Track 1 (Marketing & trust)** on branch `track/1-marketing`. Starting with kilder/om-oss page + privacy package, then funnels/copy/pitches. Will touch `client/src/App.tsx` (new routes) — noting per coordination rule 3.
- 2026-07-03 — track 1 session — all Track 1 items done in first pass (see checkboxes above).
  Touched shared files: `client/src/App.tsx` (added `/kilder` + `/personvern` routes),
  `client/src/models/models.ts` + `server/src/models/models.ts` (two new UserEventTypes),
  `NavBar.tsx` ("Om" link). For Track 2: `docs/marketing/landing-copy.md` has ready meta
  descriptions/H1s for the server-rendered pages. Remaining track-1 work is operational
  (send pitches when milestone hits, run interviews, fill outreach lists) + analytics
  follow-ups listed in `docs/marketing/funnels.md`.
- 2026-07-03 — track 1 session — second pass, content package: live `/bruksomrader` use-case
  page (landing copy now on-site) + `InfoPageNav` cross-nav on all info pages (touched
  `App.tsx` route list + `ApiDocs.tsx` + `NavBar.tsx` again); newsletter concept + issue #1
  draft (`docs/marketing/newsletter.md`); two publishable articles
  (`docs/marketing/artikler/`: hvem-eier SEO guide + RRR-compliance piece); cold outreach
  email sequence (`docs/marketing/outreach-emails.md`); ready-to-post LinkedIn intro post
  (`docs/marketing/linkedin-post-1.md`).
- 2026-07-03 — track 1 session — **landing page at `/`, graph moved to `/graf`**
  (`Landing.tsx`; old `/?sourceUuid=…` share links redirect to `/graf`; in-app link generation
  updated in `NodeSearch`/`TargetSearch`/`useGraphMenu` — heads-up Track 3). Root
  `index.html`: `lang="no"`, new title/description + OG tags — heads-up Track 2 (SEO).
  app.aksjegrafen.com subdomain split assessed and **deferred until auth/paid tier**; decision
  + runbook in `docs/landing-and-domain.md`.
- 2026-07-18 — coordinator — **INTEGRATED all tracks + `fix/cypher-injection` into master**
  (fast-forward). Server `tsc`, client `tsc`, and client production build all green. Two
  cross-track reconciliations made during the merge, **note when you rebase**:
  (1) `client/src/App.tsx` root route now forwards ANY graph link to `/graf` — Track 1 only
  forwarded `sourceUuid`, but Track 2's SEO share URLs use `sourceOrgnr`; the redirect now
  covers `sourceUuid`/`sourceOrgnr`/`targetUuid`/`targetOrgnr`/`graphType` so both styles work.
  (2) `client/public/index.html` had two `<title>`s — kept Track 2's OG block but used Track 1's
  title text ("…se hvem som eier norske selskaper") for both `<title>` and `og:title`. Also:
  `Year` is `number` (Track 2) everywhere; both `models.ts` enums hold all five new UserEventTypes;
  `.claude/` is now gitignored. **Action for track sessions: rebase your branch onto master.**
  Production deploy (`git push heroku master`) is a SEPARATE step, pending a decision on whether
  to trigger a graph re-import first (Neo4j currently holds only 2025 OWNS edges; Mongo has all years).
- 2026-07-18 — track 3 session — indirect-ownership fixes after user testing on Aize AS:
  (1) treasury shares (self-loop OWNS edges, e.g. Aize Holding owning 2,7 % of itself)
  compounded into phantom indirect ownership (>100 % for a sole owner) — self-loops now
  excluded from traversal and chain enumeration; (2) the maxDepth cap silently cut off real
  owners (Røkke sits 6 levels above Aize AS) and is **removed entirely** — the traversal runs
  until the minShare floor empties the frontier (deep structures are the point of the
  feature; a 100-level internal guard only stops pathological never-decaying cycles);
  (3) new `investorType=person` filter + "Kun personer" toggle in the modal (person = node
  has year_of_birth) so ultimate individual owners surface directly. Aize AS person view now
  ranks Røkke on top at 45,30 % effective.
- 2026-07-18 — track 3 session — "Kun personer" is now the default view; table rows expand
  on click to show the investor's actual ownership chains (new
  `GET /api/graph/ownership-chains?investorUuid&targetUuid`, bounded per investor by
  minDepth + 2); "Kjeder" column got a tooltip.

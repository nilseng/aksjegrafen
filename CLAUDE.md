# Aksjegrafen

Norwegian company-ownership graph: shareholder registry (2014→present) in MongoDB Atlas + Neo4j,
React SPA in `client/`, Express API in `server/`, deployed on Heroku (auto-deploys from `master` via
the GitHub integration), Neo4j self-hosted on EC2 (`infrastructure/`).

## Multi-session work

We are commercializing aksjegrafen.com across parallel tracks (marketing, import automation + SEO,
features/portal), with one Claude session per track. **Before starting substantive work, read
`docs/ROADMAP.md`** — it holds the strategy, per-track task lists, coordination rules, and a status
log. Claim your track there, update it as you go, and check it for conflicts with other sessions.

## Key operational facts

- Annual shareholder import: `server/src/importCli.ts` — see project memory
  `yearly-shareholder-import.md` for the gotchas (default reload WIPES all years + roles from Neo4j;
  roles must be re-imported after; year defaults are hardcoded in several files and must be bumped).
- Data files live in `data/` (gitignored, multi-GB); filenames are currently hardcoded in the
  import use-cases.
- Migrations: `cd server && npm run migrate -- --name <migration>` (register in `migrateCli.ts`).
- **Deploying: merge/push to `master` and Heroku's GitHub integration deploys it.** Never run
  `git push heroku master` — that bypasses the flow and creates a duplicate release. This means
  every commit on `master` ships to production, so put unrelated or doc-only work on a branch.
  Check what is live with `heroku releases -a aksjegrafen`.
- Privacy suppression (GDPR Art. 21 objections): `cd server && npm run suppress` — see the README.
  Suppress the person, not the company page; identifying details stay out of the repo.

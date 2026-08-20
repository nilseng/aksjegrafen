# Landing page & domain layout decision

_Track 1, July 2026. Context for the question "landing page at the root + app on
app.aksjegrafen.com?"_

## What is implemented (path split, same domain)

- **`/` = landing page** (`client/src/components/Landing.tsx`): hero with the real node search
  (selecting a result jumps straight into the graph), four use-case cards, source/trust line,
  links to info pages. Root title/description/OG tags upgraded in `client/public/index.html`
  (`lang="no"`, proper `<title>`, og:image from `logo-512x512.png`).
- **`/graf` = the graph** (the app). All in-app link generation updated
  (`NodeSearch`, `TargetSearch`, graph menu "Åpne i ny fane").
- **Old shared links keep working**: `/?sourceUuid=…` redirects to `/graf?sourceUuid=…`
  (query-param check in `App.tsx`). Nothing breaks for anyone who bookmarked or shared a graph.

Rationale: a landing at the root is pure win (first-time visitors see what the product is;
crawlers see real meta; the May-cycle traffic still reaches the search in one click). The path
split gives the marketing/app separation without touching DNS.

## Recommendation on app.aksjegrafen.com: defer

A subdomain split is the right end-state **once there is an authenticated, paid app** (Track 3
auth + payments), but doing it now costs real money-time and buys nothing users can see:

| Cost today | Detail |
|---|---|
| DNS + Heroku | new custom domain + SSL, `heroku domains:add`, CNAME |
| Link breakage | every shared/bookmarked graph URL needs a permanent redirect service on the old host |
| SEO split | backlinks to graph views start accruing to `app.`, not the root domain Track 2 is building authority for |
| Analytics | GA4 cross-(sub)domain configuration to keep sessions intact |
| State loss | localStorage (theme) and any future auth cookies don't cross subdomains automatically |

The path split implemented above is forward-compatible: when the time comes, `/graf` moves to
`app.aksjegrafen.com/graf` (or `/`) and the Express server keeps 301s at the old paths.

## Runbook for later (when auth/paid tier ships)

1. DNS: `app` CNAME → Heroku DNS target; `heroku domains:add app.aksjegrafen.com` (ACM handles TLS).
2. Same Heroku app serves both hosts initially — no CORS work (API calls stay relative).
3. Express middleware: on host `aksjegrafen.com`, 301 `/graf*` → `https://app.aksjegrafen.com/graf*`
   (preserve query string!); on `app.`, optionally redirect marketing paths back to the root domain.
4. GA4: add both domains under the same stream's cross-domain settings.
5. Update `getBaseUrl()` usage (`client/src/utils/utils.ts`) if share links should always point at `app.`.
6. Root domain becomes the (Track 2) server-rendered marketing/SEO site; `/selskap/:orgnr` pages
   link into the app.

# Use-case funnels (analytics)

Formål: måle hvilke bruksområder som faktisk brukes, hvor brukerne faller fra, og hvilke
use-cases som bør prioriteres i landing copy og betalt tier.

## Datagrunnlag

To pipelines:

1. **`user_events` (egen, MongoDB)** — `POST /api/user-event` (`server/src/routes/api.ts`),
   lagres i `user_events`-collection med `type`, `uuid`/`orgnr` (node det gjelder) og `createdAt`.
   Typer i `client/src/models/models.ts` og `server/src/models/models.ts` (**hold dem i sync**).
   Sendes via `captureUserEventThunk` (`client/src/slices/userEventSlice.ts`).
2. **GA4** — kun rå gtag-snippet i `client/public/index.html` (G-P7GJDRPP3H). Ingen
   SPA-rutenavigasjon eller custom events sendes i dag; GA4 gir dermed bare
   førstelastings-pageviews og teknisk demografi. Funnel-analysen under bygger på `user_events`;
   GA4 brukes til trafikk-kilder (UTM fra LinkedIn-serien osv.).

## Eventtyper

| Event | Når | Status |
|---|---|---|
| `GraphLoad` | En graf lastes for en node (søketreff valgt / delt lenke åpnet) | fantes |
| `RelationSourceLoad` | Kilde-node i relasjonssøk lastet | fantes |
| `RelationTargetLoad` | Mål-node i relasjonssøk lastet (= relasjonssøk utført) | fantes |
| `InvestorTableLoad` | Aksjonærtabell (med årshistorikk) åpnet for selskap | fantes |
| `InvestmentTableLoad` | Investeringstabell åpnet for aktør | fantes |
| `FinancialsLoad` | Regnskapsvisning åpnet | **ny (track 1)** |
| `UnitInformationLoad` | Brreg-detaljvisning ("Detaljer") åpnet | **ny (track 1)** |

## Funnels

Alle funnels starter med besøk (GA4 pageview) → `GraphLoad` (aktivering: brukeren fant noe).

1. **Relasjonssøk** ("finn koblingen mellom A og B")
   `GraphLoad` → `RelationSourceLoad` → `RelationTargetLoad`
   Frafall mellom source og target = brukeren fant ikke/orket ikke å velge mål — UX-signal.
2. **Eierhistorikk** ("hvem eide X, og når")
   `GraphLoad` → `InvestorTableLoad` eller `InvestmentTableLoad`
   Tabellene viser beholdning per år; dette er proxyen for historikk-interesse til
   en egen historikkvisning finnes.
3. **Regnskap/finansielt** — `GraphLoad` → `FinancialsLoad`
4. **Brreg-oppslag** ("grunndata om selskapet") — `GraphLoad` → `UnitInformationLoad`

**KYC-proxy** (til betalt tier-beslutning): samme sesjon/nærhet i tid med relasjonssøk +
aksjonærtabell + detaljer på samme `orgnr` ligner en kartleggingsjobb. `user_events` har ingen
sesjons-ID i dag — se "Videre arbeid".

## Avlesning

Enkel avlesning i mongo-shell / Compass mot `user_events`:

```js
// Volum per eventtype siste 30 dager
db.user_events.aggregate([
  { $match: { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 3600 * 1000) } } },
  { $group: { _id: "$type", n: { $sum: 1 } } },
  { $sort: { n: -1 } },
])

// Mest utforskede selskaper per use case
db.user_events.aggregate([
  { $match: { type: "FinancialsLoad" } },
  { $group: { _id: "$orgnr", n: { $sum: 1 } } },
  { $sort: { n: -1 } }, { $limit: 20 },
])
```

## Videre arbeid (ikke gjort i track 1)

- [ ] **Sesjons-ID** på user_events (anonym, f.eks. random uuid i sessionStorage) — nødvendig for
      ekte funnels og KYC-proxyen. Krever liten personvernvurdering (fortsatt uten identifisering).
- [ ] **Søke-events** (`SearchSelect` e.l. i `SearchComponent.tsx`) for å måle søk → graf-konvertering.
- [ ] **GA4 custom events**: speile user_events til gtag for funnel-rapporter i GA4-UI, + SPA
      route-change pageviews (`/kilder`, `/personvern`, `/api-docs`).
- [ ] **Graf-utvidelses-events** (`useGraphMenu.tsx`: "Flere investorer", "Flere roller" osv.) for
      å måle dybde-engasjement.

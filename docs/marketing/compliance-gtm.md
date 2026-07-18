# Compliance go-to-market — revenue-validation kit

Owned by the **coordinator / revenue-validation** workstream (not Track 1). Goal: get to the first
paying compliance customer by *selling before building* — validate willingness to pay for
KYC/reelle-rettighetshavere ownership mapping without shipping new product first.

Segment (in priority order): **regnskapsførere → revisorer → advokater → eiendomsmeglere** — all
legally required to do kundetiltak/eierskapskontroll under hvitvaskingsloven. Price anchors:
RN Kundesjekk 1 250–1 750 kr/mnd, Enin 1 295 kr/user/mnd, Forvalt 12 500–25 000 kr/år. Our Pro
tier is deliberately positioned below them at **990 kr/user/mnd**.

## Assets

- **Offer / landing page** — now **self-hosted at `aksjegrafen.com/eierskapssjekk`**
  (`server/static/eierskapssjekk.html`, served from Express before the SPA catch-all; done by
  track 1 session 2026-07-18 per owner decision — coordinator still owns the copy). Changes vs the
  Artifact original: data claim corrected 2014→2015, "Åpne grafen" back-link in topbar, footer
  links to /graf, /bruksomrader, /kilder, /personvern, trust section links to the privacy/sources
  pages, full head (title/description/OG/canonical). Cross-linked from: landing + bruksomrader KYC
  card, NavBar CTA (hidden on /graf and on xs screens), InfoPageNav.
  Original Artifact (kept as design reference, private):
  https://claude.ai/code/artifact/4150d00a-b93d-496e-b6ba-6ae08d6a05b7
  ⚠️ CTAs currently mailto `teodor.nilseng@gmail.com` — swap for a branded inbox (e.g.
  `post@aksjegrafen.com`, four mailto: occurrences in the HTML) before wider sharing.

## The concierge test (how we validate before building the export feature)

The KYC PDF-export feature does **not** exist yet. We deliver it by hand:
1. Prospect sends an organisasjonsnummer by email.
2. We build the ownership map in the live app (graph + indirect ownership + history).
3. We produce a one-page PDF: the beneficial-ownership chain, control %, sources, and date.
   (Manual for now — screenshot/export from the app + a simple template.)
4. Send back within one business day.

Every delivery is a sales conversation and a spec-discovery session: note what they ask for that
we couldn't give them — that's the real feature backlog, pulled by demand instead of guessed.
**Track outcome per prospect:** replied? sent an orgnr? found the PDF useful? would pay 990 kr/mnd?

## Target list criteria

- Small/mid regnskapsbyrå and revisjonsselskap (2–30 ansatte) — big enough to have AML duties, small
  enough to lack an enterprise tool like Strise/Enin.
- Advokatfirma med selskaps-/transaksjonspraksis; eiendomsmeglerforetak (AML-pliktige).
- Sourcing: Regnskap Norge / Revisorforeningen member directories, Proff industry codes (69.201
  regnskap, 69.100 juridisk, 68.310 eiendomsmegling), LinkedIn "regnskapsfører/partner" + sted.
- Aim: a first batch of ~30 named contacts.

## Outreach — email

**Cold, to a regnskapsbyrå (subject: `Eierskapskontroll uten å grave i registrene`)**

> Hei {navn},
>
> Jeg har laget Aksjegrafen — et verktøy som tegner hele eierkjeden bak et norsk selskap, gjennom
> holdingledd og på tvers av årene, fram til de reelle rettighetshaverne.
>
> Bakgrunnen er at RRR-registeret er egenrapportert, viser bare eiere over 25 %, og gir verken
> eierkjeder eller historikk — så kontrollen faller uansett på dere.
>
> Vil du at jeg tar et konkret eksempel? Send meg ett organisasjonsnummer fra porteføljen deres, så
> lager jeg et dokumentert eierskapskart (reelle rettighetshavere, hele kjeden, med kilder) og
> sender det tilbake innen en virkedag. Gratis, ingen forpliktelser.
>
> Mvh,
> {avsender} · aksjegrafen.com

**Follow-up (after 4–5 dager, no reply)**

> Hei {navn}, kort oppfølging — tilbudet om en gratis eierskapssjekk står ved lag. Send meg et
> orgnr, så ser du på deres egne kundedata hva verktøyet faktisk gir. Mvh {avsender}

**After delivering a concierge report**

> Her er eierskapskartet for {selskap} — de reelle rettighetshaverne er markert, med kilde og dato.
> Sånn ser det ut for hvert selskap dere sjekker. Full tilgang koster 990 kr per bruker/mnd. Skal
> jeg sette opp en prøvetilgang for kontoret?

## Outreach — LinkedIn

**Connection note (300-char limit):**
> Hei {navn} — jeg har laget Aksjegrafen, som viser reelle rettighetshavere og hele eierkjeder bak
> norske selskaper (nyttig for kundekontroll/hvitvasking). Kobler gjerne.

**First DM after connect:**
> Takk for koblingen! Tilbyr en gratis eierskapssjekk: send meg ett orgnr fra porteføljen, så får du
> et dokumentert eierskapskart med reelle rettighetshavere i retur innen en virkedag. Nysgjerrig?

## What "validated" looks like

- ≥3 prospects send an orgnr (real interest signal).
- ≥1 says yes to a paid Pro trial.
- Qualitative: they confirm the flat RRR register is a genuine pain and the PDF saves them real time.

If that holds, prioritise building the real self-serve PDF export (Track 3) + payments; if not,
adjust the offer/segment before writing any code.

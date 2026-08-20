# Interesseavveining etter GDPR art. 6 nr. 1 bokstav f — aksjegrafen.com

**Status:** internt arbeidsdokument (accountability-dokumentasjon etter GDPR art. 5 nr. 2 og art. 24).
**Behandlingsansvarlig:** Aksjegrafen v/Teodor Nilseng (hei@aksjegrafen.com).
**Sist vurdert:** juli 2026. Revideres ved vesentlige endringer i tjenesten (nye datatyper,
nye funksjoner som endrer inngrepets omfang, f.eks. varsling/overvåkning av personer) og ellers årlig.

## 1. Behandlingen

Aksjegrafen henter, lagrer og publiserer opplysninger fra offentlige registre og viser dem som en
interaktiv, søkbar eierskapsgraf:

| Opplysning | Kilde | Omfang |
|---|---|---|
| Navn, fødselsår, postnummer/poststed for personlige aksjonærer; selskap, antall aksjer, aksjeklasse per 31.12. hvert år (2015→) | Skatteetatens aksjonærregister (innsynsordningen, årlig bulk-CSV) | Alle personlige aksjonærer i norske AS/ASA |
| Roller (styreleder, styremedlem, daglig leder, revisor mv.) med navn og fødselsdato | Brønnøysundregistrene, Enhetsregisteret/rolledata (NLOD 1.0) | Alle rolleinnehavere |
| Selskapsdata og regnskapstall | Brreg Enhets- og Regnskapsregisteret | Ikke personopplysninger (unntatt ENK-navn) |

Det behandles **ikke**: fødselsnummer, gateadresser, kontaktinformasjon, eller opplysninger uten
tilknytning til økonomiske roller. Datamimimering er dermed innebygget i kildevalget.

## 2. Berettiget interesse (trinn 1)

- **Åpenhet om eierskap og makt i næringslivet** er en lovfestet samfunnsinteresse: aksjeeierboken er
  offentlig (aksjeloven § 4-6), aksjonærregisteret har en egen innsynsordning, og hvitvaskingsregelverket
  pålegger tusenvis av rapporteringspliktige å kartlegge reelle rettighetshavere selvstendig.
- Tjenestens formål: gjøre allerede offentlige opplysninger *faktisk* tilgjengelige — visualisert,
  søkbare, med historikk og kjeder — for journalistikk, forskning, kontroll av forretningsforbindelser
  og AML-arbeid. Det offisielle RRR-registeret er egenrapportert, uten kjeder og historikk; uavhengig
  verifisering forutsetter verktøy som dette.
- Interessen er reell, aktuell og lovlig — både behandlingsansvarliges (drift/kommersialisering) og
  tredjeparters (brukernes) interesse, jf. ordlyden i art. 6 nr. 1 f.

## 3. Nødvendighet (trinn 2)

Formålet kan ikke oppnås med mindre inngripende midler:
- Anonymisering/pseudonymisering ville fjerne selve informasjonsverdien (hvem eier hva).
- Publisering uten historikk ville hindre ettergåelse av endringer — en kjernedel av både
  journalistisk og AML-formålet.
- Omfanget er begrenset til rolle-/eierskapsopplysninger; ingen overskuddsinformasjon hentes inn.

## 4. Avveining mot den registrertes interesser (trinn 3)

**Inngrepets karakter:** opplysningene gjelder personers *økonomiske/yrkesmessige sfære*, ikke privatlivet.
EU-domstolen og norsk høyesterett tillegger dette stor vekt. Aksjeeierskap og styreverv er frivillige,
utadrettede handlinger i næringslivet med lovbestemt offentlighet.

**Rimelige forventninger:** aksjonærer og rolleinnehavere må forvente offentlighet — aksjeloven § 4-6,
innsynsordningen, og etablert presse-/kommersiell praksis (Proff, 1881, aksjeeiere.no, medienes årlige
dekning av skattelister/aksjonærregisteret) har skapt en normaltilstand av offentlighet for disse dataene.

**Rettspraksis:**
- **HR-2021-2403-A (Legelisten):** kommersiell publisering og systematisering av opplysninger knyttet
  til yrkesutøvelse godtatt etter art. 6 nr. 1 f; de registrertes interesse i å slippe omtale av
  yrkesutøvelse veier ikke tyngre enn allmennhetens informasjonsbehov. Aksjegrafen står sterkere:
  ingen subjektive vurderinger publiseres, kun registerdata.
- **C-37/20 (Luxembourg Business Registers):** ubegrenset *allmenn* tilgang til RRR-data ble kjent
  ugyldig — men avgjørelsen gjaldt sentraliserte myndighetsregistre pålagt ved direktiv, ikke privat
  viderebruk av nasjonalt lovlig offentliggjorte data. Norge har etter dette selv gjeninnført offentlig
  RRR-innsyn. Risikoen overvåkes (se pkt. 7).

**Mulige skadevirkninger og avbøtende tiltak:**

| Risiko | Tiltak |
|---|---|
| Uønsket eksponering av enkeltpersoner | Kun rolleopplysninger; ingen adresser/kontaktinfo; protestkanal (art. 21) med individuell vurdering |
| Feilaktige data fra kildene | Kildeside med vintage-merking ("per 31.12.20XX"), rettekanal, henvisning til retting hos kilden |
| Gjenbruk til andre formål (scraping) | Åpent API er bevisst valg (samme data er offentlige); revurderes ved misbrukssignaler |
| Profilering over tid via historikk | Historikk er selve formålet (ettergåelse); begrenset til årlige øyeblikksbilder av eierskap |

**Barn:** aksjonærregisteret kan inneholde mindreårige aksjonærer (arv/gaver). Kun navn, fødselsår og
eierpost vises — samme som for voksne. Protest fra/på vegne av mindreårige gis særlig vekt i
enkeltvurderinger, jf. fortalepunkt 38.

**Konklusjon:** de registrertes interesser veier ikke tyngre enn de berettigede interessene.
Behandlingen er lovlig etter art. 6 nr. 1 f.

## 5. Informasjonsplikt og rettigheter (gjennomførte tiltak)

- **Art. 14-erklæring:** publisert på `/personvern` (kilde, kategorier, formål, grunnlag, lagringstid,
  rettigheter, klageadgang). Individuell underretning av >1M registrerte er umulig/uforholdsmessig,
  jf. art. 14 nr. 5 b — offentlig erklæring er da riktig virkemiddel.
- **Kildeside:** publisert på `/kilder` (kilder, oppdateringsfrekvens, NLOD-attribusjon, forbehold).
- **Protest-/rettekanal:** e-post (hei@aksjegrafen.com), lenket fra begge sider. Protester
  behandles individuelt og uten ugrunnet opphold; ved berettiget protest fjernes/skjermes personen.
  *Rutine: loggfør mottak, vurdering og utfall av hver henvendelse (egen logg, ikke i repo).*

## 6. Restpunkter / to-do

- [ ] Vurder eget kontaktpunkt (f.eks. personvern@aksjegrafen.com) når volumet tilsier det
- [ ] Etabler protest-logg (regneark er nok) første gang en henvendelse mottas
- [ ] Ved lansering av varslings-/overvåkningsfunksjoner (track 3): ny vurdering — løpende monitorering
  av enkeltpersoner er et vesentlig større inngrep enn oppslag
- [ ] DPIA-vurdering (art. 35): trolig ikke påkrevd i dag (offentlige data, ingen særlige kategorier),
  men dokumentér vurderingen eksplisitt ved neste revisjon

## 7. Overvåkningspunkter

- Datatilsynets praksis mot aksjonær-/rolledatatjenester (ingen kjente saker per juli 2026)
- Ny C-37/20-lignende praksis fra EU-domstolen om viderebruk av registerdata
- Forslaget om samordnet aksjeeierregister (kan endre både konkurransebildet og rettsgrunnlaget)

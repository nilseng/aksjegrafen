# Pitch: Kode24 (hei@kode24.no)

**Vinkel:** hobbyprosjekt/tech — én utvikler, D3 + Neo4j + hele det norske aksjonærregisteret.
**Status:** UTKAST — fyll inn [plassholdere] og faktasjekk tall før sending.
**Timing:** kan sendes når som helst; Kode24 elsker hobbyprosjekt-historier. Vurder å time mot en
produktmilepæl (portal-side eller indirekte eierskap fra track 3) for en "og nå har jeg lansert X"-krok.

---

**Emne:** Jeg bygde en graf over hvem som eier norske selskaper — med Neo4j, D3 og [1,7M+] rader fra Skatteetaten

Hei Kode24!

Jeg er [navn], [rolle/dagjobb], og på fritiden har jeg bygget [aksjegrafen.com](https://aksjegrafen.com) —
en interaktiv graf over eierskap i norske aksjeselskaper. Du kan søke opp et selskap eller en person,
utforske eiernettverket visuelt, og til og med finne korteste vei mellom to aktører ("hvordan henger
investor A sammen med selskap B?").

Tenkte det kunne passe som utviklerhistorie hos dere. Litt om det tekniske:

- **Data:** Skatteetatens aksjonærregister (bulk-CSV, [1,7M+] rader per år, 2014→i dag) + Enhetsregisteret
  og rolledata fra Brønnøysundregistrene (NLOD-lisens).
- **Graf:** Neo4j selvdriftet på EC2. Selskaper og personer som noder, eierskap per år og roller som
  kanter. Korteste-vei-søk er en ren graf-spørring — omtrent umulig å gjøre raskt i en relasjonsdatabase.
- **Frontend:** React + D3 force-graph. Å få en force-simulering til å føles god med store nettverk var
  [halve jobben — kort anekdote her, f.eks. om ytelsesoptimalisering eller kanter med flere roller].
- **Stack ellers:** Express + MongoDB Atlas for søk og metadata, Heroku for appen.
- **Import-smerte:** registeret slippes som CSV én gang i året (ingen API!), så mai er "julaften" —
  [kort anekdote om importkjøring her].

Hvorfor det er interessant utover det tekniske: det finnes faktisk ikke noe gratis verktøy i Norge som
viser eierskap som utforskbar graf med historikk. Journalister og folk som jobber med hvitvaskingskontroll
graver i dette manuelt i dag.

Jeg stiller gjerne opp med skjermbilder (grafen er ganske fotogen), kodeeksempler eller en gjennomgang
av arkitekturen — eller skriver et gjestebidrag hvis dere heller vil det.

Mvh
[navn]
[telefon] · [e-post] · aksjegrafen.com

---

## Sjekkliste før sending

- [ ] Faktasjekk radantall per år (kjør `wc -l` på siste CSV eller tell i Mongo) — ikke send "[1,7M+]" ukorrigert
- [ ] Fyll inn de to anekdotene (force-graph-ytelse; importkjøring) — det er disse Kode24 faktisk siterer
- [ ] Legg ved 2–3 skjermbilder: et kjent selskaps nettverk, et korteste-vei-resultat, historikkvisning
- [ ] Kilder/om-oss-siden må være live før sending (troverdighet når de klikker rundt)

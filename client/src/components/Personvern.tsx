import { useContext } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../AppContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { InfoPageNav } from "./InfoPageNav";

export const Personvern = () => {
  const { theme } = useContext(AppContext);
  useDocumentTitle("Personvernerklæring");
  return (
    <div
      className="w-full max-w-2xl h-full overflow-y-auto rounded p-4"
      style={{ maxWidth: "750px", backgroundColor: theme.backgroundSecondary, color: theme.text, ...theme.lowering }}
    >
      <InfoPageNav />
      <h5 className="text-xl font-bold pb-4">Personvernerklæring</h5>
      <p className="text-sm pb-4">
        <span className="font-bold" style={{ color: theme.primary }}>
          aksjegrafen.com
        </span>{" "}
        publiserer opplysninger fra offentlige registre om eierskap og roller i norsk næringsliv. Denne erklæringen
        forklarer hvilke personopplysninger som behandles, hvorfor, og hvilke rettigheter du har. Den er utformet for å
        oppfylle informasjonsplikten i personvernforordningen (GDPR) artikkel 14, siden opplysningene ikke er samlet inn
        fra deg, men fra offentlige kilder.
      </p>

      <h5 className="text-lg font-bold">Behandlingsansvarlig</h5>
      <p className="text-sm pb-4">
        Aksjegrafen v/Teodor Nilseng er behandlingsansvarlig for tjenesten. Kontakt:{" "}
        <code>hei@aksjegrafen.com</code>.
      </p>

      <h5 className="text-lg font-bold">Hvilke opplysninger behandles, og hvor de kommer fra</h5>
      <p className="text-sm pb-2">
        Tjenesten viser opplysninger om personer i deres økonomiske roller — som aksjonær, styremedlem eller daglig
        leder:
      </p>
      <ul className="text-sm list-disc pl-6 pb-2">
        <li>
          Fra <span className="font-semibold">Skatteetatens aksjonærregister</span>: navn, fødselsår, postnummer og
          poststed for personlige aksjonærer, samt hvilke selskaper de eier aksjer i, antall aksjer og aksjeklasse, per
          31.12. for hvert år fra 2015.
        </li>
        <li>
          Fra <span className="font-semibold">Brønnøysundregistrene</span>: roller i selskaper (for eksempel
          styreleder, styremedlem, daglig leder) med navn og fødselsdato slik de er registrert i Enhetsregisteret.
        </li>
      </ul>
      <p className="text-sm pb-4">
        Det behandles ikke fødselsnummer, bostedsadresser ut over postnummer/poststed, eller opplysninger av privat
        karakter. Se <Link to="/kilder" className="underline" style={{ color: theme.primary }}>kildesiden</Link> for
        detaljer om kildene og oppdateringsfrekvens.
      </p>

      <h5 className="text-lg font-bold">Formål og behandlingsgrunnlag</h5>
      <p className="text-sm pb-4">
        Formålet er åpenhet om eierskap og maktforhold i norsk næringsliv: å gjøre offentlig tilgjengelige opplysninger
        faktisk tilgjengelige og forståelige, blant annet for journalistikk, forskning, kontroll av forretningsforbindelser
        og arbeid mot hvitvasking. Behandlingsgrunnlaget er berettiget interesse etter GDPR artikkel 6 nr. 1 bokstav f.
        Interesseavveiningen bygger på at opplysningene gjelder personers økonomiske roller — ikke privatlivet — at de
        allerede er offentlige i norske registre, og at åpenhet om eierskap er en lovfestet samfunnsinteresse. Høyesterett
        har i Legelisten-dommen (HR-2021-2403-A) lagt til grunn at tilsvarende publisering av opplysninger knyttet til
        personers yrkesutøvelse kan skje på dette grunnlaget.
      </p>

      <h5 className="text-lg font-bold">Lagringstid</h5>
      <p className="text-sm pb-4">
        Historikk er en del av tjenestens formål: eierskap vises per år fra 2015 og fremover, slik at endringer over tid
        kan ettergås. Opplysningene lagres derfor så lenge tjenesten består, med mindre en protest eller retting fører
        til at de fjernes.
      </p>

      <h5 className="text-lg font-bold">Dine rettigheter</h5>
      <ul className="text-sm list-disc pl-6 pb-4">
        <li>
          <span className="font-semibold">Innsyn og retting:</span> du kan be om innsyn i hvilke opplysninger tjenesten
          viser om deg, og be om retting dersom noe er feil. Merk at feil som stammer fra registrene også bør rettes hos
          kilden (Skatteetaten eller Brønnøysundregistrene), ellers vil de komme inn igjen ved neste oppdatering.
        </li>
        <li>
          <span className="font-semibold">Protest (artikkel 21):</span> du kan protestere mot publisering ut fra din
          særlige situasjon. Send en e-post til <code>hei@aksjegrafen.com</code> med navn og hva protesten gjelder,
          så behandles den uten ugrunnet opphold.
        </li>
        <li>
          <span className="font-semibold">Klage:</span> du kan klage til{" "}
          <a
            href="https://www.datatilsynet.no"
            target="_blank"
            rel="noreferrer"
            className="underline"
            style={{ color: theme.primary }}
          >
            Datatilsynet
          </a>{" "}
          dersom du mener behandlingen er i strid med regelverket.
        </li>
      </ul>

      <h5 className="text-lg font-bold">Besøksdata og informasjonskapsler</h5>
      <p className="text-sm pb-4">
        Tjenesten bruker Google Analytics til anonym besøksstatistikk og Sentry til feilsporing. I tillegg logges enkelte
        hendelser i tjenesten (for eksempel at en graf eller tabell er åpnet, med hvilket selskap) for å forstå hvilke
        funksjoner som brukes — disse knyttes ikke til hvem du er. Ingen besøksdata selges eller deles ut over dette.
      </p>
    </div>
  );
};

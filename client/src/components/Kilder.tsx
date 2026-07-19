import { useContext } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../AppContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { InfoPageNav } from "./InfoPageNav";

interface ISource {
  name: string;
  provider: string;
  content: string;
  update: string;
  url: string;
}

const sources: ISource[] = [
  {
    name: "Aksjonærregisteret",
    provider: "Skatteetaten",
    content:
      "Aksjonærer, antall aksjer og aksjeklasser i norske aksje- og allmennaksjeselskaper. Grunnlaget for eierskapsgrafen og eierhistorikken. Dekker regnskapsårene 2015–2025, med eierforhold slik de var per 31.12. det enkelte år.",
    update:
      "Oppdateres årlig. Skatteetaten tilgjengeliggjør data for foregående år i mai, basert på selskapenes aksjonærregisteroppgaver.",
    url: "https://www.skatteetaten.no/deling/aksjonarregisteret/",
  },
  {
    name: "Enhetsregisteret",
    provider: "Brønnøysundregistrene",
    content:
      "Grunndata om selskaper og andre enheter: organisasjonsnummer, navn, adresse, organisasjonsform, næringskode, antall ansatte og registreringsstatus.",
    update: "Hentes direkte fra Brønnøysundregistrenes åpne API ved oppslag, og er dermed løpende oppdatert.",
    url: "https://data.brreg.no/enhetsregisteret/api/docs/index.html",
  },
  {
    name: "Rolleregisteret",
    provider: "Brønnøysundregistrene",
    content:
      "Roller i selskaper, som styreleder, styremedlemmer, daglig leder og revisor. Vises som forbindelser i grafen.",
    update: "Importeres periodisk fra Brønnøysundregistrenes totalbestand av roller.",
    url: "https://data.brreg.no/enhetsregisteret/api/docs/index.html",
  },
  {
    name: "Regnskapsregisteret",
    provider: "Brønnøysundregistrene",
    content: "Regnskapstall som driftsinntekter, resultat, eiendeler, egenkapital og gjeld for det siste regnskapsåret.",
    update: "Hentes direkte fra Regnskapsregisterets åpne API ved oppslag.",
    url: "https://data.brreg.no/regnskapsregisteret/regnskap/swagger-ui/index.html",
  },
];

export const Kilder = () => {
  const { theme } = useContext(AppContext);
  useDocumentTitle("Kilder og datagrunnlag");
  return (
    <div
      className="w-full max-w-2xl h-full overflow-y-auto rounded p-4"
      style={{ maxWidth: "750px", backgroundColor: theme.backgroundSecondary, color: theme.text, ...theme.lowering }}
    >
      <InfoPageNav />
      <h5 className="text-xl font-bold pb-4">Kilder og datagrunnlag</h5>
      <p className="text-sm pb-4">
        <span className="font-bold" style={{ color: theme.primary }}>
          aksjegrafen.com
        </span>{" "}
        visualiserer eierskap og roller i norsk næringsliv som en interaktiv graf. All informasjon er hentet fra
        offentlige registre. Denne siden beskriver hvilke kilder som brukes, hva de inneholder og hvor ofte de
        oppdateres. Se også <Link to="/personvern" className="underline" style={{ color: theme.primary }}>personvernerklæringen</Link>.
      </p>
      {sources.map((source) => (
        <div key={source.name} className="pb-4">
          <h5 className="text-lg font-bold">
            {source.name} <span className="text-sm font-normal" style={{ color: theme.muted }}>({source.provider})</span>
          </h5>
          <p className="text-sm pb-1">{source.content}</p>
          <p className="text-sm pb-1">{source.update}</p>
          <p className="text-xs">
            <a href={source.url} target="_blank" rel="noreferrer" className="underline" style={{ color: theme.primary }}>
              Om kilden hos {source.provider}
            </a>
          </p>
        </div>
      ))}
      <h5 className="text-lg font-bold">Lisens</h5>
      <p className="text-sm pb-4">
        Tjenesten inneholder data fra Brønnøysundregistrene som er gjort tilgjengelig under{" "}
        <a
          href="https://data.norge.no/nlod/no/2.0"
          target="_blank"
          rel="noreferrer"
          className="underline"
          style={{ color: theme.primary }}
        >
          Norsk lisens for offentlige data (NLOD)
        </a>
        , samt data fra Skatteetatens aksjonærregister utlevert etter innsynsordningen for aksjonærregisteret.
      </p>
      <h5 className="text-lg font-bold">Datakvalitet og forbehold</h5>
      <p className="text-sm pb-4">
        Opplysningene gjengis slik de er rapportert til registrene, og feil i innrapporteringen vil derfor også kunne
        forekomme her. Aksjonærdata viser eierforhold per 31.12. det enkelte år og fanger ikke opp endringer gjennom
        året. Tjenesten er et hjelpemiddel for å utforske offentlige data og er ikke en garanti for at opplysningene er
        fullstendige eller korrekte. Ved viktige beslutninger bør opplysningene verifiseres mot kildene.
      </p>
      <h5 className="text-lg font-bold">Feil i data?</h5>
      <p className="text-sm pb-4">
        Oppdager du feil, eller har du spørsmål om datagrunnlaget? Send en e-post til{" "}
        <code>hei@aksjegrafen.com</code>. Gjelder det opplysninger om deg selv, se{" "}
        <Link to="/personvern" className="underline" style={{ color: theme.primary }}>
          personvernerklæringen
        </Link>{" "}
        for hvordan du kan be om retting eller protestere mot publisering.
      </p>
    </div>
  );
};

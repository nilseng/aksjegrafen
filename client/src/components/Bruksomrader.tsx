import { useContext } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../AppContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { InfoPageNav } from "./InfoPageNav";

interface IUseCase {
  title: string;
  ingress: string;
  bullets: string[];
  cta: string;
}

const useCases: IUseCase[] = [
  {
    title: "Hvem eier egentlig et norsk selskap?",
    ingress:
      "Skriv inn et selskapsnavn eller organisasjonsnummer og se hele eiernettverket som en interaktiv graf — aksjonærer, datterselskaper og roller, hentet fra Skatteetatens aksjonærregister og Brønnøysundregistrene.",
    bullets: [
      "Alle aksjonærer med antall aksjer og eierandel — også de som ikke vises i årsrapporten",
      "Se videre oppover: hvem eier eierne? Utforsk kjeder i flere ledd",
      "Styre- og lederroller i samme graf",
    ],
    cta: "Søk opp et selskap",
  },
  {
    title: "Hvordan henger to aktører sammen?",
    ingress:
      "Velg to aktører og la grafen finne veien mellom dem: eierskap, felles investorer, styreverv. Det som ville tatt timer med manuelle registeroppslag, tar sekunder.",
    bullets: [
      "Korteste vei mellom to vilkårlige aktører i norsk næringsliv",
      "Alle veier — se hvert eierledd og hver rolle på veien",
      "Perfekt for habilitetssjekk, research og kildearbeid",
    ],
    cta: "Prøv relasjonssøket",
  },
  {
    title: "Hvem eide selskapet — år for år siden 2015?",
    ingress:
      "Aksjegrafen har hele aksjonærregisterets historikk. Se hvordan eierskapet har endret seg år for år: hvem kom inn, hvem solgte seg ut, og når det skjedde.",
    bullets: [
      "Eierforhold per 31.12. hvert år, 2015 til i dag",
      "Følg en investor: alle investeringer over tid",
      "Datagrunnlag med tydelig årsmerking — sitérbart i research og dokumentasjon",
    ],
    cta: "Slå opp et selskaps historikk",
  },
  {
    title: "Verifiser reelle rettighetshavere — ikke bare det som er egenrapportert",
    ingress:
      "RRR-registeret viser det selskapene selv har meldt inn. Hvitvaskingsloven krever at du kontrollerer det. Aksjegrafen viser faktiske eierkjeder fra aksjonærregisteret, ledd for ledd, med historikk — et uavhengig grunnlag for kundetiltakene dine.",
    bullets: [
      "Se hele eierkjeden bak et selskap, ikke bare første ledd",
      "Avdekk indirekte eierskap som ikke fremgår av RRR-registeret",
      "Historikk tilbake til 2015 — dokumentér eierskap på tidspunktet det gjaldt",
      "Kilder og datavintage oppgitt på alt — etterprøvbart i AML-mappen",
    ],
    cta: "Kartlegg en kunde nå",
  },
];

export const Bruksomrader = () => {
  const { theme } = useContext(AppContext);
  useDocumentTitle("Bruksområder");
  return (
    <div
      className="w-full max-w-2xl h-full overflow-y-auto rounded p-4"
      style={{ maxWidth: "750px", backgroundColor: theme.backgroundSecondary, color: theme.text, ...theme.lowering }}
    >
      <InfoPageNav />
      <h5 className="text-xl font-bold pb-4">Hva kan du bruke Aksjegrafen til?</h5>
      <p className="text-sm pb-4">
        <span className="font-bold" style={{ color: theme.primary }}>
          aksjegrafen.com
        </span>{" "}
        gjør offentlige eierskapsdata faktisk tilgjengelige: visualisert, søkbare og med historikk. Her er de fire
        vanligste bruksområdene.
      </p>
      {useCases.map((useCase) => (
        <div key={useCase.title} className="pb-6">
          <h5 className="text-lg font-bold pb-1">{useCase.title}</h5>
          <p className="text-sm pb-2">{useCase.ingress}</p>
          <ul className="text-sm list-disc pl-6 pb-2">
            {useCase.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
          <Link to="/">
            <button className="rounded text-white text-xs px-3 py-2" style={{ backgroundColor: theme.primary }}>
              {useCase.cta} →
            </button>
          </Link>
        </div>
      ))}
      <p className="text-xs" style={{ color: theme.muted }}>
        Alle data kommer fra offentlige registre — se <Link to="/kilder" className="underline">kilder og datagrunnlag</Link>.
        Tjenesten er gratis å bruke.
      </p>
    </div>
  );
};

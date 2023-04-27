import { useContext } from "react";
import { Container } from "react-bootstrap";
import { AppContext } from "../AppContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { EndpointDescription } from "./EndpointDescription";

const baseUrl = "https://www.aksjegrafen.com/api";

export const ApiDocs = () => {
  const { theme } = useContext(AppContext);
  useDocumentTitle("API-dokumentasjon");
  return (
    <Container
      className="h-100 overflow-auto rounded p-4"
      style={{ maxWidth: "750px", backgroundColor: theme.backgroundSecondary, ...theme.lowering }}
    >
      <h5>API for aksjonærregisteret</h5>
      <p>
        Det åpne API-et til{" "}
        <span className="font-weight-bold" style={{ color: theme.primary }}>
          aksjegrafen.com
        </span>{" "}
        gir utviklere tilgang til all data om aksjonærer og selskaper i aksjonærregisteret. APIet gjør det mulig for
        tredjepartsapplikasjoner å integrere seg på en enkel måte. Ved å bruke API-et kan utviklere hente ut informasjon
        om aksjonærer i ulike selskaper, aksjonærstruktur og endringer i eierskap over tid. API-et kan brukes av både
        investorer og utviklere som ønsker å lage applikasjoner for å analysere og visualisere aksje- og eierskapsdata.
      </p>
      <h5>Endepunkter</h5>
      <EndpointDescription
        title={"Søk etter selskap"}
        baseUrl={baseUrl}
        path={"/company"}
        params={[{ name: "searchTerm", description: "organisasjonsnummer og/eller navn på selskapet" }]}
        query={[{ name: "limit", description: "maks antall søkeresultater. Default er 10." }]}
      />
      <EndpointDescription
        title={"Søk etter aksjonær"}
        baseUrl={baseUrl}
        path={"/shareholder"}
        params={[{ name: "searchTerm", description: "organisasjonsnummer og/eller navn på aksjonæren" }]}
        query={[{ name: "limit", description: "maks antall søkeresultater. Default er 10." }]}
      />
      <EndpointDescription
        title={"Hent investeringene til en aksjonær"}
        baseUrl={baseUrl}
        path={"/investments"}
        query={[
          {
            name: "shareholderOrgnr",
            description: "organisasjonsnummeret i tilfelle aksjonæren er et selskap. (OPTIONAL)",
          },
          {
            name: "shareholderId",
            description:
              "id for aksjonæren i tilfelle aksjonæren er en privatperson, utenlandsk selskap e.l. (OPTIONAL)",
          },
          { name: "limit", description: "maks antall søkeresultater. Default er 10." },
          { name: "skip", description: "hopp over et antall investeringer. (OPTIONAL)" },
        ]}
      />
      <EndpointDescription
        title={"Hent aksjonærene i et selskap"}
        baseUrl={baseUrl}
        path={"/investors"}
        query={[
          {
            name: "orgnr",
            description: "organisasjonsnummeret til selskapet.",
          },
          { name: "limit", description: "maks antall søkeresultater. Default er 10." },
          { name: "skip", description: "hopp over et antall aksjonærer. (OPTIONAL)" },
        ]}
      />
      <p>
        Har du en tilbakemelding, ønsker om endringer eller annen funksjonalitet? Send en mail til{" "}
        <code>teodor.nilseng@gmail.com</code>.
      </p>
    </Container>
  );
};

import { useContext } from "react";
import { Container } from "react-bootstrap";
import { AppContext } from "../AppContext";

export const ApiDocs = () => {
  const { theme } = useContext(AppContext);
  return (
    <Container className="h-100 overflow-auto p-4" style={{ maxWidth: "750px" }}>
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
      <p className="small font-weight-bold m-0">Søk etter selskap</p>
      <code>
        https://www.aksjegrafen.com/api/company/{"{searchTerm}"}?limit={"{limit}"}
      </code>
      <p className="m-0">
        <code>searchTerm</code> - organisasjonsnummer og/eller navn på selskapet
      </p>
      <p>
        <code>limit</code> - maks antall søkeresultater. Default er 10.
      </p>
      <p className="small font-weight-bold m-0">Søk etter aksjonær</p>
      <code>
        https://www.aksjegrafen.com/api/shareholder/{"{searchTerm}"}?limit={"{limit}"}
      </code>
      <p className="m-0">
        <code>searchTerm</code> - organisasjonsnummer og/eller navn på aksjonæren
      </p>
      <p>
        <code>limit</code> - maks antall søkeresultater. Default er 10.
      </p>
      <p className="small font-weight-bold m-0">Hent investeringene til en aksjonær</p>
      <code>
        https://www.aksjegrafen.com/api/investments?shareholderOrgnr={"{shareholderOrgnr}"}&shareholderId=
        {"{shareholderId}"}&limit={"{limit}"}&skip={"{skip}"}
      </code>
      <p className="m-0">
        <code>shareholderOrgnr</code> - organisasjonsnummeret i tilfelle aksjonæren er et selskap. (OPTIONAL)
      </p>
      <p className="m-0">
        <code>shareholderId</code> - id for aksjonæren i tilfelle aksjonæren er en privatperson, utenlandsk selskap e.l.
        (OPTIONAL)
      </p>
      <p className="m-0">
        <code>skip</code> - hopp over et antall aksjonærer. (OPTIONAL)
      </p>
      <p>
        <code>limit</code> - maks antall søkeresultater. Default er 100.
      </p>
      <p className="small font-weight-bold m-0">Hent aksjonærene i et selskap</p>
      <code>
        https://www.aksjegrafen.com/api/investors?orgnr={"{orgnr}"}&limit={"{limit}"}&skip={"{skip}"}
      </code>
      <p className="m-0">
        <code>orgnr</code> - organisasjonsnummeret til selskapet.
      </p>
      <p className="m-0">
        <code>skip</code> - hopp over et antall aksjonærer. (OPTIONAL)
      </p>
      <p>
        <code>limit</code> - maks antall søkeresultater. Default er 100.
      </p>
      <p>
        Har du en tilbakemelding, ønsker om endringer eller annen funksjonalitet? Send en mail til{" "}
        <code>teodor.nilseng@gmail.com</code>.
      </p>
    </Container>
  );
};

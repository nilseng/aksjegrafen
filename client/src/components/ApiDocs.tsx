import { useContext } from "react";
import { AppContext } from "../AppContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { EndpointDescription } from "./EndpointDescription";
import { InfoPageNav } from "./InfoPageNav";

const baseUrl = "https://www.aksjegrafen.com/api";

export const ApiDocs = () => {
  const { theme } = useContext(AppContext);
  useDocumentTitle("API-dokumentasjon");
  return (
    <div
      className="w-full max-w-2xl h-full overflow-y-auto rounded p-4"
      style={{ maxWidth: "750px", backgroundColor: theme.backgroundSecondary, color: theme.text, ...theme.lowering }}
    >
      <InfoPageNav />
      <h5 className="text-xl font-bold pb-4">API for aksjonærregisteret</h5>
      <p className="text-sm pb-4">
        Det åpne API-et til{" "}
        <span className="font-bold" style={{ color: theme.primary }}>
          aksjegrafen.com
        </span>{" "}
        gir utviklere tilgang til all data om aksjonærer og selskaper i aksjonærregisteret. APIet gjør det mulig for
        tredjepartsapplikasjoner å integrere seg på en enkel måte. Ved å bruke API-et kan utviklere hente ut informasjon
        om aksjonærer i ulike selskaper, aksjonærstruktur og endringer i eierskap over tid. API-et kan brukes av både
        investorer og utviklere som ønsker å lage applikasjoner for å analysere og visualisere aksje- og eierskapsdata.
      </p>
      <h5 className="text-lg font-bold pb-2">Kvoter og API-nøkler</h5>
      <p className="text-sm pb-2">
        API-et er åpent og gratis. Anonyme kall er hastighetsbegrenset for å holde tjenesten stabil for alle.
        Ønsker du høyere eller ubegrenset kvote, bruk en API-nøkkel — send den som HTTP-headeren <code>x-api-key</code>.
        Alle svar inneholder <code>RateLimit-*</code>-headere som viser gjenværende kvote, og endepunktet{" "}
        <code>/usage</code> viser din nåværende tier og kvote.
      </p>
      <ul className="text-sm pb-4 list-disc pl-5">
        <li>
          <span className="font-bold">Anonym</span> (uten nøkkel): begrenset antall kall per minutt.
        </li>
        <li>
          <span className="font-bold">Gratis nøkkel</span>: høyere kvote.
        </li>
        <li>
          <span className="font-bold">Betalt nøkkel</span>: ingen hastighetsbegrensning.
        </li>
      </ul>
      <p className="text-sm pb-4">
        Ønsker du en API-nøkkel eller ubegrenset tilgang? Kontakt <code>hei@aksjegrafen.com</code>.
      </p>
      <h5 className="text-lg font-bold">Endepunkter</h5>
      <EndpointDescription
        title={"Søk etter selskap"}
        baseUrl={baseUrl}
        path={"/company"}
        params={[
          { name: "searchTerm", example: "Telenor", description: "organisasjonsnummer og/eller navn på selskapet" },
        ]}
        query={[{ name: "limit", example: 1, description: "maks antall søkeresultater. Default er 10." }]}
        exampleResponse={`
[
    {
        "_id": "61229167c79b48b7e3e0bc90",
        "orgnr": "982463718",
        "name": "TELENOR ASA",
        "stocks": 1399458033,
        "investorCount": { "2019": 39472, "2020": 47080, "2021": 55667 },
        "investmentCount": { "2019": 36, "2020": 14, "2021": 14 },
        "shares": { "2019": { "total": 1442458032 }, "2020": { "total": 1399458033 }, "2021": { "total": 1399458033 } }
    }
]`}
      />
      <EndpointDescription
        title={"Søk etter aksjonær"}
        baseUrl={baseUrl}
        path={"/shareholder"}
        params={[
          { name: "searchTerm", example: "Telenor", description: "organisasjonsnummer og/eller navn på aksjonæren" },
        ]}
        query={[{ name: "limit", example: 1, description: "maks antall søkeresultater. Default er 10." }]}
        exampleResponse={`
[
    {
        "_id": "61229192c79b48b7e3e461f2",
        "id": "TELENOR ASA9824637181331 FORNEBUNOR",
        "countryCode": "NOR",
        "kind": 0,
        "location": "FORNEBU",
        "name": "TELENOR ASA",
        "orgnr": "982463718",
        "yearOfBirth": null,
        "zipCode": "1331",
        "investmentCount": { "2019": 36, "2020": 14, "2021": 14 }
    }
]
          `}
      />
      <EndpointDescription
        title={"Hent investeringene til en aksjonær"}
        baseUrl={baseUrl}
        path={"/investments"}
        query={[
          {
            name: "shareholderOrgnr",
            example: "982463718",
            description: "organisasjonsnummeret i tilfelle aksjonæren er et selskap. (OPTIONAL)",
          },
          {
            name: "shareholderId",
            description:
              "id for aksjonæren i tilfelle aksjonæren er en privatperson, utenlandsk selskap e.l. (OPTIONAL)",
          },
          { name: "limit", example: 1, description: "maks antall søkeresultater. Default er 10." },
          { name: "skip", example: 0, description: "hopp over et antall investeringer. (OPTIONAL)" },
        ]}
        exampleResponse={`
[
    {
        "_id": "627ed35bffdad219a1a401ea",
        "orgnr": "985173710",
        "shareHolderId": "TELENOR ASA9824637181331 FORNEBUNOR",
        "shareholderOrgnr": "982463718",
        "holdings": {
            "2019": { "Ordinære aksjer": 659165, "total": 659165 },
            "2020": { "Ordinære aksjer": 659165, "total": 659165 },
            "2021": { "Ordinære aksjer": 659165, "total": 659165 }
        },
        "investment": {
            "_id": "61229169c79b48b7e3e103b3",
            "orgnr": "985173710",
            "name": "TELENOR MARITIME AS",
            "stocks": 666294,
            "investorCount": { "2019": 2, "2020": 2, "2021": 2 },
            "shares": { "2019": { "total": 666294 }, "2020": { "total": 666294 }, "2021": { "total": 666294 } }
        }
    }
]
          `}
      />
      <EndpointDescription
        title={"Hent aksjonærene i et selskap"}
        baseUrl={baseUrl}
        path={"/investors"}
        query={[
          {
            name: "orgnr",
            example: "985173710",
            description: "organisasjonsnummeret til selskapet.",
          },
          { name: "limit", example: 1, description: "maks antall søkeresultater. Default er 10." },
          { name: "skip", description: "hopp over et antall aksjonærer. (OPTIONAL)" },
        ]}
        exampleResponse={`
[
    {
        "_id": "627ed35bffdad219a1a401ea",
        "orgnr": "985173710",
        "shareHolderId": "TELENOR ASA9824637181331 FORNEBUNOR",
        "shareholderOrgnr": "982463718",
        "holdings": {
            "2019": { "Ordinære aksjer": 659165, "total": 659165 },
            "2020": { "Ordinære aksjer": 659165, "total": 659165 },
            "2021": { "Ordinære aksjer": 659165, "total": 659165 }
        },
        "investor": {
            "shareholder": {
                "_id": "61229192c79b48b7e3e461f2",
                "id": "TELENOR ASA9824637181331 FORNEBUNOR",
                "countryCode": "NOR",
                "kind": 0,
                "location": "FORNEBU",
                "name": "TELENOR ASA",
                "orgnr": "982463718",
                "yearOfBirth": null,
                "zipCode": "1331",
                "investmentCount": { "2019": 36, "2020": 14, "2021": 14 }
            },
            "company": {
                "_id": "61229167c79b48b7e3e0bc90",
                "orgnr": "982463718",
                "name": "TELENOR ASA",
                "stocks": 1399458033,
                "investorCount": { "2019": 39472, "2020": 47080, "2021": 55667 },
                "investmentCount": { "2019": 36, "2020": 14, "2021": 14 },
                "shares": { "2019": { "total": 1442458032 }, "2020": { "total": 1399458033 }, "2021": { "total": 1399458033 } }
            }
        }
    }
]`}
      />
      <EndpointDescription
        title={"Hent alle selskaper"}
        baseUrl={baseUrl}
        path={"/companies"}
        query={[
          {
            name: "limit",
            example: 100,
            description: "maks antall selskaper. Utelat for å hente hele registeret (streames).",
          },
        ]}
        exampleResponse={`
[
    {
        "_id": "61229167c79b48b7e3e0bc90",
        "orgnr": "982463718",
        "name": "TELENOR ASA",
        "stocks": 1399458033,
        "investorCount": { "2024": 61000, "2025": 62000 },
        "shares": { "2024": { "total": 1399458033 }, "2025": { "total": 1399458033 } }
    }
]`}
      />
      <EndpointDescription
        title={"Hent alle aksjonærer"}
        baseUrl={baseUrl}
        path={"/shareholders"}
        query={[
          {
            name: "limit",
            example: 100,
            description: "maks antall aksjonærer. Utelat for å hente hele registeret (streames).",
          },
        ]}
        exampleResponse={`
[
    {
        "_id": "61229192c79b48b7e3e461f2",
        "id": "TELENOR ASA9824637181331 FORNEBUNOR",
        "kind": 0,
        "name": "TELENOR ASA",
        "orgnr": "982463718",
        "countryCode": "NOR",
        "location": "FORNEBU",
        "zipCode": "1331"
    }
]`}
      />
      <EndpointDescription
        title={"Se din kvote (rate limit)"}
        baseUrl={baseUrl}
        path={"/usage"}
        exampleResponse={`
{
    "tier": "anonymous",
    "authenticated": false,
    "limit": "120",
    "remaining": "118"
}`}
      />
      <p>
        Har du en tilbakemelding, ønsker om endringer eller annen funksjonalitet? Send en mail til{" "}
        <code>hei@aksjegrafen.com</code>.
      </p>
    </div>
  );
};

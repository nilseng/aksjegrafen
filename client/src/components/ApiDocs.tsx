import { useContext } from "react";
import { AppContext } from "../AppContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { EndpointDescription } from "./EndpointDescription";
import { InfoPageNav } from "./InfoPageNav";
import { docsStyles } from "./apiDocsStyles";

const baseUrl = "https://www.aksjegrafen.com/api";

const tiers = [
  { name: "Anonym", note: "uten nøkkel", value: "begrenset" },
  { name: "Gratis nøkkel", note: "på forespørsel", value: "utvidet" },
  { name: "Betalt nøkkel", note: "fakturert", value: "ubegrenset" },
];

export const ApiDocs = () => {
  const { theme } = useContext(AppContext);
  useDocumentTitle("API-dokumentasjon");

  const s = docsStyles(theme);
  const insetBox = s.code;
  const link = { color: theme.primary };

  return (
    <div
      className="w-full h-full overflow-y-auto p-4 sm:p-6"
      style={{ maxWidth: "750px", color: theme.text, ...s.panel }}
    >
      <InfoPageNav />

      <h1 className="text-2xl font-bold mb-1">API</h1>
      <p className="text-sm mb-4" style={{ color: theme.muted }}>
        Programmatisk tilgang til hele aksjonærregisteret — selskaper, aksjonærer og eierskap over tid. Åpent og
        gratis.
      </p>
      <pre className="text-xs w-full overflow-x-auto p-3 m-0 mb-6" style={insetBox}>
        {baseUrl}
      </pre>

      <h2 className="text-lg font-bold mb-2">Kvoter</h2>
      <p className="text-sm mb-3">
        API-et er hastighetsbegrenset per nivå. Send en API-nøkkel i <code>x-api-key</code>-headeren for høyere grense.{" "}
        <code>/usage</code> og <code>RateLimit-*</code>-headere viser forbruket ditt.
      </p>
      <div className="mb-3 p-4" style={insetBox}>
        {tiers.map((tier) => (
          <div key={tier.name} className="flex items-baseline justify-between text-sm py-1">
            <span>
              <span className="font-bold">{tier.name}</span> <span style={{ color: theme.muted }}>· {tier.note}</span>
            </span>
            <span className="font-bold" style={{ color: tier.value === "ubegrenset" ? theme.primary : theme.muted }}>
              {tier.value}
            </span>
          </div>
        ))}
      </div>
      <p className="text-sm mb-6">
        Trenger du en nøkkel? Kontakt{" "}
        <a href="mailto:hei@aksjegrafen.com" style={link}>
          hei@aksjegrafen.com
        </a>
        .
      </p>

      <h2 className="text-lg font-bold mb-3">Endepunkter</h2>

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
]`}
      />
      <EndpointDescription
        title={"Hent investeringene til en aksjonær"}
        baseUrl={baseUrl}
        path={"/investments"}
        query={[
          {
            name: "shareholderOrgnr",
            example: "982463718",
            description:
              "organisasjonsnummeret i tilfelle aksjonæren er et selskap. Flere aksjonærer kan hentes i ett kall — " +
              "kommaseparert (982463718,984851006) eller ved å gjenta parameteren. (OPTIONAL)",
          },
          {
            name: "shareholderId",
            description:
              "id for aksjonæren i tilfelle aksjonæren er en privatperson, utenlandsk selskap e.l. (OPTIONAL)",
          },
          { name: "limit", example: 1, description: "maks antall søkeresultater. Default er 100." },
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
]`}
      />
      <div className="p-4 mb-4 text-sm" style={insetBox}>
        <span className="font-bold" style={{ color: theme.primary }}>
          Flere aksjonærer i ett kall.
        </span>{" "}
        <code>shareholderOrgnr</code> tar imot en kommaseparert liste (
        <code>?shareholderOrgnr=982463718,984851006</code>), eller parameteren kan gjentas. Svaret er den samme flate
        listen med eierskap — hvert eierskap har feltet <code>shareholderOrgnr</code>, så resultatene kan grupperes per
        aksjonær. <code>limit</code> og <code>skip</code> gjelder <span className="font-bold">per organisasjonsnummer</span>
        , slik at ett selskap med mange investeringer ikke fortrenger de andre — et kall med N organisasjonsnumre gir
        altså nøyaktig det samme som N enkeltkall. Maks 100 organisasjonsnumre per kall, og <code>limit</code> × antall
        organisasjonsnumre kan ikke overstige 10 000. <code>shareholderId</code> kan ikke kombineres med flere{" "}
        <code>shareholderOrgnr</code>-verdier.
      </div>
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
          { name: "limit", example: 1, description: "maks antall søkeresultater. Default er 100." },
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

      <div className="p-4 mb-4 text-sm" style={insetBox}>
        <span className="font-bold" style={{ color: theme.primary }}>
          Uttrekk av hele registeret.
        </span>{" "}
        <code>/companies</code> og <code>/shareholders</code> streames som chunked respons (uten{" "}
        <code>Content-Length</code>). Vanlige JSON-klienter håndterer dette; verifiser at du har mottatt komplett JSON
        før du bruker det.
      </div>

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
        title={"Se din kvote"}
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

      <p className="text-sm mt-6" style={{ color: theme.muted }}>
        Tilbakemelding eller forslag? Kontakt{" "}
        <a href="mailto:hei@aksjegrafen.com" style={link}>
          hei@aksjegrafen.com
        </a>
        .
      </p>
    </div>
  );
};

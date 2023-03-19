import { ChangeEvent, useContext, useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import { AppContext } from "../App";
import {
  IBrregUnitSearchParams,
  IBrregUnitSuccessResult,
  isBrregUnitSearchError,
  searchBrregUnits,
} from "../services/brregService";
import { GraphLogo } from "./GraphLogo";

const unitSearchParameters = {
  navn: { name: "Navn", value: "", placeholder: "Navn..." },
  organisasjonsnummer: { name: "Org.nr.", value: "", placeholder: "Orgnr..." },
  naeringskode: { name: "Næringskode", value: "", placeholder: "Næringskode..." },
  /* overordnetEnhet: { name: "string", value: null },
  fraAntallAnsatte: { type: "number", value: null },
  tilAntallAnsatte: { type: "number", value: null },
  konkurs: { type: "boolean", value: null },
  registrertIMvaregisteret: { type: "boolean", value: null },
  registrertIForetaksregisteret: { type: "boolean", value: null },
  registrertIStiftelsesregisteret: { type: "boolean", value: null },
  registrertIFrivillighetsregisteret: { type: "boolean", value: null },
  frivilligRegistrertIMvaregisteret: { type: "string", value: null },
  underTvangsavviklingEllerTvangsopplosning: { type: "boolean", value: null },
  underAvvikling: { type: "boolean", value: null }, */
  /** Dato (ISO-8601): yyyy-MM-dd */
  //fraRegistreringsdatoEnhetsregisteret: { type: "string", value: null },
  /** Dato (ISO-8601): yyyy-MM-dd */
  //tilRegistreringsdatoEnhetsregisteret: { type: "string", value: null },
  /** Dato (ISO-8601): yyyy-MM-dd */
  //fraStiftelsesdato: { type: "string", value: null },
  /** Dato (ISO-8601): yyyy-MM-dd */
  //tilStiftelsesdato: { type: "string", value: null },
};

interface ISearchParam {
  [key: string]: { name: string; value?: string | number; placeholder?: string | number };
}

const mapInputToSearchParams = (input: ISearchParam): IBrregUnitSearchParams => {
  const searchParams: IBrregUnitSearchParams = {};
  Object.keys(input).forEach((key) => {
    searchParams[key] = input[key].value;
  });
  return searchParams;
};

export const SearchPage = () => {
  const { theme } = useContext(AppContext);

  const [searchParams, setSearchParams] = useState<ISearchParam>(unitSearchParameters);
  const [searchRes, setSearchRes] = useState<IBrregUnitSuccessResult>();
  const [searchError, setSearchError] = useState<string>();

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchParams((p) => ({ ...p, [e.target.name]: { ...p[e.target.name], value: e.target.value } }));
  };

  const handleSearch = async (searchParams?: IBrregUnitSearchParams) => {
    setSearchError("");
    const res = await searchBrregUnits(searchParams).catch(() => undefined);
    if (!res || isBrregUnitSearchError(res)) {
      setSearchRes(undefined);
      setSearchError("Beklager, søket feilet. Sjekk søkeparameterne og prøv igjen!🤞");
    } else setSearchRes(res);
  };

  useEffect(() => {
    handleSearch();
  }, []);

  return (
    <div style={{ color: theme.text }} className="container d-flex flex-column h-100 pb-5">
      <h3 className="text-center">Søk i enhetsregisteret</h3>
      <Form.Group className="d-flex justify-content-center row">
        {Object.keys(searchParams).map((key) => (
          <Form.Control
            key={key}
            className="col-3 m-1"
            style={{
              backgroundColor: "transparent",
              borderColor: "transparent",
              color: theme.text,
              ...theme.lowering,
              borderRadius: "4rem",
            }}
            name={key}
            value={searchParams[key].value}
            placeholder={`${searchParams[key].placeholder ?? ""}`}
            size={"sm"}
            onChange={handleInputChange}
          ></Form.Control>
        ))}
      </Form.Group>
      <div className="d-flex justify-content-center">
        <button
          className="btn font-weight-bold mt-2 mx-4 mb-4"
          style={{ ...theme.button, color: theme.primary, minWidth: "8rem" }}
          onClick={() => handleSearch(mapInputToSearchParams(searchParams))}
        >
          Søk
        </button>
      </div>
      {searchRes && (
        <div className="d-flex align-items-center justify-content-center pb-2">
          <button
            className="btn font-weight-bold mr-4"
            disabled={searchRes.page.number < 1}
            style={{ ...theme.button, color: theme.primary, minWidth: "4rem" }}
            onClick={() => handleSearch({ ...mapInputToSearchParams(searchParams), page: searchRes.page.number - 1 })}
          >
            Forrige
          </button>
          <p className="m-0">
            Side{" "}
            <span style={{ color: theme.primary }} className="font-weight-bold">
              {searchRes.page.number + 1}
            </span>{" "}
            av{" "}
            <span style={{ color: theme.primary }} className="font-weight-bold">
              {searchRes.page.totalPages}
            </span>
          </p>
          <button
            className="btn font-weight-bold ml-4"
            disabled={searchRes.page.number >= searchRes.page.totalElements - 1}
            style={{ ...theme.button, color: theme.primary, minWidth: "4rem" }}
            onClick={() => handleSearch({ ...mapInputToSearchParams(searchParams), page: searchRes.page.number + 1 })}
          >
            Neste
          </button>
        </div>
      )}
      <div className="flex-fill overflow-auto" style={{ ...theme.lowering }}>
        {searchRes ? (
          searchRes._embedded ? (
            searchRes._embedded.enheter.map((enhet) => (
              <div key={enhet.organisasjonsnummer} style={{ ...theme.elevation }} className="m-4 p-2">
                <div className="d-flex justify-content-between align-items-center p-4" style={theme.borderPrimary}>
                  <div>
                    <p className="mb-0">{enhet.navn}</p>
                    <p className="p-0 m-0" style={{ color: theme.muted }}>
                      {enhet.organisasjonsnummer}
                    </p>
                    <p className="p-0 m-0" style={{ color: theme.muted }}>
                      {enhet.organisasjonsform.beskrivelse}
                    </p>
                  </div>
                  {(enhet.organisasjonsform.kode === "AS" || enhet.organisasjonsform.kode === "ASA") && (
                    <Link to={`/graph?orgnr=${enhet.organisasjonsnummer}`} style={{ textDecoration: "none" }}>
                      <span
                        style={{
                          ...theme.button,
                          borderRadius: "100%",
                          display: "inline-block",
                          textAlign: "center",
                          verticalAlign: "middle",
                          width: "3.2rem",
                          height: "3.2rem",
                          paddingTop: "0.6rem",
                          paddingBottom: "0.6rem",
                        }}
                      >
                        <GraphLogo inputColor={theme.secondary} width={"2rem"} height={"2rem"} />
                      </span>
                      <p className="small font-weight-bold m-0" style={{ color: theme.secondary }}>
                        se i graf
                      </p>
                    </Link>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div style={{ color: theme.primary }} className="text-center p-4">
              Ingen enheter funnet 🔍
            </div>
          )
        ) : (
          <div style={{ color: theme.danger }} className="text-center p-4">
            {searchError}
          </div>
        )}
      </div>
    </div>
  );
};

import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
import { BusinessCode } from "../services/businessCodeService";
import { GraphLogo } from "./GraphLogo";
import Loading from "./Loading";
import { SearchComponent } from "./SearchComponent";

const unitSearchInputConfig: { [key: string]: { name: string; value: string | number; placeholder: string } } = {
  navn: { name: "Navn", value: "", placeholder: "Navn..." },
  organisasjonsnummer: { name: "Org.nr.", value: "", placeholder: "Orgnr..." },
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

  const [searchParams, setSearchParams] = useState<IBrregUnitSearchParams>(
    mapInputToSearchParams(unitSearchInputConfig)
  );
  const [isLoading, setIsLoading] = useState<boolean>();
  const [searchRes, setSearchRes] = useState<IBrregUnitSuccessResult>();
  const [searchError, setSearchError] = useState<string>();

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchParam({ name: e.target.name, value: e.target.value });
  };

  const setSearchParam = ({ name, value }: { name: string; value: number | string }) => {
    setSearchParams((p) => ({ ...p, [name]: value }));
  };

  const handleSearch = async (searchParams?: IBrregUnitSearchParams) => {
    setIsLoading(true);
    setSearchError("");
    const res = await searchBrregUnits(searchParams).catch(() => undefined);
    setIsLoading(false);
    if (!res || isBrregUnitSearchError(res)) {
      setSearchRes(undefined);
      setSearchError("Beklager, søket feilet. Sjekk søkeparameterne og prøv igjen!🤞");
    } else setSearchRes(res);
  };

  useEffect(() => {
    handleSearch();
  }, []);

  return (
    <div style={{ color: theme.text }} className="container d-flex flex-column h-100 pb-3 sm-pb-5">
      <h3 className="text-center">Søk i enhetsregisteret</h3>
      <Form.Group className="d-flex justify-content-center row px-2 mt-3">
        {Object.keys(unitSearchInputConfig).map((key) => (
          <Form.Control
            key={key}
            className="col-sm-3 m-1"
            style={{
              backgroundColor: "transparent",
              borderColor: "transparent",
              color: theme.text,
              ...theme.lowering,
            }}
            name={key}
            value={searchParams[key] ?? ""}
            placeholder={`${unitSearchInputConfig[key].placeholder ?? ""}`}
            onChange={handleInputChange}
          ></Form.Control>
        ))}
        <div className="col-sm-8 px-0 m-1" style={{ height: "3rem", maxHeight: "3rem" }}>
          <SearchComponent
            handleClick={(b: BusinessCode) => setSearchParam({ name: "naeringskode", value: b.code })}
            placeholder="Næring..."
            mapResultToListItem={(b: BusinessCode) => ({
              key: b.code,
              name: b.shortName,
              tags: [
                `næringskode: ${b.code}`,
                `nivå: ${b.level}`,
                ...(b.parentCode ? [`parent: ${b.parentCode}`] : []),
              ],
            })}
            apiPath={"/business-codes"}
            minSearchTermLength={1}
          />
          {searchParams.naeringskode && (
            <span
              className="small font-weight-bold rounded px-1 ml-2"
              style={{ backgroundColor: theme.primary, color: "#f8f9fa" }}
            >
              {searchParams.naeringskode}
              <FontAwesomeIcon
                className="ml-2"
                size="sm"
                icon={faTimes}
                style={{ color: "#f8f9fa", cursor: "pointer" }}
                onClick={() => setSearchParam({ name: "naeringskode", value: "" })}
              />
            </span>
          )}
        </div>
      </Form.Group>
      <div className="d-flex justify-content-center">
        <button
          className="btn font-weight-bold mt-2 mx-4 mb-4"
          style={{ ...theme.button, color: theme.primary, minWidth: "8rem" }}
          onClick={() => handleSearch(searchParams)}
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
            onClick={() => handleSearch({ ...searchParams, page: searchRes.page.number - 1 })}
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
            onClick={() => handleSearch({ ...searchParams, page: searchRes.page.number + 1 })}
          >
            Neste
          </button>
        </div>
      )}
      <div className="flex-fill overflow-auto" style={{ ...theme.lowering }}>
        <>
          {isLoading ? (
            <div className="p-4">
              <Loading color={theme.primary} height="5rem" backgroundColor="transparent" />
            </div>
          ) : searchRes ? (
            searchRes._embedded ? (
              searchRes._embedded.enheter.map((enhet) => (
                <div key={enhet.organisasjonsnummer} style={{ ...theme.elevation }} className="m-3 m-sm-4 p-1 p-sm-2">
                  <div
                    className="d-flex justify-content-between align-items-center p-3 p-sm-4"
                    style={theme.borderPrimary}
                  >
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
        </>
      </div>
    </div>
  );
};

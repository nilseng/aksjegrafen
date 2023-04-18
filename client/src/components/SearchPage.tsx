import { faChevronDown, faChevronUp, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ChangeEvent, useContext, useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import { AppContext } from "../AppContext";
import { availableYears } from "../config";
import {
  IBrregUnit,
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
  navn: { name: "Navn", value: "", placeholder: "Navn på selskap, organisasjon etc..." },
  organisasjonsnummer: { name: "Org.nr.", value: "", placeholder: "Organisasjonsnummer..." },
  organisasjonsform: { name: "Organisasjonsform", value: "", placeholder: "Organisasjonsform..." },
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

const isAksjeselskap = (unit: IBrregUnit) =>
  unit.organisasjonsform.kode === "AS" || unit.organisasjonsform.kode === "ASA";
const isTooRecent = (unit: IBrregUnit) =>
  +unit.registreringsdatoEnhetsregisteret.substring(0, 4) > Math.max(...availableYears);

const shouldShowGraphLink = (unit: IBrregUnit) => {
  if (!isAksjeselskap(unit)) return false;
  if (isTooRecent(unit)) return false;
  return true;
};

export const SearchPage = () => {
  const { theme } = useContext(AppContext);

  const [searchParams, setSearchParams] = useState<IBrregUnitSearchParams>(
    mapInputToSearchParams(unitSearchInputConfig)
  );
  const [areSearchFieldsVisible, setAreSearchFieldsVisible] = useState(true);
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
      <h5 className="text-center">Søk i enhetsregisteret</h5>
      {areSearchFieldsVisible && (
        <>
          <Form.Group className="d-flex justify-content-center row px-2 mt-3 mb-0">
            {Object.keys(unitSearchInputConfig).map((key) => (
              <Form.Control
                key={key}
                className="col-sm-6 m-1"
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
          </Form.Group>
          <div className="row d-flex justify-content-center px-2 px-sm-2 my-1">
            <div className="col-sm-6 px-0 m-1 m-sm-0" style={{ height: "3rem", maxHeight: "3rem" }}>
              <SearchComponent
                handleClick={(b: BusinessCode) => setSearchParam({ name: "naeringskode", value: b.code })}
                placeholder="Næring, bransje, etc..."
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
          </div>
        </>
      )}
      <div className="d-flex justify-content-center pb-4">
        <button
          className="btn font-weight-bold"
          style={{ ...theme.button, color: theme.primary, minWidth: "8rem" }}
          onClick={() => handleSearch(searchParams)}
        >
          Søk
        </button>
        <button
          className="btn"
          style={{ ...theme.button, color: theme.primary }}
          onClick={() => setAreSearchFieldsVisible(!areSearchFieldsVisible)}
        >
          {areSearchFieldsVisible ? <FontAwesomeIcon icon={faChevronUp} /> : <FontAwesomeIcon icon={faChevronDown} />}
        </button>
      </div>
      {searchRes && (
        <div className="d-flex align-items-center justify-content-center pb-2">
          <button
            className="btn btn-sm font-weight-bold mr-4"
            disabled={searchRes.page.number < 1}
            style={{ ...theme.button, color: theme.primary, minWidth: "4rem" }}
            onClick={() => handleSearch({ ...searchParams, page: searchRes.page.number - 1 })}
          >
            Forrige
          </button>
          <p className="small m-0">
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
            className="btn btn-sm font-weight-bold ml-4"
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
                    {isAksjeselskap(enhet) &&
                      (shouldShowGraphLink(enhet) ? (
                        <Link
                          to={`/graph?orgnr=${enhet.organisasjonsnummer}`}
                          className="btn px-0"
                          style={{ textDecoration: "none" }}
                        >
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
                      ) : (
                        <button
                          className="btn px-0"
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
                          disabled={true}
                        >
                          <GraphLogo inputColor={theme.secondary} width={"2rem"} height={"2rem"} />
                        </button>
                      ))}
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

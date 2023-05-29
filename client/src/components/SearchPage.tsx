import { faChevronDown, faChevronUp, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ChangeEvent, useContext, useEffect, useState } from "react";
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
    <div style={{ color: theme.text }} className="w-full max-w-2xl flex flex-col h-full pb-3 sm-pb-5">
      <h5 className="text-lg font-semibold text-center">Søk i enhetsregisteret</h5>
      {areSearchFieldsVisible && (
        <div className="flex justify-center flex-wrap px-2 mt-3 m-0">
          {Object.keys(unitSearchInputConfig).map((key) => (
            <div key={key} className="w-full sm:w-1/2 p-1">
              <input
                className="w-full outline-none p-2"
                style={{
                  backgroundColor: "transparent",
                  backgroundClip: "padding-box",
                  borderColor: "transparent",
                  color: theme.text,
                  ...theme.lowering,
                }}
                name={key}
                value={searchParams[key] ?? ""}
                placeholder={`${unitSearchInputConfig[key].placeholder ?? ""}`}
                onChange={handleInputChange}
              />
            </div>
          ))}
          <div className="flex justify-center w-full sm:w-1/2">
            <div className="w-full m-1" style={{ height: "3rem", maxHeight: "3rem" }}>
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
        </div>
      )}
      <div className="flex justify-center py-5">
        <button
          className="font-bold p-2"
          style={{ ...theme.button, color: theme.primary, minWidth: "8rem" }}
          onClick={() => handleSearch(searchParams)}
        >
          Søk
        </button>
        <button
          className="p-2"
          style={{ ...theme.button, color: theme.primary }}
          onClick={() => setAreSearchFieldsVisible(!areSearchFieldsVisible)}
        >
          {areSearchFieldsVisible ? <FontAwesomeIcon icon={faChevronUp} /> : <FontAwesomeIcon icon={faChevronDown} />}
        </button>
      </div>
      {searchRes && (
        <div className="flex items-center justify-center pb-2">
          <button
            className="text-sm font-bold mr-4 p-2"
            disabled={searchRes.page.number < 1}
            style={{ ...theme.button, color: theme.primary, minWidth: "4rem" }}
            onClick={() => handleSearch({ ...searchParams, page: searchRes.page.number - 1 })}
          >
            Forrige
          </button>
          <p className="text-sm m-0">
            Side{" "}
            <span style={{ color: theme.primary }} className="font-bold">
              {searchRes.page.number + 1}
            </span>{" "}
            av{" "}
            <span style={{ color: theme.primary }} className="font-bold">
              {searchRes.page.totalPages}
            </span>
          </p>
          <button
            className="text-sm font-bold ml-4 p-2"
            disabled={searchRes.page.number >= searchRes.page.totalElements - 1}
            style={{ ...theme.button, color: theme.primary, minWidth: "4rem" }}
            onClick={() => handleSearch({ ...searchParams, page: searchRes.page.number + 1 })}
          >
            Neste
          </button>
        </div>
      )}
      <div className="grow overflow-auto" style={{ ...theme.lowering }}>
        <>
          {isLoading ? (
            <div className="p-4">
              <Loading color={theme.primary} height="5rem" backgroundColor="transparent" />
            </div>
          ) : searchRes ? (
            searchRes._embedded ? (
              searchRes._embedded.enheter.map((enhet) => (
                <div key={enhet.organisasjonsnummer} style={{ ...theme.elevation }} className="m-3 sm:m-4 p-1 sm:p-2">
                  <div className="flex justify-between items-center p-3 sm:p-4" style={theme.borderPrimary}>
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
                          className="px-0"
                          style={{ textDecoration: "none" }}
                        >
                          <button
                            className="flex justify-center items-center p-2"
                            style={{
                              ...theme.button,
                              borderRadius: "100%",
                            }}
                          >
                            <GraphLogo inputColor={theme.secondary} width={"2rem"} height={"2rem"} />
                          </button>
                          <p className="text-sm font-bold m-0" style={{ color: theme.secondary }}>
                            se i graf
                          </p>
                        </Link>
                      ) : (
                        <button
                          className="flex justify-center items-center p-2"
                          style={{
                            ...theme.button,
                            borderRadius: "100%",
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

import { useContext, useEffect, useState } from "react";
import { AppContext } from "../App";
import { IBrregUnitResult, IBrregUnitSearchParams, searchBrregUnits } from "../services/brregService";

export const SearchPage = () => {
  const { theme } = useContext(AppContext);

  const [searchRes, setSearchRes] = useState<IBrregUnitResult>();

  const handleSearch = async (searchParams?: IBrregUnitSearchParams) => {
    const res = await searchBrregUnits(searchParams);
    setSearchRes(res);
  };

  useEffect(() => {
    handleSearch();
  }, []);

  return (
    <div style={{ color: theme.text }} className="container d-flex flex-column h-100 pb-5">
      <h3 className="text-center">Søk i enhetsregisteret</h3>
      <div className="d-flex justify-content-center">
        <button
          className="btn font-weight-bold mt-2 mx-4 mb-4"
          style={{ ...theme.button, color: theme.primary, minWidth: "8rem" }}
          onClick={() => handleSearch()}
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
            onClick={() => handleSearch({ page: searchRes.page.number - 1 })}
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
            onClick={() => handleSearch({ page: searchRes.page.number + 1 })}
          >
            Neste
          </button>
        </div>
      )}
      <div className="flex-fill overflow-auto" style={{ ...theme.lowering }}>
        {searchRes?._embedded.enheter.map((enhet) => (
          <div key={enhet.organisasjonsnummer} style={{ ...theme.elevation }} className="m-4 p-2">
            <div className="p-4" style={theme.borderPrimary}>
              <p className="mb-0">{enhet.navn}</p>
              <p className="p-0 m-0" style={{ color: theme.muted }}>
                {enhet.organisasjonsnummer}
              </p>
              <p className="p-0 m-0" style={{ color: theme.muted }}>
                {enhet.organisasjonsform.beskrivelse}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

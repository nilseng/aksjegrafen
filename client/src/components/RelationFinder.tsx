import { faRoute } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useState } from "react";
import { AppContext } from "../AppContext";
import { useEntity } from "../hooks/useEntity";
import { ICompany } from "../models/models";
import { useShortestPath } from "../services/apiService";
import { useRoleTypes } from "../services/brregService";
import Loading from "./Loading";
import { SearchComponent } from "./SearchComponent";

export const RelationFinder = () => {
  const { theme } = useContext(AppContext);
  const { entity: source } = useEntity();
  const [target, setTarget] = useState<ICompany>();

  const { path, isLoading, error } = useShortestPath(source, target);

  const roleTypes = useRoleTypes();

  return (
    <div
      className="d-flex flex-column align-items-center justify-content-between h-100 w-100 p-4"
      style={{ maxWidth: "750px", color: theme.text }}
    >
      <h5 className="px-sm-5">
        <FontAwesomeIcon icon={faRoute} className="mr-2" style={{ color: theme.primary }} />
        Finn korteste vei fra <span style={{ color: theme.primary }}>{source?.name}</span> til{" "}
        <span style={{ color: theme.secondary }}>{target?.name ?? "?"}</span>
      </h5>
      <div className="flex-fill w-100 p-sm-5">
        <SearchComponent
          mapResultToListItem={(company: ICompany) => ({
            key: company._id,
            name: company.name,
            tags: company.orgnr ? [company.orgnr] : [],
          })}
          placeholder="Søk etter selskap..."
          apiPath={"/api/company"}
          query={{ limit: 10 }}
          handleClick={(company: ICompany) => setTarget(company)}
        />
        {isLoading && (
          <div className="p-sm-5">
            <Loading color={theme.primary} backgroundColor={"transparent"} text={"Dette kan ta litt tid...🧘🏻‍♂️"} />
          </div>
        )}
        {path && (
          <div className="p-2 p-sm-4" style={{ backgroundColor: theme.backgroundSecondary, borderRadius: "8px" }}>
            {path?.map((relation) => (
              <div key={relation.role?.holder.unit?.orgnr ?? relation.ownership?.shareholderOrgnr} className="w-100">
                {relation.role && (
                  <p>
                    <span style={{ color: theme.primary }}>
                      {relation.role.holder.unit?.name ?? relation.role.holder.unit?.navn}
                    </span>{" "}
                    er{" "}
                    <span className="font-weight-bold">
                      {roleTypes?.find((r) => r.kode === relation.role.type)?.beskrivelse ?? relation.role.type}
                    </span>{" "}
                    for{" "}
                    <span style={{ color: theme.secondary }}>
                      {relation.role.company?.name ?? relation.role.company?.name ?? relation.role.shareholder?.name}
                    </span>
                  </p>
                )}
                {relation.ownership && (
                  <p>
                    <span style={{ color: theme.primary }}>
                      {relation.ownership.investor?.company?.name ?? relation.ownership.investor?.shareholder.name}
                    </span>{" "}
                    eier <span className="font-weight-bold">{relation.ownership.holdings[2021].total}</span> aksjer i{" "}
                    <span style={{ color: theme.secondary }}>{relation.ownership.investment?.name}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
        {!path && !isLoading && !error && target && (
          <p className="w-100 text-center p-5 m-0" style={{ color: theme.primary }}>
            Ingen relasjon funnet 🔍
          </p>
        )}
        {error && (
          <p className="w-100 text-center p-5 m-0" style={{ color: theme.danger }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

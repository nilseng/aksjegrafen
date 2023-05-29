import { faRoute } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useState } from "react";
import { AppContext } from "../AppContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useEntity } from "../hooks/useEntity";
import { ICompany } from "../models/models";
import { useShortestPath } from "../services/apiService";
import { useRoleTypes } from "../services/brregService";
import Loading from "./Loading";
import { SearchComponent } from "./SearchComponent";

export const RelationFinder = () => {
  const { theme } = useContext(AppContext);

  const { entity: source } = useEntity();

  useDocumentTitle("Finn relasjoner", source?.name);

  const [target, setTarget] = useState<ICompany>();

  const { path, isLoading, error } = useShortestPath(source, target);

  const roleTypes = useRoleTypes();

  return (
    <div
      className="flex flex-col items-center justify-between h-full w-full p-4"
      style={{ maxWidth: "750px", color: theme.text }}
    >
      <h5 className="sm:px-5">
        <FontAwesomeIcon icon={faRoute} className="mr-2" style={{ color: theme.primary }} />
        Finn korteste vei fra <span style={{ color: theme.primary }}>{source?.name}</span> til{" "}
        <span style={{ color: theme.secondary }}>{target?.name ?? "?"}</span>
      </h5>
      <div className="grow w-full sm:p-5">
        <div style={{ height: "38px" }}>
          <SearchComponent
            mapResultToListItem={(company: ICompany) => ({
              key: company._id,
              name: company.name,
              tags: company.orgnr ? [company.orgnr] : [],
            })}
            placeholder="Søk og velg selskap..."
            apiPath={"/api/company"}
            query={{ limit: 10 }}
            handleClick={(company: ICompany) => setTarget(company)}
          />
        </div>
        {isLoading && (
          <div className="sm:p-5">
            <Loading color={theme.primary} backgroundColor={"transparent"} text={"Dette kan ta litt tid...🧘🏻‍♂️"} />
          </div>
        )}
        {path && path.length > 0 && (
          <div className="p-2 sm:p-4" style={{ backgroundColor: theme.backgroundSecondary, borderRadius: "8px" }}>
            {path?.map((relation) => (
              <div
                key={
                  relation.role?.holder.unit?.orgnr ??
                  relation.ownership?.shareholderOrgnr ??
                  relation.ownership?.shareHolderId
                }
                className="w-full py-2"
              >
                {relation.role && (
                  <p>
                    <span style={{ color: theme.primary }}>
                      {relation.role.holder.unit?.name ?? relation.role.holder.unit?.navn}
                    </span>{" "}
                    er{" "}
                    <span className="font-bold">
                      {roleTypes?.find((r) => r.kode === relation.role.type)?.beskrivelse ?? relation.role.type}
                    </span>{" "}
                    for{" "}
                    <span style={{ color: theme.secondary }}>
                      {relation.role.company?.name ?? relation.role.shareholder?.name}
                    </span>
                  </p>
                )}
                {relation.ownership && (
                  <p>
                    <span style={{ color: theme.primary }}>
                      {relation.ownership.investor?.company?.name ?? relation.ownership.investor?.shareholder.name}
                    </span>{" "}
                    eier{" "}
                    <span className="font-bold">{relation.ownership.holdings[2022]?.total.toLocaleString("NO")}</span>{" "}
                    aksjer i <span style={{ color: theme.secondary }}>{relation.ownership.investment?.name}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
        {(!path || path.length === 0) && !isLoading && !error && target && (
          <p className="w-full text-center p-5 m-0" style={{ color: theme.primary }}>
            Ingen relasjon funnet 🔍
          </p>
        )}
        {error && (
          <p className="w-full text-center p-5 m-0" style={{ color: theme.danger }}>
            {error}
          </p>
        )}
      </div>
      <div className="text-sm p-4" style={theme.lowering}>
        Har du analyser eller større søk du ønsker gjennomført? Ta kontakt på{" "}
        <span style={{ color: theme.primary }}>contact@pureokrs.com</span>.
      </div>
    </div>
  );
};

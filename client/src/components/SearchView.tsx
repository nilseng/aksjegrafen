import { faList, faRoute, faUserTie } from "@fortawesome/free-solid-svg-icons";
import { useContext } from "react";
import { useCompanyCount, useShareholderCount } from "../services/apiService";
import { StatCard } from "./StatCard";

import { faBuilding } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useHistory } from "react-router-dom";
import { AppContext } from "../AppContext";
import { ICompany, IShareholder } from "../models/models";
import { GraphLogo } from "./GraphLogo";
import { SearchComponent } from "./SearchComponent";

const searchQueryParams = { limit: 10 };
const companySearchPath = "/api/company";
const shareholderSearchPath = "/api/shareholder";

export const SearchView = () => {
  const { theme, tableModalInput } = useContext(AppContext);
  const history = useHistory();

  const companyCount = useCompanyCount();
  const shareholderCount = useShareholderCount();

  return (
    <div className="w-full flex justify-center flex-wrap dark:text-white">
      <div
        className="w-full max-w-lg flex flex-col justify-between items-center p-4 pt-12 m-4 sm:m-6"
        style={{
          backgroundColor: theme.background,
          ...theme.elevation,
          maxHeight: "14.5rem",
          height: "14.5rem",
        }}
      >
        <StatCard label="aksjeselskaper" labelIcon={faBuilding} stat={companyCount} />
        <div className="w-full mt-12">
          <SearchComponent
            inputContainerClassName="w-full"
            inputStyle={{
              backgroundColor: "transparent",
              backgroundClip: "padding-box",
              borderColor: "transparent",
              color: theme.text,
              ...theme.lowering,
            }}
            inputClassName="focus:outline-none p-2"
            mapResultToListItem={(company: ICompany) => ({
              key: company._id,
              name: company.name,
              tags: company.orgnr ? [company.orgnr] : [],
              buttons: [
                {
                  name: "table-button",
                  condition: true,
                  buttonContent: <FontAwesomeIcon icon={faList} style={{ color: theme.primary }} size="lg" />,
                  handleClick: (company: ICompany) => tableModalInput.setInvestment(company),
                },
                {
                  name: "graph-button",
                  condition: true,
                  buttonContent: <GraphLogo inputColor={theme.secondary} width={"1.5rem"} height={"1.5rem"} />,
                  handleClick: (company: ICompany) => history.push(`/graph?_id=${company._id}`),
                },
                {
                  name: "relation-finder-button",
                  condition: true,
                  buttonContent: <FontAwesomeIcon icon={faRoute} style={{ color: theme.primary }} size="lg" />,
                  handleClick: (company: ICompany) => history.push(`/relation-finder?_id=${company._id}`),
                },
              ],
            })}
            placeholder="Søk etter selskap..."
            apiPath={companySearchPath}
            query={searchQueryParams}
          />
        </div>
      </div>
      <div
        className="w-full max-w-lg flex flex-col justify-between items-center p-4 pt-12 m-4 sm:m-6"
        style={{
          backgroundColor: theme.background,
          ...theme.elevation,
          maxHeight: "14.5rem",
          height: "14.5rem",
        }}
      >
        <StatCard label="aksjonærer" labelIcon={faUserTie} stat={shareholderCount} />
        <div className="w-full mt-12">
          <SearchComponent
            inputContainerClassName="w-full"
            inputStyle={{
              backgroundColor: "transparent",
              backgroundClip: "padding-box",
              borderColor: "transparent",
              color: theme.text,
              ...theme.lowering,
            }}
            inputClassName="focus:outline-none p-2"
            mapResultToListItem={(shareholder: IShareholder) => ({
              key: shareholder._id,
              name: shareholder.name,
              tags: [shareholder.orgnr, shareholder.yearOfBirth, shareholder.countryCode].filter((tag) => !!tag) as (
                | number
                | string
              )[],
              buttons: [
                {
                  name: "table-button",
                  condition: true,
                  buttonContent: <FontAwesomeIcon icon={faList} style={{ color: theme.primary }} size="lg" />,
                  handleClick: (shareholder: IShareholder) => {
                    tableModalInput.setInvestor(shareholder);
                  },
                },
                {
                  name: "graph-button",
                  condition: true,
                  buttonContent: <GraphLogo inputColor={theme.secondary} width={"1.5rem"} height={"1.5rem"} />,
                  handleClick: (shareholder: IShareholder) => history.push(`/graph?shareholder_id=${shareholder._id}`),
                },
                {
                  name: "relation-finder-button",
                  condition: true,
                  buttonContent: <FontAwesomeIcon icon={faRoute} style={{ color: theme.primary }} size="lg" />,
                  handleClick: (shareholder: IShareholder) =>
                    history.push(`/relation-finder?shareholder_id=${shareholder._id}`),
                },
              ],
            })}
            placeholder="...eller aksjonær..."
            apiPath={shareholderSearchPath}
            query={searchQueryParams}
          />
        </div>
      </div>
    </div>
  );
};

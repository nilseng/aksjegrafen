import { Fragment, useContext } from "react";
import { useHistory } from "react-router-dom";
import { AppContext } from "../AppContext";
import { availableYears } from "../config";
import { ICompany, IOwnership, IShareholder, Year } from "../models/models";
import { GraphLogo } from "./GraphLogo";

const getGraphLink = (o: IOwnership): string => {
  if (o.investment) return `/graph?_id=${o.investment._id}`;
  if (o.investor?.company) return `/graph?_id=${o.investor.company._id}`;
  if (o.investor?.shareholder) return `/graph?shareholder_id=${o.investor.shareholder._id}`;
  throw Error(`Graph link not found for ownership w id=${o._id}`);
};

const getCompanyStocks = (
  o: IOwnership,
  year: Year,
  investor?: IShareholder,
  investment?: ICompany
): number | undefined => {
  if (investor) return o.investment?.shares?.[year]?.total;
  if (investment) return investment?.shares?.[year]?.total;
};

const getOwnershipShare = (
  o: IOwnership,
  year: Year,
  investor?: IShareholder,
  investment?: ICompany
): number | null => {
  const companyStocks = getCompanyStocks(o, year, investor, investment);
  if (!companyStocks) return null;
  return (o.holdings[year]?.total ?? 0) / companyStocks;
};

const getOwnershipShareText = (o: IOwnership, year: Year, investor?: IShareholder, investment?: ICompany): string => {
  const share = getOwnershipShare(o, year, investor, investment);
  if (!share) return "";
  return `${(share * 100).toFixed(1)}%`;
};

const getOwnershipChange = (o: IOwnership, year: Year) => {
  if (year === Math.min(...availableYears)) return null;
  const cy = o.holdings[year]?.total ?? 0;
  const ly = o.holdings[(year - 1) as Year]?.total ?? 0;
  if (!cy && !ly) return null;
  return cy - ly;
};

const getOwnershipChangeText = (o: IOwnership, year: Year) => {
  const change = getOwnershipChange(o, year);
  if (!change) return null;
  if (change > 0)
    return (
      <p className="text-xs text-success m-0" style={{ height: "1rem" }}>
        +{change.toLocaleString(navigator.language)}
      </p>
    );
  return (
    <p className="text-xs text-danger m-0" style={{ height: "1rem" }}>
      {change.toLocaleString(navigator.language)}
    </p>
  );
};

export const OwnershipTable = ({
  ownerships,
  investor,
  investment,
  closeModal,
}: {
  ownerships: IOwnership[];
  investor?: IShareholder;
  investment?: ICompany;
  closeModal: () => void;
}) => {
  const { theme } = useContext(AppContext);
  const history = useHistory();
  return (
    <div className="w-full flex flex-wrap pt-3 m-0">
      <p className="w-1/3"></p>
      <p className="w-2/3 text-center font-bold text-xs px-1 pb-2">
        Eierandel / <span className="font-normal">Antall aksjer</span>
      </p>
      <p className="w-1/3 text-center font-bold text-xs px-1 sm:pl-3 mb-1">Navn</p>
      {availableYears.map((year) => (
        <p key={year} className="w-1/6 text-xs font-bold px-1 mb-1 sm:mb-2">
          {year}
        </p>
      ))}
      <div className="w-full px-1 px-sm-3 pb-1 pb-sm-3">
        <div className="w-full" style={{ borderBottom: `0.5px solid ${theme.secondary}` }}></div>
      </div>
      {ownerships.map((o) => (
        <Fragment key={o._id}>
          <span className="flex justify-between items-center w-1/3 overflow-auto px-1 sm:pl-4">
            <p className="text-xs m-0">{investment ? o.investor?.shareholder?.name : o.investment?.name}</p>
            <span
              className="flex justify-center items-center ml-2 mr-sm-4"
              style={{
                ...theme.button,
                cursor: "pointer",
                borderRadius: "100%",
                width: "1.6rem",
                minWidth: "1.6rem",
                height: "1.6rem",
                minHeight: "1.6rem",
              }}
              onClick={() => {
                closeModal();
                history.push(getGraphLink(o));
              }}
            >
              <GraphLogo inputColor={theme.secondary} width={"1rem"} height={"1rem"} />
            </span>
          </span>
          {availableYears.map((year) => (
            <div key={year} className="w-1/6 overflow-auto px-1 py-2">
              <p className="font-bold text-xs m-0" style={{ height: "1rem" }}>
                {getOwnershipShareText(o, year, investor, investment)}
              </p>
              <p className="text-xs m-0" style={{ height: "1rem" }}>
                {o.holdings[year]?.total ? o.holdings[year]?.total.toLocaleString(navigator.language) : ""}
              </p>
              {getOwnershipChangeText(o, year)}
            </div>
          ))}
          <div className="w-full px-1 sm:px-3 pb-1 sm:pb-3">
            <div className="w-full" style={{ borderBottom: `0.5px solid ${theme.primary}` }}></div>
          </div>
        </Fragment>
      ))}
    </div>
  );
};

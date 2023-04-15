import { Fragment, useContext } from "react";
import { useHistory } from "react-router-dom";
import { AppContext } from "../App";
import { availableYears } from "../config";
import { ICompany, IOwnership, IShareholder, Year } from "../models/models";
import { GraphLogo } from "./GraphLogo";

const getGraphLink = (o: IOwnership): string => {
  if (o.investment) return `/graph?_id=${o.investment._id}`;
  if (o.investor?.company) return `/graph?_id=${o.investor.company._id}`;
  if (o.investor?.shareholder) return `/graph?shareholder_id=${o.investor.shareholder._id}`;
  throw Error(`Graph link not found for ownership w id=${o._id}`);
};

const getOwnershipShare = (o: IOwnership, year: Year, investor?: IShareholder, investment?: ICompany): string => {
  if (investor) {
    const companyStocks = o.investment?.shares?.[year]?.total;
    if (!companyStocks) return "N/A";
    return `${((o.holdings[year].total / companyStocks) * 100).toFixed(1)}%`;
  }
  if (investment) {
    const companyStocks = investment?.shares?.[year]?.total;
    if (!companyStocks) return "N/A";
    return `${((o.holdings[year].total / companyStocks) * 100).toFixed(1)}%`;
  }
  throw Error("Investor or investment must be defined to calculate ownership share.");
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
    <div className="row pt-3 m-0">
      <p className="col-6 font-weight-bold small px-1 pl-sm-3 mb-1">Navn</p>
      <p className="col-6 text-center font-weight-bold small px-1 mb-1">
        Eierandel / <span className="font-weight-normal">Antall aksjer</span>
      </p>
      <p className="col-6"></p>
      {availableYears.map((year) => (
        <p key={year} className="col-2 small font-weight-bold px-1 mb-1 mb-sm-2">
          {year}
        </p>
      ))}
      {ownerships.map((o) => (
        <Fragment key={o._id}>
          <span className="col-6 justify-content-between overflow-auto d-flex align-items-center px-1 pl-sm-3">
            <p className="m-0">{investment ? o.investor?.shareholder?.name : o.investment?.name}</p>
            <span
              className="ml-2 mr-sm-4"
              style={{
                ...theme.button,
                cursor: "pointer",
                borderRadius: "100%",
                display: "inline-block",
                textAlign: "center",
                verticalAlign: "middle",
                width: "1.6rem",
                minWidth: "1.6rem",
                height: "1.6rem",
                minHeight: "1.6rem",
                paddingTop: "0.1rem",
                paddingBottom: "0.1rem",
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
            <div key={year} className="col-2 overflow-auto px-1 py-2">
              <p className="font-weight-bold small m-0">{getOwnershipShare(o, year, investor, investment)}</p>
              <p className="small m-0">{o.holdings[year]?.total?.toLocaleString()}</p>
            </div>
          ))}
        </Fragment>
      ))}
    </div>
  );
};

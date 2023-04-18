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
  return o.holdings[year].total / companyStocks;
};

const getOwnershipShareText = (o: IOwnership, year: Year, investor?: IShareholder, investment?: ICompany): string => {
  const share = getOwnershipShare(o, year, investor, investment);
  if (!share) return "";
  return `${(share * 100).toFixed(1)}%`;
};

const getOwnershipChange = (o: IOwnership, year: Year) => {
  if (year === Math.min(...availableYears)) return null;
  const cy = o.holdings[year].total;
  const ly = o.holdings[(year - 1) as Year].total;
  if (!cy && !ly) return null;
  return cy - ly;
};

const getOwnershipChangeText = (o: IOwnership, year: Year) => {
  const change = getOwnershipChange(o, year);
  if (!change && change !== 0) return <p className="small m-0" style={{ height: "1rem" }}></p>;
  if (change === 0)
    return (
      <p className="small text-warning m-0" style={{ height: "1rem" }}>
        {change}
      </p>
    );
  if (change > 0)
    return (
      <p className="small text-success m-0" style={{ height: "1rem" }}>
        +{change.toLocaleString()}
      </p>
    );
  return (
    <p className="small text-danger m-0" style={{ height: "1rem" }}>
      {change.toLocaleString()}
    </p>
  );
};

const getOwnershipShareChange = (
  o: IOwnership,
  year: Year,
  investor?: IShareholder,
  investment?: ICompany
): number | null => {
  const ly = getOwnershipShare(o, (year - 1) as Year, investor, investment);
  const cy = getOwnershipShare(o, year, investor, investment) ?? 0;
  if (!ly) return null;
  return cy / ly - 1;
};

const getOwnershipShareChangeText = (o: IOwnership, year: Year, investor?: IShareholder, investment?: ICompany) => {
  const shareChange = getOwnershipShareChange(o, year, investor, investment);
  if (!shareChange && shareChange !== 0) return <p className="small m-0" style={{ height: "1rem" }}></p>;
  const txt = `${(shareChange * 100).toFixed(1)}%`;
  if (shareChange === 0)
    return (
      <p className="small text-warning m-0" style={{ height: "1rem" }}>
        {txt}
      </p>
    );
  if (shareChange > 0)
    return (
      <p className="small text-success m-0" style={{ height: "1rem" }}>
        +{txt}
      </p>
    );
  return (
    <p className="small text-danger m-0" style={{ height: "1rem" }}>
      {txt}
    </p>
  );
};

const getOwnershipShareChangePp = (
  o: IOwnership,
  year: Year,
  investor?: IShareholder,
  investment?: ICompany
): number | null => {
  if (year === Math.min(...availableYears)) return null;
  const ly = getOwnershipShare(o, (year - 1) as Year, investor, investment) ?? 0;
  const cy = getOwnershipShare(o, year, investor, investment) ?? 0;
  if (!ly && !cy) return null;
  return cy - ly;
};

const getOwnershipShareChangePpText = (o: IOwnership, year: Year, investor?: IShareholder, investment?: ICompany) => {
  const shareChange = getOwnershipShareChangePp(o, year, investor, investment);
  if (!shareChange && shareChange !== 0) return <p className="small m-0" style={{ height: "1rem" }}></p>;
  const txt = `${(shareChange * 100).toFixed(1)}pp`;
  if (shareChange === 0)
    return (
      <p className="small text-warning m-0" style={{ height: "1rem" }}>
        {txt}
      </p>
    );
  if (shareChange > 0)
    return (
      <p className="small text-success m-0" style={{ height: "1rem" }}>
        +{txt}
      </p>
    );
  return (
    <p className="small text-danger m-0" style={{ height: "1rem" }}>
      {txt}
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
    <div className="row pt-3 m-0">
      <p className="col-6"></p>
      <p className="col-6 text-center font-weight-bold small px-1 mb-1">
        Eierandel / <span className="font-weight-normal">Antall aksjer</span>
      </p>
      <p className="col-6 text-center font-weight-bold small px-1 pl-sm-3 mb-1">Navn</p>
      {availableYears.map((year) => (
        <p key={year} className="col-2 small font-weight-bold px-1 mb-1 mb-sm-2">
          {year}
        </p>
      ))}
      <div className="col-12 px-1 px-sm-3 pb-1 pb-sm-3">
        <div className="w-100" style={{ borderBottom: `0.5px solid ${theme.secondary}` }}></div>
      </div>
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
              <p className="font-weight-bold small m-0" style={{ height: "1rem" }}>
                {getOwnershipShareText(o, year, investor, investment)}
              </p>
              <p className="small m-0" style={{ height: "1rem" }}>
                {o.holdings[year]?.total ? o.holdings[year].total.toLocaleString() : ""}
              </p>
              {getOwnershipChangeText(o, year)}
              {getOwnershipShareChangePpText(o, year, investor, investment)}
              {getOwnershipShareChangeText(o, year, investor, investment)}
            </div>
          ))}
          <div className="col-12 px-1 px-sm-3 pb-1 pb-sm-3">
            <div className="w-100" style={{ borderBottom: `0.5px solid ${theme.primary}` }}></div>
          </div>
        </Fragment>
      ))}
    </div>
  );
};

import { Fragment, useContext } from "react";
import { AppContext } from "../App";
import { availableYears } from "../config";
import { IOwnership } from "../models/models";

export const OwnershipTable = ({ ownerships, type }: { ownerships: IOwnership[]; type: "investor" | "investment" }) => {
  const { theme } = useContext(AppContext);
  return (
    <div className="row pt-3 m-0">
      <p className="col-6 font-weight-bold small">Navn</p>
      <p className="col-6 font-weight-bold small">Antall aksjer</p>
      <p className="col-6"></p>
      {availableYears.map((year) => (
        <p key={year} className="col-2 small font-weight-bold">
          {year}
        </p>
      ))}
      {ownerships.map((o) => (
        <Fragment key={o._id}>
          <p className="col-6 overflow-auto px-1">
            {type === "investment" ? o.investor?.shareholder?.name : o.investment?.name}
          </p>
          {availableYears.map((year) => (
            <div key={year} className="col-2 overflow-auto px-1">
              {Object.keys(o.holdings[year] ?? {}).map((stockClass) => (
                <Fragment key={stockClass}>
                  <p className="small mb-1" style={{ color: theme.muted }}>
                    {stockClass}
                  </p>
                  <p>{o.holdings[year]?.[stockClass]?.toLocaleString()}</p>
                </Fragment>
              ))}
            </div>
          ))}
        </Fragment>
      ))}
    </div>
  );
};

import { Fragment } from "react";
import { availableYears } from "../config";
import { IOwnership } from "../models/models";

export const OwnershipTable = ({ ownerships, type }: { ownerships: IOwnership[]; type: "investor" | "investment" }) => {
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
              <p>{o.holdings[year]?.total?.toLocaleString()}</p>
            </div>
          ))}
        </Fragment>
      ))}
    </div>
  );
};

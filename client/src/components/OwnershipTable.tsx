import { Fragment } from "react";
import { IOwnership } from "../models/models";
import { CopyButton } from "./CopyButton";

export const OwnershipTable = ({ ownerships }: { ownerships: IOwnership[] }) => {
  return (
    <div className="row py-2 py-sm-4 m-0">
      <p className="col-6 font-weight-bold small">Navn</p>
      <p className="col-3 font-weight-bold small">Antall aksjer</p>
      <p className="col-3 font-weight-bold small">År</p>
      {ownerships.map((i) => (
        <Fragment key={i._id}>
          <p className="col-6">{i.company?.name ?? i.shareholder?.name}</p>
          <p className="col-3">
            {(+i.shareholderStocks).toLocaleString()}
            <CopyButton text={`${i.shareholderStocks}`} className="text-muted ml-1" />
          </p>
          <p className="col-3">{i.year}</p>
        </Fragment>
      ))}
    </div>
  );
};

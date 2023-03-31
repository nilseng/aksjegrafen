import { Fragment, useMemo } from "react";
import { IOwnership } from "../models/models";

interface MappedOwnership {
  [key: string]: IOwnership & { [year: number]: number };
}

const getRowId = (type: "investor" | "investment", o: IOwnership) => {
  return type === "investment" ? o.shareholderOrgnr ?? o.shareHolderId : o.orgnr;
};

export const OwnershipTable = ({ ownerships, type }: { ownerships: IOwnership[]; type: "investor" | "investment" }) => {
  const mappedOwnerships = useMemo(() => {
    const mappedOwnerships: MappedOwnership = {};
    ownerships.forEach((o) => {
      const mappedOwnership = mappedOwnerships[getRowId(type, o)];
      mappedOwnerships[getRowId(type, o)] = {
        ...mappedOwnership,
        ...o,
        [o.year]: (mappedOwnership?.[o.year] ?? 0) + +o.shareholderStocks,
      };
    });
    return mappedOwnerships;
  }, [ownerships, type]);

  return (
    <div className="row pt-3 m-0">
      <p className="col-6 font-weight-bold small">Navn</p>
      <p className="col-6 font-weight-bold small">Antall aksjer</p>
      <p className="col-6"></p>
      <p className="col-2 small font-weight-bold">2021</p>
      <p className="col-2 small font-weight-bold">2020</p>
      <p className="col-2 small font-weight-bold">2019</p>
      {Object.keys(mappedOwnerships)
        .sort((a, b) => ((mappedOwnerships[a][2020] ?? 0) > (mappedOwnerships[b][2020] ?? 0) ? -1 : 1))
        .sort((a, b) => ((mappedOwnerships[a][2021] ?? 0) > (mappedOwnerships[b][2021] ?? 0) ? -1 : 1))
        .map((key) => (
          <Fragment key={key}>
            <p className="col-6 overflow-auto px-1">
              {type === "investment" ? mappedOwnerships[key].shareholder?.name : mappedOwnerships[key].company?.name}
            </p>
            <p className="col-2 overflow-auto px-1">{mappedOwnerships[key][2021]?.toLocaleString()}</p>
            <p className="col-2 overflow-auto px-1">{mappedOwnerships[key][2020]?.toLocaleString()}</p>
            <p className="col-2 overflow-auto px-1">{mappedOwnerships[key][2019]?.toLocaleString()}</p>
          </Fragment>
        ))}
    </div>
  );
};

import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext, useEffect } from "react";
import { AppContext } from "../../../App";
import { ICompany, IShareholder } from "../../../models/models";
import { useBrregEntityInfo } from "../../../services/brregService";
import { tsxify } from "../../../utils/tsxify";
import { EntityRelationships } from "./EntityRelationships";

interface IProps {
  entity: ICompany | IShareholder;
  setEntity: React.Dispatch<
    React.SetStateAction<ICompany | IShareholder | undefined>
  >;
}

export const GraphDetailsModal = ({ entity, setEntity }: IProps) => {
  const { theme } = useContext(AppContext);

  const brregInfo = useBrregEntityInfo(entity);

  useEffect(() => {
    console.log(brregInfo);
  }, [brregInfo]);

  return (
    <div className="row d-flex justify-content-center position-absolute h-75 w-100 mt-5">
      <div
        className="col col-lg-8 col-11 h-100 p-4"
        style={{
          backgroundColor: theme.background,
          color: theme.text,
          ...theme.elevation,
        }}
      >
        <div style={{ height: "100px" }}>
          <div className="w-100 text-right">
            <FontAwesomeIcon
              icon={faTimes}
              style={{ cursor: "pointer", color: theme.text }}
              onClick={() => setEntity(undefined)}
            />
          </div>
          <h4 className="py-4">{entity.name}</h4>
        </div>
        <div style={{ overflow: "scroll", height: "calc(100% - 100px)" }}>
          <EntityRelationships entity={entity} />
          {brregInfo && tsxify(brregInfo, theme)}
        </div>
      </div>
    </div>
  );
};

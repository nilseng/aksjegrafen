import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext } from "react";
import { AppContext } from "../../../App";
import { ICompany, IShareholder } from "../../../models/models";
import { useBrregEntityInfo } from "../../../services/brregService";
import { EntityRelationships } from "./EntityRelationships";
import { ModalInfo } from "./ModalInfo";

interface IProps {
  entity: ICompany | IShareholder;
  setEntity: React.Dispatch<React.SetStateAction<ICompany | IShareholder | undefined>>;
}

export const GraphDetailsModal = ({ entity, setEntity }: IProps) => {
  const { theme } = useContext(AppContext);

  const brregInfo = useBrregEntityInfo(entity);

  return (
    <div className="row d-flex justify-content-center position-absolute h-75 w-100 mt-5">
      <div
        className="col col-lg-8 col-11 h-100 w-100 p-4"
        style={{
          backgroundColor: theme.background,
          color: theme.text,
          ...theme.elevation,
        }}
      >
        <div className="w-100">
          <div className="w-100 text-right">
            <FontAwesomeIcon
              icon={faTimes}
              style={{ cursor: "pointer", color: theme.text }}
              onClick={() => setEntity(undefined)}
            />
          </div>
          <div className="d-flex flex-wrap align-items-center py-4">
            <p className="h4 mb-0 mr-3">{entity.name}</p>
            <p className="small align-middle h-100 mb-0" style={{ color: theme.muted }}>
              {entity.orgnr}
            </p>
          </div>
        </div>
        <div style={{ overflow: "scroll" }}>
          <EntityRelationships entity={entity} />
          {brregInfo?.organisasjonsform?.beskrivelse && (
            <ModalInfo title="Organisasjonsform" value={brregInfo.organisasjonsform.beskrivelse} />
          )}
          {brregInfo?.hjemmeside && <ModalInfo title="Hjemmeside" value={brregInfo.hjemmeside} link={true} />}
          {brregInfo?.stiftelsesdato && (
            <ModalInfo
              title="Stiftelsesdato"
              value={new Date(brregInfo?.stiftelsesdato).toLocaleString("nb-NO", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            />
          )}
          {brregInfo?.registreringsdatoEnhetsregisteret && (
            <ModalInfo
              title="Registreringdato"
              value={new Date(brregInfo?.registreringsdatoEnhetsregisteret).toLocaleString("nb-NO", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            />
          )}
          {(brregInfo?.registrertIMvaregisteret || brregInfo?.registrertIMvaregisteret === false) && (
            <ModalInfo title="Momsregistrert" value={brregInfo.registrertIMvaregisteret ? "Ja" : "Nei"} />
          )}
          {brregInfo?.naeringskode1?.beskrivelse && (
            <ModalInfo title="Type virksomhet (næringskode 1)" value={brregInfo?.naeringskode1.beskrivelse} />
          )}
          {(brregInfo?.underAvvikling || brregInfo?.underAvvikling === false) && (
            <ModalInfo title="Under avvikling" value={brregInfo?.underAvvikling ? "Ja" : "Nei"} />
          )}
        </div>
      </div>
    </div>
  );
};

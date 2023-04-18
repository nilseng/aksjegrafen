import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext } from "react";
import { AppContext } from "../../../AppContext";
import { ICompany, IShareholder } from "../../../models/models";
import { useBrregEntityInfo } from "../../../services/brregService";
import { EntityRelationships } from "./EntityRelationships";
import { Financials } from "./Financials";
import { ModalInfo } from "./ModalInfo";

interface IProps {
  entity: ICompany | IShareholder;
  setEntity: React.Dispatch<React.SetStateAction<ICompany | IShareholder | undefined>>;
}

export const GraphDetailsModal = ({ entity, setEntity }: IProps) => {
  const { theme } = useContext(AppContext);

  const brregInfo = useBrregEntityInfo(entity);

  return (
    <div className="row d-flex justify-content-center position-absolute w-100 h-75 mt-5">
      <div
        className="col col-lg-8 col-11 h-100 w-100 p-4"
        style={{
          overflow: "scroll",
          backgroundColor: theme.backgroundSecondary,
          color: theme.text,
          ...theme.elevation,
        }}
      >
        <div className="d-flex justify-content-between align-items-center w-100 pb-4">
          <div className="d-flex flex-fill flex-wrap align-items-center justify-content-center">
            <p className="h4 mb-0 mr-3">{entity.name}</p>
            <p className="small align-middle h-100 mb-0" style={{ color: theme.muted }}>
              {entity.orgnr}
            </p>
          </div>
          <button
            className="btn px-2 pt-0"
            style={{
              textAlign: "center",
              verticalAlign: "middle",
              width: "2.4rem",
              height: "2.4rem",
              right: 0,
              cursor: "pointer",
            }}
            onClick={() => setEntity(undefined)}
          >
            <FontAwesomeIcon icon={faTimes} style={{ color: theme.muted }} />
          </button>
        </div>
        <div style={{ overflow: "scroll" }}>
          <Financials entity={entity} />
          <EntityRelationships entity={entity} />
          <div className="p-4">
            {brregInfo && (
              <p style={{ color: theme.primary }} className="font-weight-bold">
                Annen informasjon om selskapet
              </p>
            )}
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
    </div>
  );
};

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
    <div className="flex justify-center absolute w-2/3 h-3/4 mt-12">
      <div
        className="h-full w-full p-4"
        style={{
          overflow: "scroll",
          backgroundColor: theme.backgroundSecondary,
          color: theme.text,
          ...theme.elevation,
        }}
      >
        <div className="flex justify-between items-center w-full pb-4">
          <div className="flex grow flex-wrap items-center justify-center">
            <p className="text-lg font-semibold mb-0 mr-3">{entity.name}</p>
            <p className="text-sm" style={{ color: theme.muted }}>
              {entity.orgnr}
            </p>
          </div>
          <button
            className="px-2 pt-0"
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
              <p style={{ color: theme.primary }} className="font-bold pb-2">
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

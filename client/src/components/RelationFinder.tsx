import { faRoute } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext } from "react";
import { AppContext } from "../AppContext";
import { useEntity } from "../hooks/useEntity";

export const RelationFinder = () => {
  const { theme } = useContext(AppContext);
  const { entity } = useEntity();
  return (
    <div className="d-flex flex-column align-items-center h-100 p-4">
      <h5>
        <FontAwesomeIcon icon={faRoute} className="mr-2" style={{ color: theme.primary }} />
        Finn direkte og indirekte relasjoner for <span style={{ color: theme.primary }}>{entity?.name}</span>
      </h5>
      <div
        className="flex-fill d-flex flex-column align-items-center justify-content-center p-sm-5"
        style={{ maxWidth: "750px" }}
      >
        <p>
          Her kommer funksjonalitet for å finne roller og relasjoner som selskaper har direkte eller indirekte i andre
          selskaper.
        </p>
        <p>
          Jobber du for eksempel i et revisjons- og rådgivningsselskap og vurderer å tilby rådgivning, men må vite om
          dere allerede leverer revisjonstjenester til et av selskapene i et konsern?
        </p>
      </div>
    </div>
  );
};

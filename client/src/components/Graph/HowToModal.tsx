import { faHandLizard, faHandPointer, faHandRock } from "@fortawesome/free-regular-svg-icons";
import { faInfoCircle, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useState } from "react";
import { AppContext } from "../../AppContext";

export const HowToModal = () => {
  const { theme } = useContext(AppContext);

  const [isOpen, setIsOpen] = useState<boolean>(false);

  if (!isOpen)
    return (
      <div className="btn position-absolute mr-4" style={{ right: 0, top: "77.19px" }} onClick={() => setIsOpen(true)}>
        <FontAwesomeIcon className="m-2" style={{ color: theme.primary }} icon={faInfoCircle} />
      </div>
    );

  return (
    <div
      className="position-absolute h-75 w-50 mr-4"
      style={{
        color: theme.text,
        right: 0,
        top: "77.19px",
        ...theme.elevation,
        backgroundColor: theme.backgroundSecondary,
        overflow: "scroll",
      }}
    >
      <div className="btn float-right m-4" onClick={() => setIsOpen(false)}>
        <FontAwesomeIcon icon={faTimes} style={{ color: theme.muted }} />
      </div>
      <h5 className="p-4">
        <FontAwesomeIcon className="mr-4" style={{ color: theme.primary }} icon={faInfoCircle} />
        Forklaring
      </h5>
      <p className="p-4 m-0">
        <FontAwesomeIcon className="mr-2" icon={faHandPointer} />
        Trykk på et selskap eller aksjonær for å se meny med valgmuligheter.
      </p>
      <p className="p-4 m-0">
        <FontAwesomeIcon className="mr-2" icon={faHandLizard} />
        Scroll eller bruk to fingre for å zoome inn eller ut.
      </p>
      <p className="p-4">
        <FontAwesomeIcon className="mr-2" icon={faHandRock} />
        Klikk og dra for å flytte et selskap eller aksjonær.
      </p>
      <p className="p-4">
        <FontAwesomeIcon className="mr-2" icon={faHandRock} />
        Klikk og dra bakgrunnen for å flytte grafen.
      </p>
    </div>
  );
};

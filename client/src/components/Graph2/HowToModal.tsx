import { faHandLizard, faHandPointer, faHandRock } from "@fortawesome/free-regular-svg-icons";
import { faInfoCircle, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useState } from "react";
import { AppContext } from "../../AppContext";
import { NeuButton } from "../NeuButton";

export const HowToModal = () => {
  const { theme } = useContext(AppContext);

  const [isOpen, setIsOpen] = useState<boolean>(false);

  if (!isOpen)
    return (
      <div className="absolute flex right-0 bottom-0 p-2">
        <NeuButton icon={faInfoCircle} className="text-primary p-2" action={() => setIsOpen(!isOpen)} />
      </div>
    );

  return (
    <div
      className="absolute h-3/4 md:vh-1/2 vw-75 md:vw-1/2"
      style={{
        color: theme.text,
        right: 0,
        bottom: 0,
        ...theme.elevation,
        backgroundColor: theme.backgroundSecondary,
        overflow: "scroll",
      }}
    >
      <button className="float-right m-4" onClick={() => setIsOpen(false)}>
        <FontAwesomeIcon icon={faTimes} style={{ color: theme.muted }} />
      </button>
      <h5 className="text-xl font-bold p-2">
        <FontAwesomeIcon className="mr-4" style={{ color: theme.primary }} icon={faInfoCircle} />
        Sånn bruker du Aksjegrafen:
      </h5>
      <p className="p-2 m-0">
        <FontAwesomeIcon className="mr-2" icon={faHandPointer} />
        Trykk på et selskap, aksjonær eller rolleinnehaver for å se meny med valgmuligheter.
      </p>
      <p className="p-2 m-0">
        <FontAwesomeIcon className="mr-2" icon={faHandLizard} />
        Scroll eller bruk to fingre for å zoome inn eller ut.
      </p>
      <p className="p-2">
        <FontAwesomeIcon className="mr-2" icon={faHandRock} />
        Klikk og dra for å flytte et selskap eller aksjonær.
      </p>
      <p className="p-2">
        <FontAwesomeIcon className="mr-2" icon={faHandRock} />
        Klikk og dra bakgrunnen for å flytte grafen.
      </p>
      <section className="flex items-center p-2">
        <div className="w-8 h-6 border-4 border-gray/20 border-b-secondary rounded-lg mr-2"></div>
        <p>Investor som har investeringer i grafen</p>
      </section>
      <section className="flex items-center p-2">
        <div className="w-8 h-6 border-4 border-gray/20 border-t-primary rounded-lg mr-2"></div>
        <p>Investering som har investorer i grafen</p>
      </section>
      <section className="flex items-center p-2">
        <div className="w-8 h-6 border-4 border-gray/20 border-l-success rounded-lg mr-2"></div>
        <p>Enhet som har rolleinnehavere i grafen</p>
      </section>
      <section className="flex items-center p-2">
        <div className="w-8 h-6 border-4 border-gray/20 border-r-warning rounded-lg mr-2"></div>
        <p>Aktør som har en rolle i en enhet i grafen</p>
      </section>
    </div>
  );
};

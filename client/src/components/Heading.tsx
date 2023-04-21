import { useContext } from "react";
import { Container } from "react-bootstrap";
import { AppContext } from "../AppContext";

export const Heading = () => {
  const { theme } = useContext(AppContext);
  return (
    <Container className="rounded p-sm-5 p-4">
      <p
        className="small rounded p-4 m-0"
        style={{ color: theme.text, borderColor: theme.primary, borderWidth: "1px", borderStyle: "solid" }}
      >
        I{" "}
        <span style={{ color: theme.primary }} className="font-weight-bold">
          Aksjegrafen
        </span>{" "}
        kan du søke opp alle aksjonærer og aksjeselskaper i Norge. Naviger gjennom nettverket av investorer og
        investeringer, se hvem som eier hvilke selskap, hvordan eierskapet har endret seg over tid, finansielle
        nøkkeltall og informasjon fra enhetsregisteret.
      </p>
    </Container>
  );
};

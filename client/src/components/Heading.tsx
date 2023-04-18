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
        kan du søke opp alle aksjonærer og aksjeselskaper i Norge. Disse presenteres i en <i>graf</i> - eller nettverk
        om du vil. Denne typen visualisering gjør at man enkelt kan få oversikt over komplekse eierskapsstrukturer.
      </p>
    </Container>
  );
};

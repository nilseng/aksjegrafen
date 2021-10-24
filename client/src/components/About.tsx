import { useContext } from "react";
import { Container } from "react-bootstrap";
import { AppContext } from "../App";
import sample_img from "../images/aksjegrafen_pureokrs.png";

export const About = () => {
  const { theme } = useContext(AppContext);
  return (
    <Container
      className="d-flex justify-content-center align-items-middle h-100 p-5"
      style={{ color: theme.text }}
    >
      <div
        className="w-75 p-5 rounded"
        style={{ backgroundColor: theme.backgroundSecondary }}
      >
        <p className="display-4">Om aksjegrafen</p>
        <p>
          Aksjegrafen kan brukes til å søke opp norske aksjonærer og
          aksjeselskaper. Aksjonærene, selskapene og deres relasjoner
          presenteres i en <i>graf</i> - eller nettverk om du vil. Denne typen
          visualisering gjør at man enkelt kan se komplekse sammenhenger i ett
          bilde.
        </p>
        <p>
          Aksjegrafen er utviklet av selskapet PureOKRs AS som eies av meg,
          Teodor Nilseng Danielsen. Bare se her:
        </p>
        <div
          className="w-100 d-flex justify-content-center"
          style={{ padding: "4rem" }}
        >
          <img
            style={{ height: "400px" }}
            src={sample_img}
            alt="Eksempel fra Aksjegrafen - Teodor eier PureOKRs AS"
          />
        </div>
      </div>
    </Container>
  );
};

import { useContext } from "react";
import { Container } from "react-bootstrap";
import { AppContext } from "../App";

import "./About.scss";

import pureokrs_img_light from "../images/aksjegrafen_pureokrs_light.png";
import pureokrs_img_dark from "../images/aksjegrafen_pureokrs_dark.png";
import telenor_img_light from "../images/telenor_asa_light.png";
import telenor_img_dark from "../images/telenor_asa_dark.png";
import kjendis_light from "../images/kjendis_light.png";
import kjendis_dark from "../images/kjendis_dark.png";

export const About = () => {
  const { theme } = useContext(AppContext);
  return (
    <div className="d-flex w-100" style={{ minHeight: "100vh" }}>
      <Container className="d-flex justify-content-center align-items-middle" style={{ color: theme.text }}>
        <div className="my-5 rounded">
          <div
            className="p-4"
            style={{
              backgroundColor: theme.background,
              ...theme.lowering,
            }}
          >
            <h4>Om Aksjegrafen</h4>
            <p className="m-0">
              Aksjegrafen kan brukes til å søke opp norske aksjonærer og aksjeselskaper. Aksjonærene, selskapene og
              deres relasjoner presenteres i en <i>graf</i> - eller nettverk om du vil. Denne typen visualisering gjør
              at man enkelt kan se komplekse sammenhenger i ett bilde.
            </p>
          </div>
          <div className="text-center mt-5 p-4" style={{ ...theme.elevation }}>
            <a href="/graph?_id=61229167c79b48b7e3e0bc90" style={{ textDecoration: "none", color: theme.text }}>
              <p className="m-0">
                Man kan for eksempel se hvilke selskaper store norske konsern eier - her Telenor ASA:
              </p>
              <div className="d-flex justify-content-center py-4">
                <img
                  className="about-image"
                  src={theme.id === "light" ? telenor_img_light : telenor_img_dark}
                  alt="Eksempel fra Aksjegrafen - Teodor eier PureOKRs AS"
                />
              </div>
            </a>
          </div>
          <div className="mt-5 p-4" style={{ ...theme.lowering }}>
            <a href="/graph?_id=61229164c79b48b7e3e049a5" style={{ textDecoration: "none", color: theme.text }}>
              <p className="text-center m-0">
                Eller finne ut hvordan kjendisinvestorer har organisert selskapene sine:
              </p>
              <div className="d-flex justify-content-center py-4">
                <img
                  className="about-image"
                  src={theme.id === "light" ? kjendis_light : kjendis_dark}
                  alt="Eksempel fra Aksjegrafen - Teodor eier PureOKRs AS"
                />
              </div>
            </a>
          </div>
          <div className="mt-5 p-4" style={{ ...theme.elevation }}>
            <a href="/graph?_id=61229a9bc79b48b7e30c24c5" style={{ textDecoration: "none", color: theme.text }}>
              <p className="text-center m-0">
                Aksjegrafen er utviklet av selskapet PureOKRs AS som eies av meg, Teodor Nilseng Danielsen:
              </p>
              <div className="d-flex justify-content-center py-4">
                <img
                  style={{ height: "360px" }}
                  src={theme.id === "light" ? pureokrs_img_light : pureokrs_img_dark}
                  alt="Eksempel fra Aksjegrafen - Teodor eier PureOKRs AS"
                />
              </div>
            </a>
          </div>
        </div>
      </Container>
    </div>
  );
};

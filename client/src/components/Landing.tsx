import { Container } from "react-bootstrap";
import { About } from "./About";
import { Disclaimer } from "./Disclaimer";
import { Heading } from "./Heading";
import { SearchView } from "./SearchView";

export const Landing = () => {
  return (
    <div className="w-100">
      <div className="d-flex flex-column justify-content-center" style={{ minHeight: "100%" }}>
        <Container className="p-4">
          <h5 className="text-warning">Achtung!</h5>
          <p className="border border-warning rounded small p-4">
            Aksjegrafen gjennomgår en større endring i datamodellen, og unøyaktigheter må påregnes i et par dager, men
            om litt kommer en forbedret versjon med nye kule features.
          </p>
        </Container>
        <SearchView />
        <Heading />
      </div>
      <About />
      <Disclaimer />
    </div>
  );
};

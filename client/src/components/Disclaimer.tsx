import { useContext } from "react";
import { Container } from "react-bootstrap";
import { AppContext } from "../AppContext";

export const Disclaimer = () => {
  const { theme } = useContext(AppContext);
  return (
    <Container className="py-4">
      <div className="w-100 p-3" style={theme.lowering}>
        <div className="rounded p-3" style={{ border: `${theme.primary} solid 1px` }}>
          <p className="small text-muted text-center m-0">
            All data er hentet fra Skatteetatens aksjonærregister og Brønnøysundregistrenes APIer og er bearbeidet av
            Aksjegrafen. Feil kan forekomme. Siden eies og er utviklet av Pureokrs AS (contact@pureokrs.com).
          </p>
        </div>
      </div>
    </Container>
  );
};

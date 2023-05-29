import { useContext } from "react";
import { AppContext } from "../AppContext";

export const Disclaimer = () => {
  const { theme } = useContext(AppContext);
  return (
    <div className="w-full flex justify-center p-5">
      <div className="w-full max-w-3xl text-xs text-muted text-center p-5" style={theme.lowering}>
        All data er hentet fra Skatteetatens aksjonærregister og Brønnøysundregistrenes APIer og er bearbeidet av
        Aksjegrafen. Feil kan forekomme. Siden eies og er utviklet av Pureokrs AS (contact@pureokrs.com).
      </div>
    </div>
  );
};

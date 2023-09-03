import { useEffect, useState } from "react";
import { buildQuery } from "../utils/buildQuery";

const brregUrl = "https://data.brreg.no/enhetsregisteret/api";

export interface IFinancials {
  id: number;
  journalnr: string;
  regnskapstype: string;
  virksomhet: {
    organisasjonsnummer: string;
    organisasjonsform: string;
    morselskap: boolean;
  };
  regnskapsperiode: {
    fraDato: string;
    tilDato: string;
  };
  valuta: string;
  avviklingsregnskap: boolean;
  oppstillingsplan: string;
  revisjon: {
    ikkeRevidertAarsregnskap: boolean;
    fravalgRevisjon: boolean;
  };
  regnkapsprinsipper: {
    smaaForetak: boolean;
    regnskapsregler: string;
  };
  egenkapitalGjeld: {
    sumEgenkapitalGjeld: number;
    egenkapital: {
      sumEgenkapital: number;
      opptjentEgenkapital: {
        sumOpptjentEgenkapital: number;
      };
      innskuttEgenkapital: {
        sumInnskuttEgenkaptial: number;
      };
    };
    gjeldOversikt: {
      sumGjeld: number;
      kortsiktigGjeld: {
        sumKortsiktigGjeld: number;
      };
      langsiktigGjeld: {
        sumLangsiktigGjeld: number;
      };
    };
  };
  eiendeler: {
    sumEiendeler: number;
    omloepsmidler: {
      sumOmloepsmidler: number;
    };
    anleggsmidler: {
      sumAnleggsmidler: number;
    };
  };
  resultatregnskapResultat: {
    ordinaertResultatFoerSkattekostnad: number;
    aarsresultat: number;
    totalresultat: number;
    finansresultat: {
      nettoFinans: number;
      finansinntekt: {
        sumFinansinntekter: number;
      };
      finanskostnad: {
        sumFinanskostnad: number;
      };
    };
    driftsresultat: {
      driftsresultat: number;
      driftsinntekter: {
        sumDriftsinntekter: number;
      };
      driftskostnad: {
        sumDriftskostnad: number;
      };
    };
  };
}

export interface IBrregUnitSuccessResult {
  _embedded?: {
    enheter: IBrregUnit[];
  };
  page: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
  _links: {
    first: {
      href: string;
    };
    self: {
      href: string;
    };
    next: {
      href: string;
    };
    last: {
      href: string;
    };
  };
}

interface IBrregUnitErrorResult {
  tidsstempel: number;
  status: number;
  feilmelding: string;
  sti: string;
  antallFeil: number;
  valideringsfeil: {
    feilmelding: string;
    parametere: string[];
    feilaktigVerdi: string;
  }[];
}

export type IBrregUnitResult = IBrregUnitSuccessResult | IBrregUnitErrorResult;

export const isBrregUnitSearchError = (res: IBrregUnitResult): res is IBrregUnitErrorResult =>
  !!(res as unknown as IBrregUnitErrorResult).feilmelding;

export interface IBrregUnit {
  organisasjonsnummer: string;
  navn: string;
  organisasjonsform: Organisasjonsform;
  registreringsdatoEnhetsregisteret: string;
  registrertIMvaregisteret: boolean;
  naeringskode1?: Naeringskode1;
  naeringskode2?: Naeringskode2;
  naeringskode3?: Naeringskode3;
  antallAnsatte: number;
  forretningsadresse: Forretningsadresse;
  postadresse?: Forretningsadresse;
  stiftelsesdato: string;
  institusjonellSektorkode: InstitusjonellSektorkode;
  registrertIForetaksregisteret: boolean;
  registrertIStiftelsesregisteret: boolean;
  registrertIFrivillighetsregisteret: boolean;
  konkurs: boolean;
  underAvvikling: boolean;
  underTvangsavviklingEllerTvangsopplosning: boolean;
  maalform: string;
  hjemmeside: string;
  slettedato?: string;
  _links: Links;
}

export interface Organisasjonsform {
  kode: string;
  beskrivelse: string;
  _links: Links;
}

export interface Links {
  self: Self;
}

export interface Self {
  href: string;
}

export interface Naeringskode1 {
  beskrivelse: string;
  kode: string;
}

export interface Naeringskode2 extends Naeringskode1 {
  hjelpeenhetskode?: boolean;
}

export interface Naeringskode3 extends Naeringskode1 {
  hjelpeenhetskode?: boolean;
}

export interface Forretningsadresse {
  land: string;
  landkode: string;
  postnummer: string;
  poststed: string;
  adresse: string[];
  kommune: string;
  kommunenummer: string;
}

export interface InstitusjonellSektorkode {
  kode: string;
  beskrivelse: string;
}

export const getBrregUnit = async (orgnr: string) => {
  const res = await fetch(`${brregUrl}/enheter/${orgnr}`).catch(() =>
    console.warn(`Could not fetch info from brreg for company with orgnr=${orgnr}`)
  );
  return res ? res.json() : res;
};

export interface IBrregUnitSearchParams {
  page?: number;
  navn?: string;
  [key: string]: number | string | undefined;
}
export const searchBrregUnits = async (searchParams?: IBrregUnitSearchParams): Promise<IBrregUnitResult> => {
  const queryString = buildQuery(searchParams as { [key: string]: number | string });
  const res = await fetch(`${brregUrl}/enheter${queryString}`);
  return res ? res.json() : res;
};

export const getFinancialsByUnit = async (orgnr: string) => {
  const res = await fetch(`brreg/financials?orgnr=${orgnr}`).catch(() =>
    console.warn(`Could not fetch financials from brreg for company with orgnr=${orgnr}`)
  );
  return res ? res.json() : res;
};

export const getOrgForms = async () => {
  const res = await fetch(`${brregUrl}/organisasjonsformer`);
  return res ? res.json() : res;
};

interface RoleTypeResponse {
  _embedded: {
    rolletyper: {
      kode: string;
      beskrivelse: string;
      _links: {
        self: {
          href: string;
        };
      };
    }[];
  };
  _links: {
    self: {
      href: string;
    };
  };
}
export const getRoleTypes = async (): Promise<RoleTypeResponse> => {
  const res = await fetch("https://data.brreg.no/enhetsregisteret/api/roller/rolletyper");
  return res ? res.json() : res;
};

export const useBrregEntityInfo = (orgnr?: string) => {
  const [info, setInfo] = useState<IBrregUnit>();

  useEffect(() => {
    if (orgnr) {
      getBrregUnit(orgnr).then((res) => setInfo(res));
    }
    return () => setInfo(undefined);
  }, [orgnr]);

  return info;
};

export const useFinancialsByUnit = (orgnr?: string) => {
  const [financials, setFinancials] = useState<IFinancials[]>();
  const [isLoading, setIsLoading] = useState<boolean>();

  useEffect(() => {
    if (orgnr) {
      setIsLoading(true);
      getFinancialsByUnit(orgnr).then((res) => {
        setFinancials(res);
        setIsLoading(false);
      });
    }
    return () => {
      setFinancials(undefined);
      setIsLoading(false);
    };
  }, [orgnr]);

  return { financials, isLoading };
};

export const useRoleTypes = (): RoleTypeResponse["_embedded"]["rolletyper"] | undefined => {
  const [roleTypes, setRoleTypes] = useState<RoleTypeResponse["_embedded"]["rolletyper"]>();

  useEffect(() => {
    getRoleTypes().then((res) => setRoleTypes(res._embedded.rolletyper));

    return () => {
      setRoleTypes(undefined);
    };
  }, []);

  return roleTypes;
};

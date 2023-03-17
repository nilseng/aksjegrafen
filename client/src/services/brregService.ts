import { useEffect, useState } from "react";
import { ICompany, IShareholder } from "../models/models";
import { buildQuery } from "../utils/buildQuery";

const brregUrl = "https://data.brreg.no/enhetsregisteret/api/enheter";

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

interface IBrregUnit {
  organisasjonsnummer: string;
  navn: string;
  organisasjonsform: {
    kode: string;
    beskrivelse: string;
    _links: {
      self: {
        href: string;
      };
    };
  };
}

export const getBrregUnit = async (orgnr: string) => {
  const res = await fetch(`${brregUrl}/${orgnr}`).catch(() =>
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
  const res = await fetch(`${brregUrl}/${queryString}`);
  return res ? res.json() : res;
};

export const getFinancialsByUnit = async (orgnr: string) => {
  const res = await fetch(`brreg/financials?orgnr=${orgnr}`).catch(() =>
    console.warn(`Could not fetch financials from brreg for company with orgnr=${orgnr}`)
  );
  return res ? res.json() : res;
};

export const useBrregEntityInfo = (entity?: ICompany | IShareholder) => {
  const [info, setInfo] = useState<any>();

  useEffect(() => {
    if (entity?.orgnr) {
      getBrregUnit(entity.orgnr).then((res) => setInfo(res));
    }
    return () => setInfo(undefined);
  }, [entity]);

  return info;
};

export const useFinancialsByUnit = (entity?: ICompany | IShareholder) => {
  const [financials, setFinancials] = useState<IFinancials[]>();

  useEffect(() => {
    if (entity?.orgnr) {
      getFinancialsByUnit(entity.orgnr).then((res) => setFinancials(res));
    }
    return () => setFinancials(undefined);
  }, [entity]);

  return financials;
};

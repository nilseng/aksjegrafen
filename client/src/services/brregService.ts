import { useEffect, useState } from "react";
import { ICompany, IShareholder } from "../models/models";

const brregUrl = "https://data.brreg.no/enhetsregisteret/api/enheter";

export const getBrregUnit = async (orgnr: string) => {
  const res = await fetch(`${brregUrl}/${orgnr}`).catch((e) =>
    console.warn(`Could not fetch info from brreg for company with orgnr=${orgnr}`)
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

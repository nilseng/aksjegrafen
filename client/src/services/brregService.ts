import { useEffect, useState } from "react";
import { ICompany, IShareholder } from "../models/models";

const brregUrl = "https://data.brreg.no/enhetsregisteret/api/enheter";

export const getBrregUnit = async (orgnr: string) => {
  const res = await fetch(`${brregUrl}/${orgnr}`);
  return res.json();
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

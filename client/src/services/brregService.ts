import { useEffect, useState } from "react";
import { ICompany, IShareholder } from "../models/models";

const brregUrl = "https://data.brreg.no";
const enhetsregisterPath = "/enhetsregisteret/api/enheter";
const regnskapsregisterPath = "/regnskapsregisteret/regnskap";

export const getBrregUnit = async (orgnr: string) => {
  const res = await fetch(`${brregUrl}${enhetsregisterPath}/${orgnr}`).catch((e) =>
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

export const getFinancialsByOrgnr = async (orgnr: string) => {
  const res = await fetch(`${brregUrl}${regnskapsregisterPath}/${orgnr}`, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Request-Headers": "*",
      Accept: "*/*",
      "Content-Type": "*",
      mode: "cors",
    },
  }).catch((e) => console.warn(`Could not fetch financials from brreg for company with orgnr=${orgnr}`));
  return res;
};

export const useBrregFinancials = (entity?: ICompany | IShareholder) => {
  const [data, setData] = useState<any>();

  useEffect(() => {
    if (entity?.orgnr) {
      getFinancialsByOrgnr(entity.orgnr).then((res) => setData(res));
    }
    return () => setData(undefined);
  }, [entity]);

  return data;
};

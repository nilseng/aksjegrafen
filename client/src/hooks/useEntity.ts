import { useEffect, useState } from "react";
import { ICompany, IShareholder } from "../models/models";
import { useGetCompany, useGetShareholder } from "../services/apiService";
import { useQuery } from "./useQuery";

export const useEntity = () => {
  const query = useQuery();

  const [companyId, setCompanyId] = useState<string>();
  const [shareholder_id, setShareholder_id] = useState<string>();
  const [orgnr, setOrgnr] = useState<string>();

  // #1: Query parameters are read
  useEffect(() => {
    const c_id = query.get("_id");
    const orgnr = query.get("orgnr");
    const s_id = query.get("shareholder_id");
    setCompanyId(c_id ?? undefined);
    setOrgnr(orgnr ?? undefined);
    setShareholder_id(s_id ?? undefined);
    return () => {
      setCompanyId(undefined);
      setOrgnr(undefined);
      setShareholder_id(undefined);
    };
  }, [query]);

  // #2.1.1: If there is a shareholder_id, a shareholder is retrieved
  const shareholder = useGetShareholder(shareholder_id);

  // #2.1.2: If there is a shareholder and the shareholder has an orgnr, set orgnr
  useEffect(() => {
    if (shareholder?.orgnr) setOrgnr(shareholder.orgnr);
    return () => setOrgnr(undefined);
  }, [shareholder]);

  // #2.2.1 || #2.1.3: If there is an orgnr, a company is retrieved if it exists
  const company = useGetCompany(companyId, orgnr);

  const [entity, setEntity] = useState<ICompany | IShareholder>();

  useEffect(() => {
    setEntity(company ?? shareholder);
    return () => setEntity(undefined);
  }, [company, shareholder]);

  return { entity, setEntity, setCompanyId, setOrgnr, setShareholder_id };
};

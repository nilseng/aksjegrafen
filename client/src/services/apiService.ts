import { useEffect, useState } from "react";
import { ICompany, IOwnership, IShareholder } from "../models/models";
import { buildQuery } from "../utils/buildQuery";

export const getCompany = async (id: string) => {
  const res = await fetch(`/api/company?_id=${id}`);
  return res.json();
};

export const getCompanyByOrgnr = async (orgnr: string) => {
  const res = await fetch(`/api/company?orgnr=${orgnr}`);
  return res.json();
};

export const getCompanies = async (searchTerm?: string, limit?: number) => {
  const res = await fetch(searchTerm ? `/api/company/${searchTerm}?limit=${limit}` : `/api/companies?limit=${limit}`);
  return res.json();
};

export const getCompanyCount = async (searchTerm?: string) => {
  const res = await fetch(searchTerm ? `/api/company/${searchTerm}?count=true` : "/api/company?count=true");
  return res.json();
};

export const getShareholder = async (_id?: string, shareholderId?: string) => {
  if (_id) {
    const res = await fetch(`/api/shareholder?_id=${_id}`);
    return res.json();
  } else if (shareholderId) {
    const params = new URLSearchParams();
    params.append("shareholderId", shareholderId);
    const res = await fetch(`/api/shareholder?${params.toString()}`);
    return res.json();
  } else {
    return new Promise(() => undefined);
  }
};

export const getShareholders = async (limit?: number) => {
  const res = await fetch(`/api/shareholders?limit=${limit}`);
  return res.json();
};

export const getShareholderCount = async () => {
  const res = await fetch("/api/shareholder?count=true");
  return res.json();
};

export const getOwnerships = async (year?: number, limit?: number) => {
  const res = await fetch(`/api/ownerships?limit=${limit}&year=${year}`);
  return res.json();
};

export const getInvestors = async (
  entity?: ICompany | IShareholder,
  year?: number,
  limit?: number,
  skip: number = 0
): Promise<IOwnership[] | undefined> => {
  if (entity?.orgnr) {
    const query = buildQuery({ orgnr: entity.orgnr, year, limit, skip });
    const path = `/api/investors${query}`;
    const res = await fetch(path).catch((e) => {
      console.error(e);
      return undefined;
    });
    return res ? res.json() : [];
  }
};

export const getInvestments = async (
  entity: ICompany | IShareholder,
  year?: number,
  limit?: number,
  skip: number = 0
): Promise<IOwnership[] | undefined> => {
  if (!entity.orgnr && !(entity as IShareholder).id) return;
  const identifier = entity.orgnr ? { shareholderOrgnr: entity.orgnr } : { shareHolderId: (entity as IShareholder).id };
  const query = buildQuery({ ...identifier, year, limit, skip });
  const path = `/api/investments${query}`;
  const res = await fetch(path).catch((e) => {
    console.log(e);
    return undefined;
  });
  return res ? res.json() : [];
};

export const getInvestorCount = async (company: ICompany, year: number) => {
  const res = await fetch(`/api/investors?orgnr=${company.orgnr}&year=${year}&count=true`);
  return res.json();
};

export const useShareholderCount = () => {
  const [count, setCount] = useState<number>();

  useEffect(() => {
    getShareholderCount().then((res) => setCount(res));

    return () => setCount(undefined);
  }, [setCount]);

  return count;
};

export const useCompanyCount = (searchTerm?: string) => {
  const [count, setCount] = useState<number>();

  useEffect(() => {
    getCompanyCount(searchTerm).then((res) => setCount(res));

    return () => setCount(undefined);
  }, [setCount, searchTerm]);

  return count;
};

export const useInvestors = (entity?: ICompany | IShareholder, year?: number, limit?: number, skip: number = 0) => {
  const [investors, setInvestors] = useState<IOwnership[]>();
  const [loading, setLoading] = useState<boolean>();
  useEffect(() => {
    setLoading(true);
    getInvestors(entity, year, limit, skip).then((o) => {
      setInvestors(o);
      setLoading(false);
    });
    return () => {
      setInvestors(undefined);
      setLoading(undefined);
    };
  }, [entity, limit, year, skip]);
  return { investors, setInvestors, loading };
};

export const useInvestments = (entity?: ICompany | IShareholder, year?: number, limit?: number, skip: number = 0) => {
  const [investments, setInvestments] = useState<IOwnership[]>();
  const [loading, setLoading] = useState<boolean>();
  useEffect(() => {
    if (entity) {
      setLoading(true);
      getInvestments(entity, year, limit, skip).then((o) => {
        setInvestments(o);
        setLoading(false);
      });
    }
    return () => {
      setInvestments(undefined);
      setLoading(undefined);
    };
  }, [entity, limit, skip, year]);
  return { investments, setInvestments, loading };
};

export const useGetCompany = (id?: string, orgnr?: string) => {
  const [company, setCompany] = useState<ICompany>();
  const [loading, setLoading] = useState<boolean>();
  useEffect(() => {
    if (id) {
      setLoading(true);
      getCompany(id).then((c) => {
        if (c.error) return;
        setCompany(c);
        setLoading(false);
      });
    } else if (orgnr) {
      setLoading(true);
      getCompanyByOrgnr(orgnr).then((c) => {
        if (!c || c.error) {
          console.warn(`No company with orgnr=${orgnr} found.`);
          return;
        }
        setCompany(c);
        setLoading(false);
      });
    }
    return () => setCompany(undefined);
  }, [id, orgnr]);

  return { company, loading };
};

export const useCompanies = (searchTerm?: string, limit?: number) => {
  const [companies, setCompanies] = useState<ICompany[]>();
  useEffect(() => {
    getCompanies(searchTerm, limit).then((c) => {
      if (c.error) return;
      setCompanies(c);
    });
  }, [searchTerm, limit]);
  return companies;
};

export const useShareholders = (limit?: number) => {
  const [shareholders, setShareholders] = useState<IShareholder[]>();
  useEffect(() => {
    getShareholders(limit).then((s) => {
      if (s.error) return;
      setShareholders(s);
    });
  }, [limit]);
  return shareholders;
};

export const useOwnerships = (year?: number, limit?: number) => {
  const [ownerships, setOwnerships] = useState<IOwnership[]>();
  useEffect(() => {
    getOwnerships(year, limit).then((o) => {
      if (o.error) return;
      setOwnerships(o);
    });
  }, [year, limit]);
  return ownerships;
};

export const useGetShareholder = (_id?: string, shareholderId?: string) => {
  const [shareholder, setShareholder] = useState<IShareholder>();
  const [loading, setLoading] = useState<boolean>();
  useEffect(() => {
    if (_id) {
      setLoading(true);
      getShareholder(_id).then((s) => {
        if (s.error) return;
        setShareholder(s);
        setLoading(false);
      });
    } else if (shareholderId) {
      setLoading(true);
      getShareholder(undefined, shareholderId).then((s) => {
        if (s?.error) return;
        setShareholder(s);
        setLoading(false);
      });
    }

    return () => {
      setShareholder(undefined);
      setLoading(false);
    };
  }, [_id, shareholderId]);

  return { shareholder, loading };
};

export const useInvestorCount = (
  company?: ICompany,
  year?: number
): { count: number | undefined; loading: boolean | undefined } => {
  const [count, setCount] = useState<number>();
  const [loading, setLoading] = useState<boolean>();
  useEffect(() => {
    if (company && year) {
      setLoading(true);
      getInvestorCount(company, year).then((c) => {
        if (c.error) return;
        setCount(c);
        setLoading(false);
      });
    }
    return () => {
      setCount(undefined);
      setLoading(undefined);
    };
  }, [company, year]);

  return { count, loading };
};

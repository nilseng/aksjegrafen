import { useEffect, useState } from "react";
import { ICompany, IOwnership } from "../models/models";

export const getCompanyCount = async () => {
    const res = await fetch("/api/company?count=true")
    return res.json()
}

export const getShareholderCount = async () => {
    const res = await fetch("/api/shareholder?count=true")
    return res.json()
}

export const getShareholderOwnerships = async (company: ICompany) => {
    const res = await fetch(`/api/ownerships?orgnr=${company.orgnr}`)
    return res.json()
}

export const getCompanyOwnerships = async (company: ICompany) => {
    const res = await fetch(`/api/ownerships?shareholderOrgnr=${company.orgnr}`)
    return res.json()
}

export const getCompany = async (id: string) => {
    const res = await fetch(`/api/company?_id=${id}`)
    return res.json()
}

export const getCompanyByOrgnr = async (orgnr: string) => {
    const res = await fetch(`/api/company?orgnr=${orgnr}`)
    return res.json()
}

export const getOwnershipCount = async (company: ICompany, year: number) => {
    const res = await fetch(`/api/ownerships?orgnr=${company.orgnr}&year=${year}&count=true`)
    return res.json()
}

export const useShareholderCount = () => {
    const [count, setCount] = useState<number>()

    useEffect(() => {
        getShareholderCount().then(res => setCount(res))
    }, [setCount])

    return count
}

export const useCompanyCount = () => {
    const [count, setCount] = useState<number>()

    useEffect(() => {
        getCompanyCount().then(res => setCount(res))
    }, [setCount])

    return count
}

export const useGetShareholderOwnerships = (company?: ICompany) => {
    const [shareholderOwnerships, setShareholderOwnerships] = useState<IOwnership[]>()
    useEffect(() => {
        if (company) {
            getShareholderOwnerships(company).then(async (o) => {
                if (o?.error) {
                    setShareholderOwnerships([]);
                } else setShareholderOwnerships(o);
            });
        }
        return () => setShareholderOwnerships(undefined)
    }, [company]);
    return { shareholderOwnerships, setShareholderOwnerships }
}

export const useGetCompanyOwnerships = (company?: ICompany) => {
    const [companyOwnerships, setCompanyOwnerships] = useState<IOwnership[]>()
    useEffect(() => {
        if (company) {
            getCompanyOwnerships(company).then(async o => {
                if (o?.error) {
                    setCompanyOwnerships([])
                } else setCompanyOwnerships(o)
            })
        }
        return () => setCompanyOwnerships(undefined)
    }, [company])
    return { companyOwnerships, setCompanyOwnerships }
}

export const useGetCompany = (id?: string, orgnr?: string) => {
    const [company, setCompany] = useState<ICompany>()
    useEffect(() => {
        if (id) {
            getCompany(id).then(async c => {
                if (c.error) return;
                setCompany(c)
            })
        } else if (orgnr) {
            getCompanyByOrgnr(orgnr).then(async c => {
                if (c.error) return;
                setCompany(c)
            })
        }
    }, [id, orgnr])

    return company
}

export const useGetOwnershipCount = (company?: ICompany, year?: number) => {
    const [count, setCount] = useState<number>()
    useEffect(() => {
        if (company && year) {
            getOwnershipCount(company, year).then(c => {
                if (c.error) return;
                setCount(c)
            })
        }
    }, [company, year])

    return count
}
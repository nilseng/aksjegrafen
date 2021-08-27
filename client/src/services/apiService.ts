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

export const getOwnerships = async (company: ICompany) => {
    const res = await fetch(`/api/ownerships?orgnr=${company.orgnr}`)
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

export const useGetOwnerships = (company?: ICompany) => {
    const [ownerships, setOwnerships] = useState<IOwnership[]>()
    useEffect(() => {
        if (company) {
            getOwnerships(company).then(async (o) => {
                if (o?.error) {
                    setOwnerships([]);
                } else setOwnerships(o);
            });
        }
    }, [company]);
    return { ownerships, setOwnerships }
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
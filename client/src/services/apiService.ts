import { useEffect, useState } from "react";
import { ICompany, IOwnership, IShareholder } from "../models/models";

export const getCompanyCount = async () => {
    const res = await fetch("/api/company?count=true")
    return res.json()
}

export const getShareholderCount = async () => {
    const res = await fetch("/api/shareholder?count=true")
    return res.json()
}

export const getOwnerOwnerships = async (company?: ICompany, shareholder?: IShareholder) => {
    if (company) {
        const res = await fetch(`/api/ownerships?orgnr=${company.orgnr}`)
        return res.json()
    }
    else if (shareholder) {
        const res = await fetch(`/api/ownerships?shareholderId=${shareholder.id}`)
        return res.json()
    }
}

export const getOwneeOwnerships = async (company?: ICompany, shareholder?: IShareholder) => {
    if (company) {
        const res = await fetch(`/api/ownerships?shareholderOrgnr=${company.orgnr}`)
        return res.json()
    }
    else if (shareholder) {
        const res = await fetch(`/api/ownerships?shareholderId=${shareholder.id}`)
        return res.json()
    }
}

export const getCompany = async (id: string) => {
    const res = await fetch(`/api/company?_id=${id}`)
    return res.json()
}

export const getCompanyByOrgnr = async (orgnr: string) => {
    const res = await fetch(`/api/company?orgnr=${orgnr}`)
    return res.json()
}

export const getShareholder = async (_id?: string, shareholderId?: string) => {
    if (_id) {
        const res = await fetch(`/api/shareholder?_id=${_id}`)
        return res.json()
    } else if (shareholderId) {
        const res = await fetch(`/api/shareholder?shareholderId=${shareholderId}`)
        return res.json()
    } else {
        return new Promise(() => undefined)
    }
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

export const useGetOwnerOwnerships = (company?: ICompany, shareholder?: IShareholder) => {
    const [ownerOwnerships, setOwnerOwnerships] = useState<IOwnership[]>()
    useEffect(() => {
        if (company) {
            getOwnerOwnerships(company).then((o) => {
                if (o?.error) {
                    setOwnerOwnerships([]);
                } else setOwnerOwnerships(o);
            });
        }
        else if (shareholder) {
            getOwnerOwnerships(undefined, shareholder).then((o) => {
                if (o?.error) {
                    setOwnerOwnerships([]);
                } else setOwnerOwnerships(o);
            });
        }
        return () => setOwnerOwnerships(undefined)
    }, [company, shareholder]);
    return { ownerOwnerships, setOwnerOwnerships }
}

export const useGetOwneeOwnerships = (company?: ICompany, shareholder?: IShareholder) => {
    const [owneeOwnerships, setOwneeOwnerships] = useState<IOwnership[]>()
    useEffect(() => {
        if (company) {
            getOwneeOwnerships(company).then(o => {
                if (o?.error) {
                    setOwneeOwnerships([])
                } else setOwneeOwnerships(o)
            })
        } else if (shareholder) {
            getOwneeOwnerships(undefined, shareholder).then(o => {
                if (o?.error) setOwneeOwnerships([])
                else setOwneeOwnerships(o)
            })
        }
        return () => setOwneeOwnerships(undefined)
    }, [company, shareholder])
    return { owneeOwnerships, setOwneeOwnerships }
}

export const useGetCompany = (id?: string, orgnr?: string) => {
    const [company, setCompany] = useState<ICompany>()
    useEffect(() => {
        if (id) {
            getCompany(id).then(c => {
                if (c.error) return;
                setCompany(c)
            })
        } else if (orgnr) {
            getCompanyByOrgnr(orgnr).then(c => {
                if (c.error) return;
                setCompany(c)
            })
        }
    }, [id, orgnr])

    return company
}

export const useGetShareholder = (_id?: string, shareholderId?: string) => {
    const [shareholder, setShareholder] = useState<IShareholder>()
    useEffect(() => {
        if (_id) {
            getShareholder(_id).then(s => {
                if (s.error) return;
                setShareholder(s)
            })
        } else if (shareholderId) {
            getShareholder(undefined, shareholderId).then(s => {
                if (s.error) return;
                setShareholder(s)
            })
        }
    }, [_id, shareholderId])

    return shareholder
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
        return setCount(undefined)
    }, [company, year])

    return count
}
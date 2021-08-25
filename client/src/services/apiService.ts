import { useEffect, useState } from "react";

export const getCompanyCount = async () => {
    const res = await fetch("/api/company?count=true")
    return res.json()
}

export const getShareholderCount = async () => {
    const res = await fetch("/api/shareholder?count=true")
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
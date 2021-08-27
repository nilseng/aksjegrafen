import express from "express"
import { ObjectID } from "mongodb"
import { checkJwt } from "../auth/auth"
import { collections as db } from "../database/databaseSetup"
import querystring from "querystring"
import { Company, Ownership, Shareholder } from "../models/models"

const router = express.Router()

router.get('/company', async (req, res) => {
    if (req.query.count) {
        const count = await db.companies.countDocuments()
        return res.status(200).json(count)
    } else if (req.query._id) {
        const company = await db.companies.findOne({ _id: new ObjectID(req.query._id as string) }).catch(e => console.error(e))
        return company ? res.status(200).json(company) : res.status(404).json({ error: 'Finding company failed.' })
    } else if (req.query.orgnr) {
        const company = await db.companies.findOne({ orgnr: req.query.orgnr }).catch(e => console.error(e))
        return company ? res.status(200).json(company) : res.status(404).json({ error: 'Finding company failed.' })
    } else {
        res.status(404).json({ error: 'Not found.' })
    }
})

router.get('/shareholder', async (req, res) => {
    if (req.query.count) {
        try {
            const count = await db.shareholders.countDocuments()
            return res.status(200).json(count)
        }
        catch (e) {
            return res.status(500).json({ error: 'Something went wrong.' })
        }
    } else if (req.query._id) {
        const shareholder = await db.shareholders.findOne({ _id: new ObjectID(req.query._id as string) }).catch(e => console.error(e))
        return shareholder ? res.status(200).json(shareholder) : res.status(404).json({ error: 'Finding shareholder failed.' })
    }
    else {
        res.status(404).json({ error: 'Not found.' })
    }
})

router.get('/shareholders', async (req, res) => {
    const shareholders = await db.shareholders.find({}).toArray().catch(e => console.error(e))
    return shareholders ? res.status(200).json(shareholders) : res.status(404).json({ error: 'Something went wrong.' })
})

router.get('/companies', async (req, res) => {
    const companies = await db.companies.find({}).toArray().catch(e => console.error(e))
    return companies ? res.status(200).json(companies) : res.status(404).json({ error: 'Something went wrong.' })
})

router.get("/company/:searchTerm", async (req, res) => {
    const companies = await db.companies.find(
        {
            $or: [
                { orgnr: { $regex: new RegExp(`^${req.params.searchTerm}`), $options: "i" } },
                { name: { $regex: req.params.searchTerm, $options: "i" } }
            ]
        }).limit(10).toArray().catch(e => console.error(e))
    if (!companies) return res.status(400).json({ error: 'Search failed.' })
    res.status(200).json(companies)
})

router.get("/shareholder/:searchTerm", async (req, res) => {
    const shareholders = await db.shareholders.find(
        {
            $or: [
                { orgnr: { $regex: new RegExp(`^${req.params.searchTerm}`), $options: "i" } },
                { name: { $regex: req.params.searchTerm, $options: "i" } }
            ]
        }).limit(10).toArray().catch(e => console.error(e))
    if (!shareholders) return res.status(400).json({ error: 'Search failed.' })
    res.status(200).json(shareholders)
})

router.get("/ownerships", async (req, res) => {
    if (req.query?.shareholderId) {
        try {
            const ownerships = await db.ownerships.find({ shareHolderId: decodeURI(req.query.shareholderId as string) }).toArray()
            const companies = await db.companies.find({ orgnr: { $in: ownerships.map((o: Ownership) => o.orgnr) } }).toArray()
            const data = ownerships.map(o => {
                o.company = companies.find((c: Company) => c.orgnr === o.orgnr)
                return o
            })
            const sortedData = data.sort((a: Ownership, b: Ownership) => {
                const aShare = a.company?.stocks ? a.stocks / a.company?.stocks : 0
                const bShare = b.company?.stocks ? b.stocks / b.company?.stocks : 0
                return bShare - aShare
            })
            return res.status(200).json(sortedData)
        } catch (e) {
            console.error(e)
            return res.status(500).json({ error: 'Something went wrong.' })
        }
    } else if (req.query?.orgnr) {
        if (req.query?.count && req.query?.year) {
            const count = await db.ownerships.countDocuments({ orgnr: req.query.orgnr, year: +req.query.year }).catch(e => ({ error: e }))
            return (count as { error: any }).error ? res.status(500).json(count) : res.status(200).json(count)
        } else {
            try {
                const ownerships = await db.ownerships.find({ orgnr: req.query.orgnr }).sort({ stocks: -1 }).limit(100).toArray()
                const shareholders = await db.shareholders.find({ id: { $in: ownerships.map((o: Ownership) => o.shareHolderId) } }).toArray()
                const data = ownerships.map((o: Ownership) => {
                    o.shareholder = shareholders.find((s: Shareholder) => s.id === o.shareHolderId)
                    return o
                })
                return res.status(200).json(data)
            } catch (e) {
                console.error(e)
                return res.status(500).json({ error: 'Something went wrong.' })
            }
        }
    } else {
        res.status(404).json({ error: 'Not found.' })
    }
})

export default router
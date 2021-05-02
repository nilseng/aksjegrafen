import express from "express"
import { ObjectID } from "mongodb"
import { checkJwt } from "../auth/auth"
import { collections as db } from "../database/databaseSetup"
import querystring from "querystring"
import { Company, Ownership } from "../models/models"

const router = express.Router()

router.get('/company', async (req, res) => {
    if (req.query.count) {
        const count = await db.companies.countDocuments()
        return res.status(200).json(count)
    } else {
        res.status(404).json('Not found.')
    }
})

router.get('/shareholder', async (req, res) => {
    if (req.query.count) {
        try {
            const count = await db.shareholders.countDocuments()
            return res.status(200).json(count)
        }
        catch (e) {
            return res.status(500).json('Something went wrong.')
        }
    } else if (req.query._id) {
        try {
            const shareholder = await db.shareholders.findOne({ _id: new ObjectID(req.query._id as string) })
            return res.status(200).json(shareholder)
        } catch (e) {
            console.error(e)
            return res.status(500).json('Something went wrong.')
        }
    }
    else {
        res.status(404).json('Not found.')
    }
})

router.get("/company/:searchTerm", async (req, res) => {
    const companies = await db.companies.find(
        {
            $or: [
                { orgnr: { $regex: new RegExp(`^${req.params.searchTerm}`), $options: "i" } },
                { name: { $regex: req.params.searchTerm, $options: "i" } }
            ]
        }).limit(10).toArray().catch(e => console.error(e))
    if (!companies) return res.status(400).json('Search failed.')
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
    if (!shareholders) return res.status(400).json('Search failed.')
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
            return res.status(200).json(data)
        } catch (e) {
            console.error(e)
            return res.status(500).json('Something went wrong.')
        }
    } else {
        res.status(404).json('Not found.')
    }
})

export default router
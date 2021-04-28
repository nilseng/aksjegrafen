import express from "express"
import { ObjectID } from "mongodb"
import { checkJwt } from "../auth/auth"
import { collections as db } from "../database/databaseSetup"

const router = express.Router()

router.get("/data", async (req: any, res) => {
    const data = await db.collectionName.find({}).sort({ name: 1 }).toArray()
    res.status(200).json(data)
})

router.get("/ownership/:company", async (req: any, res) => {
    const ownerships = await db.shareownership.find({ Selskap: req.params.company }, { sort: { 'Antall aksjer': -1 }, limit: 100 }).toArray().catch(e => console.error(e))
    if (!ownerships) return res.status(400).json('Could not retrieve ownership information.')
    res.status(200).json(ownerships)
})

router.get("/company/:searchTerm", async (req, res) => {
    const companies = await db.shareownership.distinct('Selskap', { Selskap: { $regex: req.params.searchTerm, $options: "i" } }).catch(e => console.error(e))
    if (!companies) return res.status(400).json('Search failed.')
    res.status(200).json(companies.slice(0, 10))
})

export default router
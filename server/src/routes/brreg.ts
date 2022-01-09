import axios from "axios";
import express from "express";
import { matchedData, query } from "express-validator";

const router = express.Router();

router.get("/financials", query("orgnr"), async (req, res) => {
  const orgnr = matchedData(req).orgnr;
  const data = await axios({ method: "GET", url: `https://data.brreg.no/regnskapsregisteret/regnskap/${orgnr}` })
    .then(({ data }) => data)
    .catch((error) => ({ error }));
  return data.error ? res.status(400).json(data) : res.status(200).json(data);
});

export default router;

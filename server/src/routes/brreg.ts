import axios from "axios";
import express from "express";
import { matchedData, query } from "express-validator";
import { asyncRouter } from "../asyncRouter";

const router = express.Router();

router.get(
  "/financials",
  query("orgnr"),
  asyncRouter(async (req, res) => {
    const orgnr = matchedData(req).orgnr;
    const data = await axios({
      method: "GET",
      url: `https://data.brreg.no/regnskapsregisteret/regnskap/${orgnr}`,
    })
      .then((data) => data?.data)
      .catch((e) => {
        if (e.response.status === 404) return null;
        throw e;
      });
    return data ? res.json(data) : res.status(404).json(data);
  })
);

export default router;

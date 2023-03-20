import { Router } from "express";
import { matchedData, query } from "express-validator";
import { asyncRouter } from "../asyncRouter";
import { IDatabase } from "../database/databaseSetup";

const router = Router();

export const businessCodeRoutes = (db: IDatabase) => {
  router.get(
    "/:searchTerm",
    query(["limit"]).default(5).toInt(),
    asyncRouter(async (req, res) => {
      const query = matchedData(req);
      const codes = await db.businessCodes
        .aggregate([
          {
            $search: {
              index: "business_codes",
              text: { query: req.params?.searchTerm, path: ["code", "name", "shortName", "notes"] },
            },
          },
        ])
        .limit(query.limit)
        .toArray();
      return res.json(codes);
    })
  );

  return router;
};

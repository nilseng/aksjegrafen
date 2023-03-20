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
              compound: {
                should: [
                  {
                    autocomplete: { query: req.params?.searchTerm, path: "code" },
                  },
                  {
                    text: {
                      query: req.params?.searchTerm,
                      path: "code",
                      score: {
                        boost: {
                          value: 3,
                        },
                      },
                    },
                  },
                  {
                    autocomplete: { query: req.params?.searchTerm, path: "name" },
                  },
                  {
                    text: {
                      query: req.params?.searchTerm,
                      path: "name",
                      score: {
                        boost: {
                          value: 3,
                        },
                      },
                    },
                  },
                  {
                    autocomplete: { query: req.params?.searchTerm, path: "shortName" },
                  },
                  {
                    autocomplete: { query: req.params?.searchTerm, path: "notes" },
                  },
                ],
              },
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

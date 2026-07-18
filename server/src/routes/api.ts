import { Router } from "express";
import { body, matchedData, query, validationResult } from "express-validator";
import { Document, ObjectId } from "mongodb";
import { asyncRouter } from "../asyncRouter";
import { IDatabase } from "../database/mongoDB";
import { Shareholder, UserEventType, isUserEvent } from "../models/models";
import { findActors } from "../use-cases/findActors";
import { findAllPaths } from "../use-cases/findAllPaths";
import { findHistoricalInvestments } from "../use-cases/findHistoricalInvestments";
import { findHistoricalInvestors } from "../use-cases/findHistoricalInvestors";
import { findIndirectOwnership } from "../use-cases/findIndirectOwnership";
import { findInvestments } from "../use-cases/findInvestments";
import { findInvestors } from "../use-cases/findInvestors";
import { findNeighbours } from "../use-cases/findNeighbours";
import { findNode } from "../use-cases/findNode";
import { findOwnershipChanges } from "../use-cases/findOwnershipChanges";
import { findPopularNodes } from "../use-cases/findPopularNodes";
import { findRoleUnits } from "../use-cases/findRoleUnits";
import { findShortestPath } from "../use-cases/findShortestPath";
import { generateOwnershipReport } from "../use-cases/generateOwnershipReport";
import { saveUserEvent } from "../use-cases/saveUserEvent";
import { searchNode } from "../use-cases/searchNode";
import { getLatestYear } from "../services/yearService";
import { removeOrgnrWhitespace } from "../utils/removeOrgnrWhitespace";
import { renderOwnershipReportCsv, renderOwnershipReportPdf } from "../utils/renderOwnershipReport";

const router = Router();

export const api = ({ db }: { db: IDatabase }) => {
  router.get(
    "/company",
    asyncRouter(async (req, res) => {
      if (req.query.count) {
        const count = await db.companies.countDocuments();
        return res.json(count);
      } else if (req.query._id) {
        const company = await db.companies.findOne({ _id: new ObjectId(req.query._id as string) });
        return res.json(company);
      } else if (req.query.orgnr && typeof req.query.orgnr === "string") {
        const company = await db.companies.findOne({ orgnr: req.query.orgnr });
        return res.json(company);
      } else {
        return res.status(400).json({ error: "Invalid query." });
      }
    })
  );

  router.get(
    "/shareholder",
    asyncRouter(async (req, res) => {
      if (req.query.count) {
        const count = await db.shareholders.countDocuments();
        return res.json(count);
      } else if (req.query._id) {
        const shareholder = await db.shareholders.findOne({ _id: new ObjectId(req.query._id as string) });
        return res.json(shareholder);
      } else if (req.query.shareholderId) {
        const shareholder = await db.shareholders.findOne({ id: req.query.shareholderId });
        return res.json(shareholder);
      } else {
        return res.status(400).json({ error: "Invalid query." });
      }
    })
  );

  router.get(
    "/shareholders",
    asyncRouter(async (req, res) => {
      const options = req.query.limit ? { limit: +req.query.limit } : undefined;
      const shareholders = await db.shareholders.find({}, options).toArray();
      return res.json(shareholders);
    })
  );

  router.get(
    "/companies",
    asyncRouter(async (req, res) => {
      const options = req.query.limit ? { limit: +req.query.limit } : undefined;
      const companies = await db.companies.find({}, options).toArray();
      return res.json(companies);
    })
  );

  router.get(
    "/company/:searchTerm",
    query(["limit"]).default(10).toInt(),
    query("count").optional().toBoolean(),
    asyncRouter(async (req, res) => {
      const query = matchedData(req);
      const params = req.params;
      if (query.count) {
        const count = await db.companies
          .aggregate<{ count: number }>([
            {
              $search: {
                index: "company search",
                text: {
                  query: params?.searchTerm,
                  path: ["name", "orgnr"],
                },
              },
            },
            {
              $count: "count",
            },
          ])
          .toArray();
        return res.json(count[0].count);
      } else {
        const companies = await db.companies
          .aggregate([
            {
              $search: {
                index: "company_search",
                compound: {
                  should: [
                    {
                      autocomplete: { query: params?.searchTerm, path: "name" },
                    },
                    {
                      text: {
                        query: params?.searchTerm,
                        path: "name",
                        score: {
                          boost: {
                            value: 3,
                          },
                        },
                      },
                    },
                    {
                      autocomplete: { query: removeOrgnrWhitespace(params?.searchTerm), path: "orgnr" },
                    },
                    {
                      text: {
                        query: removeOrgnrWhitespace(params?.searchTerm),
                        path: "orgnr",
                        score: {
                          boost: {
                            value: 3,
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          ])
          .limit(query.limit)
          .toArray();
        return res.json(companies);
      }
    })
  );

  router.get(
    "/shareholder/:searchTerm",
    query(["limit"]).default(10).toInt(),
    query("count").optional().toBoolean(),
    asyncRouter(async (req, res) => {
      const query = matchedData(req);
      const params = req.params;
      const shareholders: Shareholder[] = await db.shareholders
        .aggregate<Shareholder>([
          {
            $search: {
              index: "shareholder_search",
              compound: {
                should: [
                  {
                    autocomplete: { query: params?.searchTerm, path: "name" },
                  },
                  {
                    text: {
                      query: params?.searchTerm,
                      path: "name",
                      score: {
                        boost: {
                          value: 3,
                        },
                      },
                    },
                  },
                  {
                    autocomplete: { query: removeOrgnrWhitespace(params?.searchTerm), path: "orgnr" },
                  },
                  {
                    text: {
                      query: removeOrgnrWhitespace(params?.searchTerm),
                      path: "orgnr",
                      score: {
                        boost: {
                          value: 3,
                        },
                      },
                    },
                  },
                ],
              },
            },
          },
        ])
        .limit(query.limit)
        .toArray();
      return res.json(shareholders);
    })
  );

  router.get(
    "/investments",
    query(["limit"]).default(100).toInt(),
    query(["skip"]).default(0).toInt(),
    query(["year"]).optional().toInt(),
    query(["shareHolderId", "shareholderOrgnr"]).optional(),
    asyncRouter(async (req, res) => {
      const query = matchedData(req);
      if (!(query.shareHolderId || query.shareholderOrgnr)) {
        return res.json(400).send("Shareholder id or orgnr must be defined.");
      }
      const investments = await findHistoricalInvestments({
        shareholderOrgnr: query.shareholderOrgnr,
        shareholderId: query.shareHolderId,
        year: query.year,
        limit: query.limit,
        skip: query.skip,
      });
      return res.json(investments);
    })
  );

  router.get(
    "/investors",
    query("count").optional().toBoolean(),
    query(["limit"]).default(100).toInt(),
    query(["skip"]).default(0).toInt(),
    query(["year"]).optional().toInt(),
    query("orgnr").optional(),
    asyncRouter(async (req, res) => {
      const query = matchedData(req);

      const investors = await findHistoricalInvestors({
        orgnr: query.orgnr,
        year: query.year,
        limit: query.limit,
        skip: query.skip,
      });
      return res.json(investors);
    })
  );

  router.get(
    "/ownerships",
    query("count").optional().toBoolean(),
    query(["limit"]).default(100).toInt(),
    query(["year"]).optional().toInt(),
    asyncRouter(async (req, res) => {
      const query = matchedData(req);
      const filter: Document = {};
      if (query.year) filter[`holdings.${query.year}`] = { $exists: true };
      if (query.count) {
        const count = await db.ownerships.countDocuments(filter);
        return res.json(count);
      } else {
        const ownerships = await db.ownerships.find(filter, { limit: query.limit }).toArray();
        return res.json(ownerships);
      }
    })
  );

  router.get(
    "/node",
    query(["uuid"]).optional(),
    query(["orgnr"]).optional(),
    asyncRouter(async (req, res) => {
      const query = matchedData(req);
      if (!query.uuid && !query.orgnr) return res.status(400).json("Uuid or orgnr must be specified.");
      const node = await findNode({ uuid: query.uuid, orgnr: query.orgnr });
      return res.json(node);
    })
  );

  router.get(
    "/node/:searchTerm",
    query(["limit"]).default(10).toInt(),
    asyncRouter(async (req, res) => {
      const query = matchedData(req);
      const data = await searchNode({ searchTerm: req.params.searchTerm, limit: query.limit });
      return res.status(200).json(data);
    })
  );

  router.get(
    "/graph/neighbours",
    query(["uuid"]),
    query(["year"]).optional().toInt(),
    query(["linkTypes"]).toArray(),
    query(["limit"]).default(10).toInt(),
    query(["skip"]).default(0).toInt(),
    asyncRouter(async (req, res) => {
      const query = matchedData(req);
      const data = await findNeighbours({
        uuid: query.uuid,
        year: query.year ?? getLatestYear(),
        linkTypes: query.linkTypes,
        limit: query.limit,
      });
      return res.status(200).json(data);
    })
  );

  router.get(
    "/graph/shortest-path",
    query(["isDirected"]).toBoolean().optional(),
    query(["sourceUuid"]),
    query(["targetUuid"]),
    query(["linkTypes"]).toArray(),
    asyncRouter(async (req, res) => {
      const query = matchedData(req);
      if (!query.sourceUuid || !query.targetUuid) return res.status(400).json("Source and target uuid required.");
      if (query.sourceUuid === query.targetUuid) {
        const data = await findNode({ uuid: query.sourceUuid });
        return res.json({ nodes: [data], links: [] });
      }
      const data = await findShortestPath({
        isDirected: query.isDirected,
        sourceUuid: query.sourceUuid,
        targetUuid: query.targetUuid,
        linkTypes: query.linkTypes,
      });
      return res.json(data);
    })
  );

  router.get(
    "/graph/all-paths",
    query(["isDirected"]).toBoolean().optional(),
    query(["sourceUuid"]),
    query(["targetUuid"]),
    query(["linkTypes"]).toArray(),
    query(["limit"]).default(10).toInt(),
    asyncRouter(async (req, res) => {
      const query = matchedData(req);
      if (!query.sourceUuid || !query.targetUuid) return res.status(400).json("Source and target uuid required.");
      if (query.sourceUuid === query.targetUuid) {
        const data = await findNode({ uuid: query.sourceUuid });
        return res.json({ nodes: [data], links: [] });
      }
      const data = await findAllPaths({
        isDirected: query.isDirected,
        sourceUuid: query.sourceUuid,
        targetUuid: query.targetUuid,
        linkTypes: query.linkTypes,
        limit: query.limit,
      });
      return res.json(data);
    })
  );

  router.get(
    "/graph/actors",
    query("uuid"),
    query("limit").default(5).toInt(),
    query("skip").default(0).toInt(),
    asyncRouter(async (req, res) => {
      const query = matchedData(req);
      const data = await findActors({ uuid: query.uuid, limit: query.limit, skip: query.skip });
      return res.json(data);
    })
  );

  router.get(
    "/graph/role-units",
    query("uuid"),
    query("limit").default(5).toInt(),
    query("skip").default(0).toInt(),
    asyncRouter(async (req, res) => {
      const query = matchedData(req);
      const data = await findRoleUnits({ uuid: query.uuid, limit: query.limit, skip: query.skip });
      return res.json(data);
    })
  );

  router.get(
    "/graph/investors",
    query("uuid"),
    query(["year"]).optional().toInt(),
    query("limit").default(5).toInt(),
    query("skip").default(0).toInt(),
    asyncRouter(async (req, res) => {
      const query = matchedData(req);
      const data = await findInvestors({
        uuid: query.uuid,
        year: query.year ?? getLatestYear(),
        limit: query.limit,
        skip: query.skip,
      });
      return res.json(data);
    })
  );

  router.get(
    "/graph/investments",
    query("uuid"),
    query(["year"]).optional().toInt(),
    query("limit").default(5).toInt(),
    query("skip").default(0).toInt(),
    asyncRouter(async (req, res) => {
      const query = matchedData(req);
      const data = await findInvestments({
        uuid: query.uuid,
        year: query.year ?? getLatestYear(),
        limit: query.limit,
        skip: query.skip,
      });
      return res.json(data);
    })
  );

  router.get(
    "/graph/indirect-investors",
    query("uuid").optional(),
    query("orgnr").optional(),
    query(["year"]).optional().toInt(),
    // Investors below this effective share of the target are excluded and their owners are
    // not traversed. The floor keeps widely held companies (>100k shareholders) fast, and is
    // what terminates the traversal — there is deliberately no depth limit, since deep
    // holding structures are the whole point of the feature.
    query(["minShare"]).default(0.0001).toFloat(),
    query("investorType").default("all").isIn(["all", "person"]),
    query("limit").default(10).toInt(),
    query("skip").default(0).toInt(),
    asyncRouter(async (req, res) => {
      const query = matchedData(req);
      if (!query.uuid && !query.orgnr) return res.status(400).json("Uuid or orgnr must be specified.");
      const data = await findIndirectOwnership({
        uuid: query.uuid,
        orgnr: query.orgnr,
        year: query.year ?? getLatestYear(),
        minShare: Math.min(Math.max(query.minShare, 0.000001), 1),
        personsOnly: query.investorType === "person",
        limit: query.limit,
        skip: query.skip,
      });
      return res.json(data);
    })
  );

  router.get(
    "/ownership-changes",
    query("orgnr"),
    query(["year"]).optional().toInt(),
    query(["compareYear"]).optional().toInt(),
    query("limit").default(10).toInt(),
    query("skip").default(0).toInt(),
    asyncRouter(async (req, res) => {
      const query = matchedData(req);
      if (!query.orgnr) return res.status(400).json("Orgnr must be specified.");
      const year = query.year ?? getLatestYear();
      const data = await findOwnershipChanges({
        orgnr: query.orgnr,
        year,
        compareYear: query.compareYear ?? year - 1,
        limit: query.limit,
        skip: query.skip,
      });
      if (!data) return res.status(404).json("Company not found.");
      return res.json(data);
    })
  );

  router.get(
    "/ownership-report",
    query("uuid").optional(),
    query("orgnr").optional(),
    query(["year"]).optional().toInt(),
    query(["minShare"]).default(0.0001).toFloat(),
    query("format").default("pdf").isIn(["pdf", "csv"]),
    asyncRouter(async (req, res) => {
      const query = matchedData(req);
      if (!query.uuid && !query.orgnr) return res.status(400).json("Uuid or orgnr must be specified.");
      const report = await generateOwnershipReport({
        uuid: query.uuid,
        orgnr: query.orgnr,
        year: query.year ?? getLatestYear(),
        minShare: Math.min(Math.max(query.minShare, 0.000001), 1),
      });
      if (!report) return res.status(404).json("Company not found.");
      saveUserEvent({
        type: UserEventType.OwnershipReportDownload,
        uuid: report.company.uuid,
        orgnr: report.company.orgnr,
        createdAt: new Date(),
      }).catch((e) => console.error("Failed to save ownership report user event:", e));
      const filename = `eierskapsrapport-${report.company.orgnr ?? report.company.uuid}-${report.year}`;
      if (query.format === "csv") {
        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}.csv"`);
        return res.send(renderOwnershipReportCsv(report));
      }
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}.pdf"`);
      renderOwnershipReportPdf(report, res);
      return res;
    })
  );

  router.post(
    "/user-event",
    [body("uuid").optional(), body("orgnr").optional(), body("type")],
    asyncRouter(async (req, res) => {
      const errors = validationResult(req.body);
      if (!isUserEvent(req.body) || !errors.isEmpty()) return res.status(400).json("Invalid User Event.");
      await saveUserEvent(req.body);
      return res.send();
    })
  );

  router.get(
    "/popular-nodes",
    asyncRouter(async (_, res) => {
      const data = await findPopularNodes();
      return res.status(200).json(data);
    })
  );

  router.get("/*", (_, res) => {
    return res.status(404).send();
  });

  return router;
};

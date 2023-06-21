import { Router } from "express";
import { matchedData, query } from "express-validator";
import { Redis } from "ioredis";
import { Document, ObjectId } from "mongodb";
import { Driver } from "neo4j-driver";
import { asyncRouter } from "../asyncRouter";
import { IDatabase } from "../database/databaseSetup";
import { Company, Ownership, Shareholder } from "../models/models";
import { findAllPaths } from "../use-cases/findAllPaths";
import { findNeighbours } from "../use-cases/findNeighbours";
import { findNode } from "../use-cases/findNode";
import { findShortestPath } from "../use-cases/findShortestPath";
import { findShortestPath as findShortestPath2 } from "../use-cases/findShortestPath2";
import { searchNode } from "../use-cases/searchNode";
import { removeOrgnrWhitespace } from "../utils/removeOrgnrWhitespace";

const router = Router();

export const api = ({ graphDB, mongoDB: db, cache }: { graphDB: Driver; mongoDB: IDatabase; cache: Redis }) => {
  router.get(
    "/company",
    asyncRouter(async (req, res) => {
      if (req.query.count) {
        const cachedCount = await cache.get("company_count");
        if (cachedCount) return res.json(cachedCount);
        const count = await db.companies.countDocuments();
        cache.set("company_count", count);
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
        const cachedCount = await cache.get("shareholder_count");
        if (cachedCount) return res.json(cachedCount);
        const count = await db.shareholders.countDocuments();
        cache.set("shareholder_count", count);
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
    query("count").optional().toBoolean(),
    query(["limit"]).default(100).toInt(),
    query(["skip"]).default(0).toInt(),
    query(["year"]).optional().toInt(),
    query(["shareHolderId", "shareholderOrgnr"]).optional(),
    asyncRouter(async (req, res) => {
      const query = matchedData(req);

      if (!(query.shareHolderId || query.shareholderOrgnr)) return res.json(404).send("Invalid query");

      const filter: Document = {};
      if (query.year) filter[`holdings.${query.year}.total`] = { $gt: 0 };
      if (query.shareHolderId) filter.shareHolderId = query.shareHolderId;
      if (query.shareholderOrgnr) filter.shareholderOrgnr = query.shareholderOrgnr;

      if (query.count && query.year) {
        const c = await db.ownerships.countDocuments(filter);
        return res.json(c);
      } else {
        const ownerships = await db.ownerships
          .find(filter, { limit: query.limit })
          .sort({ [`holdings.${query.year ?? 2022}.total`]: -1, _id: 1 })
          .skip(query.skip)
          .toArray();
        const companies = await db.companies
          .find({ orgnr: { $in: ownerships.map((o: Ownership) => o.orgnr) } })
          .toArray();
        const data = ownerships.map((o: Ownership) => {
          o.investment = companies.find((c: Company) => c.orgnr === o.orgnr);
          return o;
        });
        return res.json(data);
      }
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
      const options = { limit: query.limit };

      const filter: Document = {};
      if (query.year) filter[`holdings.${query.year}.total`] = { $gt: 0 };
      if (query.orgnr) filter.orgnr = query.orgnr;

      if (query.orgnr) {
        if (query.count && query.year) {
          const count = await db.ownerships.countDocuments(filter);
          return res.json(count);
        } else {
          const ownerships = await db.ownerships
            .find(filter, options)
            .sort({ [`holdings.${query.year ?? 2022}.total`]: -1, _id: 1 })
            .skip(query.skip)
            .toArray();
          const [shareholders, companies] = await Promise.all([
            db.shareholders
              .find({
                id: { $in: ownerships.map((o: Ownership) => o.shareHolderId) },
              })
              .toArray(),
            db.companies
              .find({
                orgnr: { $in: ownerships.filter((o) => o.shareholderOrgnr).map((o) => o.shareholderOrgnr) as string[] },
              })
              .toArray(),
          ]);
          const data = ownerships.map((o: Ownership) => {
            o.investor = {
              shareholder: shareholders.find((s: Shareholder) => s.id === o.shareHolderId)!,
              company: companies.find((c: Company) => c.orgnr === o.shareholderOrgnr),
            };
            return o;
          });
          return res.json(data);
        }
      } else {
        const ownerships = await db.ownerships.find(filter, options).toArray();
        return res.json(ownerships);
      }
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
    "/find-relations",
    query(["fromOrgnr", "fromShareholderId"]).optional(),
    query(["toOrgnr"]),
    asyncRouter(async (req, res) => {
      const query = matchedData(req);
      if (!(query.fromOrgnr || query.fromShareholderId) || !query.toOrgnr) return res.status(400).send();
      const data = await findShortestPath({
        graphDB,
        fromOrgnr: query.fromOrgnr,
        fromShareholderId: query.fromShareholderId,
        toOrgnr: query.toOrgnr,
      });
      return data ? res.status(200).json(data) : res.status(204).json();
    })
  );

  router.get(
    "/node",
    query(["uuid"]),
    asyncRouter(async (req, res) => {
      const query = matchedData(req);
      if (!query.uuid) return res.status(400).json("Uuid not specified.");
      const node = await findNode({ uuid: query.uuid });
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
    query(["limit"]).default(10).toInt(),
    query(["skip"]).default(0).toInt(),
    asyncRouter(async (req, res) => {
      const query = matchedData(req);
      const data = await findNeighbours({ uuid: query.uuid, limit: query.limit });
      return res.status(200).json(data);
    })
  );

  router.get(
    "/graph/shortest-path",
    query(["isDirected"]).toBoolean().optional(),
    query(["sourceUuid"]),
    query(["targetUuid"]),
    asyncRouter(async (req, res) => {
      const query = matchedData(req);
      if (!query.sourceUuid || !query.targetUuid) return res.status(400).json("Source and target uuid required.");
      if (query.sourceUuid === query.targetUuid) {
        const data = await findNode({ uuid: query.sourceUuid });
        return res.json({ nodes: [data], links: [] });
      }
      const data = await findShortestPath2({
        isDirected: query.isDirected,
        sourceUuid: query.sourceUuid,
        targetUuid: query.targetUuid,
      });
      return res.json(data);
    })
  );

  router.get(
    "/graph/all-paths",
    query(["isDirected"]).toBoolean().optional(),
    query(["sourceUuid"]),
    query(["targetUuid"]),
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
        limit: query.limit,
      });
      return res.json(data);
    })
  );

  router.get("/*", (_, res) => {
    return res.status(404).send();
  });

  return router;
};

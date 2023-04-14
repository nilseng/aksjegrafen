import { Router } from "express";
import { matchedData, query } from "express-validator";
import { Redis } from "ioredis";
import { FilterQuery, ObjectID } from "mongodb";
import { asyncRouter } from "../asyncRouter";

import { IDatabase } from "../database/databaseSetup";
import { Company, Ownership, Shareholder } from "../models/models";

const router = Router();

export const api = (db: IDatabase, cache: Redis) => {
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
        const company = await db.companies.findOne({ _id: new ObjectID(req.query._id as string) });
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
        const shareholder = await db.shareholders.findOne({ _id: new ObjectID(req.query._id as string) });
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
                      autocomplete: { query: params?.searchTerm, path: "orgnr" },
                    },
                    {
                      text: {
                        query: params?.searchTerm,
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
      const shareholders = await db.shareholders
        .aggregate([
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
                    autocomplete: { query: params?.searchTerm, path: "orgnr" },
                  },
                  {
                    text: {
                      query: params?.searchTerm,
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

      const filter: FilterQuery<Ownership> = {};
      if (query.year) filter[`holdings.${query.year}`] = { $exists: true };
      if (query.shareHolderId) filter.shareHolderId = query.shareHolderId;
      if (query.shareholderOrgnr) filter.shareholderOrgnr = query.shareholderOrgnr;

      if (query.count && query.year) {
        const c = await db.ownerships.countDocuments(filter);
        return res.json(c);
      } else {
        const ownerships = await db.ownerships
          .find(filter, { limit: query.limit })
          .sort({ stocks: -1, _id: 1 })
          .skip(query.skip)
          .toArray();
        const companies = await db.companies
          .find({ orgnr: { $in: ownerships.map((o: Ownership) => o.orgnr) } })
          .toArray();
        const data = ownerships.map((o: Ownership) => {
          o.company = companies.find((c: Company) => c.orgnr === o.orgnr);
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

      const filter: FilterQuery<Ownership> = {};
      if (query.year) filter[`holdings.${query.year}`] = { $exists: true };
      if (query.orgnr) filter.orgnr = query.orgnr;

      if (query.orgnr) {
        if (query.count && query.year) {
          const count = await db.ownerships.countDocuments(filter);
          return res.json(count);
        } else {
          const ownerships = await db.ownerships
            .find(filter, options)
            .sort({ stocks: -1, _id: 1 })
            .skip(query.skip)
            .toArray();
          const shareholders = await db.shareholders
            .find({
              id: { $in: ownerships.map((o: Ownership) => o.shareHolderId) },
            })
            .toArray();
          const companies = await db.companies
            .find({ orgnr: { $in: shareholders.filter((s) => s.orgnr).map((s) => s.orgnr) as string[] } })
            .toArray();
          const data = ownerships.map((o: Ownership) => {
            o.shareholder = shareholders.find((s: Shareholder) => s.id === o.shareHolderId);
            o.company = companies.find((c: Company) => c.orgnr === o.shareholderOrgnr);
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
      const filter: FilterQuery<Ownership> = {};
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
    "/ownership-graph",
    asyncRouter(async (req, res) => {
      const companyIds = JSON.parse(req.query.companyIds as string);
      const companyIdStrings = companyIds.map((id: number) => "" + id);
      if (Array.isArray(companyIds)) {
        const ownerships = await db.ownerships.find({ orgnr: { $in: companyIdStrings }, year: 2020 }).toArray();
        const uniqueShareholderIds = new Set(ownerships.map((o: Ownership) => o.shareHolderId));
        const shareholders = await db.shareholders.find({ id: { $in: Array.from(uniqueShareholderIds) } }).toArray();
        return res.json({ ownerships, shareholders });
      }
      return res.status(400).send("Please specify an array with companyIds");
    })
  );

  router.get(
    "/company-graph",
    asyncRouter(async (req, res) => {
      console.log(`--------- Retrieving graph data ---------`);
      const year = req.query.year ? +req.query.year : undefined;
      const limit = req.query.limit ? +req.query.limit : undefined;
      // Getting `limit` number of ownerships from `year`
      const ownerships = await db.ownerships
        .find({ shareholderOrgnr: { $exists: true, $ne: null }, [`holdings.${year}`]: { $exists: true } })
        .limit(limit ?? 100)
        .toArray();
      if (ownerships && Array.isArray(ownerships))
        console.log(`--------- Found ${ownerships.length} ownerships ---------`);
      else throw Error("Ownerships not found.");
      const nodes: { [key: string]: Partial<Company & Shareholder> } = {};
      // Getting all Shareholder and Company data for all shareholders with an orgnr
      for (let i = 0; i < ownerships.length; i += 1000) {
        const c: Company[] = await db.companies
          .find({
            orgnr: {
              $in: ownerships.map((o) => o.shareholderOrgnr as string).slice(i, i + 1000),
            },
          })
          .toArray();
        for (const company of c) {
          nodes[company.orgnr] = company;
        }
        const s: Shareholder[] = await db.shareholders
          .find({
            orgnr: {
              $in: ownerships.map((o) => o.shareholderOrgnr as string).slice(i, i + 1000),
            },
          })
          .toArray();
        for (const shareholder of s) {
          if (shareholder.orgnr)
            nodes[shareholder.orgnr] = {
              ...nodes[shareholder.orgnr],
              ...shareholder,
            };
        }
      }
      // Getting all companies
      for (let i = 0; i < ownerships.length; i += 1000) {
        const c: Company[] = await db.companies
          .find({
            orgnr: { $in: ownerships.map((o) => o.orgnr).slice(i, i + 1000) },
          })
          .toArray();
        for (const company of c) {
          nodes[company.orgnr] = company;
        }
      }
      console.log(`--------- Found ${Object.keys(nodes).length} unique nodes ---------`);
      return res.json({ ownerships, nodes });
    })
  );

  return router;
};

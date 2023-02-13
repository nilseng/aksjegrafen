import express from "express";
import { matchedData, query } from "express-validator";
import { Redis } from "ioredis";
import { ObjectID } from "mongodb";
import { asyncRouter } from "../asyncRouter";

import { IDatabase } from "../database/databaseSetup";
import { Company, Ownership, Shareholder } from "../models/models";

const router = express.Router();

export const api = (db: IDatabase, cache: Redis) => {
  router.get("/company", async (req, res) => {
    if (req.query.count) {
      const cachedCount = await cache
        .get("company_count")
        .catch((e) => console.error("Redis timeout - could not get company count."));
      if (cachedCount) return res.status(200).json(cachedCount);
      const count = await db.companies.countDocuments();
      cache.set("company_count", count);
      return res.status(200).json(count);
    } else if (req.query._id) {
      const company = await db.companies
        .findOne({ _id: new ObjectID(req.query._id as string) })
        .catch((e) => console.error(e));
      return company ? res.status(200).json(company) : res.status(404).json({ error: "Finding company failed." });
    } else if (req.query.orgnr && typeof req.query.orgnr === "string") {
      const company = await db.companies.findOne({ orgnr: req.query.orgnr }).catch((e) => console.error(e));
      return company ? res.status(200).json(company) : res.status(404).json({ error: "Finding company failed." });
    } else {
      res.status(404).json({ error: "Not found." });
    }
  });

  router.get("/shareholder", async (req, res) => {
    if (req.query.count) {
      try {
        const cachedCount = await cache
          .get("shareholder_count")
          .catch((e) => console.error("Redis timeout - could not get shareholder count."));
        if (cachedCount) return res.status(200).json(cachedCount);
        const count = await db.shareholders.countDocuments();
        cache.set("shareholder_count", count);
        return res.status(200).json(count);
      } catch (e) {
        return res.status(500).json({ error: "Something went wrong." });
      }
    } else if (req.query._id) {
      const shareholder = await db.shareholders
        .findOne({ _id: new ObjectID(req.query._id as string) })
        .catch((e) => console.error(e));
      return shareholder
        ? res.status(200).json(shareholder)
        : res.status(404).json({ error: "Finding shareholder failed." });
    } else {
      res.status(404).json({ error: "Not found." });
    }
  });

  router.get("/shareholders", async (req, res) => {
    const options = req.query.limit ? { limit: +req.query.limit } : undefined;
    const shareholders = await db.shareholders
      .find({}, options)
      .toArray()
      .catch((e) => console.error(e));
    return shareholders ? res.status(200).json(shareholders) : res.status(404).json({ error: "Something went wrong." });
  });

  router.get("/companies", async (req, res) => {
    const options = req.query.limit ? { limit: +req.query.limit } : undefined;
    const companies = await db.companies
      .find({}, options)
      .toArray()
      .catch((e) => console.error(e));
    return companies ? res.status(200).json(companies) : res.status(404).json({ error: "Something went wrong." });
  });

  router.get(
    "/company/:searchTerm",
    query(["limit"]).default(10).toInt(),
    query("count").optional().toBoolean(),
    asyncRouter(async (req, res) => {
      const query = matchedData(req);
      const params = req.params;
      if (query.count) {
        const count = await db.companies
          .aggregate([
            {
              $search: {
                index: "company search",
                text: {
                  query: params?.searchTerm,
                  path: ["name", "orgnr"],
                },
              },
            },
          ])
          .count();
        return res.status(200).json(count);
      } else {
        const options = query.limit ? { limit: query.limit } : undefined;
        const companies = await db.companies
          .aggregate([
            {
              $search: {
                index: "company search",
                text: {
                  query: params?.searchTerm,
                  path: ["name", "orgnr"],
                },
              },
            },
          ])
          .limit(query.limit)
          .toArray()
          .catch((e) => console.error(e));
        if (!companies) return res.status(400).json({ error: "Search failed." });
        return res.status(200).json(companies);
      }
    })
  );

  router.get(
    "/shareholder/:searchTerm",
    query(["limit"]).default(10).toInt(),
    query("count").optional().toBoolean(),
    async (req, res) => {
      const query = matchedData(req);
      const params = req.params;
      const shareholders = await db.shareholders
        .aggregate([
          {
            $search: {
              index: "shareholder search",
              text: {
                query: params?.searchTerm,
                path: ["name", "orgnr"],
              },
            },
          },
        ])
        .limit(query.limit)
        .toArray()
        .catch((e) => console.error(e));
      if (!shareholders) return res.status(400).json({ error: "Search failed." });
      res.status(200).json(shareholders);
    }
  );

  interface IInvestmentsFilter {
    shareholderId?: string;
    shareholderOrgnr?: string;
    year?: number;
  }
  router.get(
    "/investments",
    query("count").optional().toBoolean(),
    query(["limit"]).default(100).toInt(),
    query(["skip"]).default(0).toInt(),
    query(["year"]).optional().toInt(),
    query(["shareHolderId", "shareholderOrgnr"]).optional(),
    async (req, res) => {
      const query = matchedData(req);

      if (!(query.shareHolderId ? !query.shareholderOrgnr : query.shareholderOrgnr))
        return res.json(404).send("Invalid query");

      const options = { limit: query.limit };
      const skip = query.skip;
      const filterProps = ["shareHolderId", "shareholderOrgnr", "year"];
      const filter: IInvestmentsFilter = {};

      if (query) {
        for (const prop of filterProps) {
          if (query[prop])
            (filter as any)[prop] = typeof query[prop] === "string" ? decodeURI(query[prop]) : query[prop];
        }
      }

      if (query.count && filter.year) {
        const c = await db.ownerships.countDocuments(filter).catch((e) => ({ error: e }));
        return (c as { error: any }).error ? res.status(500).json(c) : res.status(200).json(c);
      } else {
        try {
          const ownerships = await db.ownerships
            .find(filter, options)
            .sort({ stocks: -1, _id: 1 })
            .skip(skip)
            .toArray();
          const companies = await db.companies
            .find({ orgnr: { $in: ownerships.map((o: Ownership) => o.orgnr) } })
            .toArray();
          const data = ownerships.map((o: Ownership) => {
            o.company = companies.find((c: Company) => c.orgnr === o.orgnr);
            return o;
          });
          return res.status(200).json(data);
        } catch (e) {
          console.error(e);
          return res.status(500).json({ error: "Something went wrong." });
        }
      }
    }
  );

  interface IInvestorsFilter {
    orgnr?: string;
    year?: number;
  }
  router.get(
    "/investors",
    query("count").optional().toBoolean(),
    query(["limit"]).default(100).toInt(),
    query(["skip"]).default(0).toInt(),
    query(["year"]).optional().toInt(),
    query("orgnr").optional(),
    async (req, res) => {
      const query = matchedData(req);
      const count: boolean = query.count;
      const options = { limit: query.limit };
      const skip = query.skip;

      const filterProps = ["orgnr", "year"];
      const filter: IInvestorsFilter = {};

      if (query) {
        for (const prop of filterProps) {
          if (query[prop]) (filter as any)[prop] = query[prop];
        }
      }

      if (filter.orgnr) {
        if (count && filter.year) {
          const c = await db.ownerships.countDocuments(filter).catch((e) => ({ error: e }));
          return (c as { error: any }).error ? res.status(500).json(c) : res.status(200).json(c);
        } else {
          try {
            const ownerships = await db.ownerships
              .find(filter, options)
              .sort({ stocks: -1, _id: 1 })
              .skip(skip)
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
            return res.status(200).json(data);
          } catch (e) {
            console.error(e);
            return res.status(500).json({ error: "Something went wrong." });
          }
        }
      } else {
        const ownerships = await db.ownerships
          .find(filter, options)
          .toArray()
          .catch((e) => console.error(e));
        return ownerships ? res.status(200).json(ownerships) : res.status(404).json({ error: "Something went wrong." });
      }
    }
  );

  interface IOwnershipsFilter {
    year?: number;
  }
  router.get(
    "/ownerships",
    query("count").optional().toBoolean(),
    query(["limit"]).default(100).toInt(),
    query(["year"]).optional().toInt(),
    async (req, res) => {
      const query = matchedData(req);
      const count: boolean = query.count;
      const options = { limit: query.limit };

      const filterProps = ["year"];
      const filter: IOwnershipsFilter = {};

      if (query.year) filter.year = query.year;
      if (count) {
        const c = await db.ownerships.countDocuments(filter).catch((e) => ({ error: e }));
        return (c as { error: any }).error ? res.status(500).json(c) : res.status(200).json(c);
      } else {
        const ownerships = await db.ownerships
          .find(filter, options)
          .toArray()
          .catch((e) => console.error(e));
        return ownerships ? res.status(200).json(ownerships) : res.status(404).json({ error: "Something went wrong." });
      }
    }
  );

  router.get("/ownership-graph", async (req, res) => {
    const companyIds = JSON.parse(req.query.companyIds as string);
    const companyIdStrings = companyIds.map((id: number) => "" + id);
    if (Array.isArray(companyIds)) {
      const ownerships = await db.ownerships.find({ orgnr: { $in: companyIdStrings }, year: 2020 }).toArray();
      const uniqueShareholderIds = new Set(ownerships.map((o: Ownership) => o.shareHolderId));
      const shareholders = await db.shareholders.find({ id: { $in: Array.from(uniqueShareholderIds) } }).toArray();
      return ownerships && shareholders
        ? res.status(200).json({ ownerships, shareholders })
        : res.status(404).json({ error: "Something went wrong." });
    } else res.status(404).send("Please specify companies");
  });

  router.get("/company-graph", async (req, res) => {
    console.log(`--------- Retrieving graph data ---------`);
    const year = req.query.year ? +req.query.year : undefined;
    const limit = req.query.limit ? +req.query.limit : undefined;
    // Getting `limit` number of ownerships from `year`
    const ownerships = await db.ownerships
      .find({ shareholderOrgnr: { $exists: true, $ne: null }, year })
      .limit(limit ?? 100)
      .toArray()
      .catch((e) => console.error(e));
    if (ownerships && Array.isArray(ownerships))
      console.log(`--------- Found ${ownerships.length} ownerships ---------`);
    else return res.status(500).send();
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
    res.status(200).json({ ownerships, nodes });
  });

  return router;
};

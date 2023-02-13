import express from "express";
import { matchedData, query } from "express-validator";
import { Redis } from "ioredis";
import { ObjectID } from "mongodb";
import { asyncRouter } from "../asyncRouter";

import { IDatabase } from "../database/databaseSetup";
import { Company, Ownership, Shareholder } from "../models/models";

const router = express.Router();

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
                index: "company search",
                text: {
                  query: params?.searchTerm,
                  path: ["name", "orgnr"],
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
              index: "shareholder search",
              text: {
                query: params?.searchTerm,
                path: ["name", "orgnr"],
              },
            },
          },
        ])
        .limit(query.limit)
        .toArray();
      return res.json(shareholders);
    })
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
    asyncRouter(async (req, res) => {
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
        const c = await db.ownerships.countDocuments(filter);
        return res.json(c);
      } else {
        const ownerships = await db.ownerships.find(filter, options).sort({ stocks: -1, _id: 1 }).skip(skip).toArray();
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
    asyncRouter(async (req, res) => {
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
          const c = await db.ownerships.countDocuments(filter);
          return res.json(c);
        } else {
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
          return res.json(data);
        }
      } else {
        const ownerships = await db.ownerships.find(filter, options).toArray();
        return res.json(ownerships);
      }
    })
  );

  interface IOwnershipsFilter {
    year?: number;
  }
  router.get(
    "/ownerships",
    query("count").optional().toBoolean(),
    query(["limit"]).default(100).toInt(),
    query(["year"]).optional().toInt(),
    asyncRouter(async (req, res) => {
      const query = matchedData(req);
      const count: boolean = query.count;
      const options = { limit: query.limit };
      const filter: IOwnershipsFilter = {};
      if (query.year) filter.year = query.year;
      if (count) {
        const c = await db.ownerships.countDocuments(filter);
        return res.json(c);
      } else {
        const ownerships = await db.ownerships.find(filter, options).toArray();
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
        .find({ shareholderOrgnr: { $exists: true, $ne: null }, year })
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

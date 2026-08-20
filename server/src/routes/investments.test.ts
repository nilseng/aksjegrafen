import express from "express";
import request from "supertest";
import { IDatabase } from "../database/mongoDB";
import { Ownership } from "../models/models";

// The route pulls in the whole API surface, so stub the two data boundaries: the Neo4j driver
// module (which connects on import) and the Mongo gateway.
jest.mock("../database/graphDB", () => ({ graphDB: {} }));
jest.mock("../gateways/mongoDB/mongoDB.gateway", () => ({
  findOwnerships: jest.fn(),
  findCompanies: jest.fn(),
  findMatchingOwnerships: jest.fn(),
  findShareholderById: jest.fn(),
  findShareholders: jest.fn(),
  findShareholdersByIds: jest.fn(),
  aggregateOwnershipChanges: jest.fn(),
}));

import {
  findCompanies,
  findMatchingOwnerships,
  findOwnerships,
  findShareholderById,
  findShareholders,
} from "../gateways/mongoDB/mongoDB.gateway";
import { api } from "./api";

const ownershipsFinder = findOwnerships as jest.Mock;
const companiesFinder = findCompanies as jest.Mock;

// `api()` registers onto a module-level router, so build the app exactly once.
const app = express().use("/api", api({ db: {} as IDatabase }));

const ownership = (shareholderOrgnr: string, index: number): Ownership => ({
  orgnr: `${shareholderOrgnr}-investment-${index}`,
  shareHolderId: `${shareholderOrgnr}-id`,
  shareholderOrgnr,
  holdings: { 2025: { total: 100 - index } },
});

beforeEach(() => {
  // Every shareholder has more investments than any test asks for, so a limit that is applied
  // globally instead of per orgnr would show up as missing rows.
  ownershipsFinder.mockImplementation(({ shareholderOrgnr, limit }: { shareholderOrgnr: string; limit: number }) =>
    Promise.resolve(Array.from({ length: limit }, (_, i) => ownership(shareholderOrgnr, i)))
  );
  companiesFinder.mockImplementation((orgnrs: string[]) =>
    Promise.resolve(orgnrs.map((orgnr) => ({ orgnr, name: `COMPANY ${orgnr}` })))
  );
});

const requestedOrgnrs = () => ownershipsFinder.mock.calls.map(([args]) => args.shareholderOrgnr);

describe("GET /api/investments", () => {
  it("returns one shareholder's investments", async () => {
    const res = await request(app).get("/api/investments?shareholderOrgnr=982463718&limit=2");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(requestedOrgnrs()).toEqual(["982463718"]);
    expect(res.body[0].investment.name).toBe("COMPANY 982463718-investment-0");
  });

  it("accepts a comma-separated list and applies the limit per orgnr", async () => {
    const res = await request(app).get("/api/investments?shareholderOrgnr=982463718,984851006,923609016&limit=2");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(6);
    expect(requestedOrgnrs()).toEqual(["982463718", "984851006", "923609016"]);
    expect(ownershipsFinder.mock.calls.every(([args]) => args.limit === 2)).toBe(true);
  });

  it("accepts a repeated query parameter", async () => {
    const res = await request(app).get("/api/investments?shareholderOrgnr=982463718&shareholderOrgnr=984851006&limit=1");

    expect(res.status).toBe(200);
    expect(res.body.map((o: Ownership) => o.shareholderOrgnr)).toEqual(["982463718", "984851006"]);
  });

  it("normalises orgnrs: inner whitespace, blank entries and duplicates", async () => {
    const res = await request(app)
      .get("/api/investments")
      .query({ shareholderOrgnr: "982 463 718, 984851006 ,982463718,", limit: 1 });

    expect(res.status).toBe(200);
    expect(requestedOrgnrs()).toEqual(["982463718", "984851006"]);
  });

  it("passes the year filter through to every lookup in the batch", async () => {
    await request(app).get("/api/investments?shareholderOrgnr=982463718,984851006&year=2020&limit=1");

    expect(ownershipsFinder.mock.calls.every(([args]) => args.year === 2020)).toBe(true);
  });

  it("returns exactly what the equivalent single calls return", async () => {
    const first = await request(app).get("/api/investments?shareholderOrgnr=982463718&limit=3");
    const second = await request(app).get("/api/investments?shareholderOrgnr=984851006&limit=3");
    const batch = await request(app).get("/api/investments?shareholderOrgnr=982463718,984851006&limit=3");

    expect(batch.body).toEqual([...first.body, ...second.body]);
  });

  describe("rejects", () => {
    it("a request without a shareholder", async () => {
      const res = await request(app).get("/api/investments");

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/must be defined/);
      expect(ownershipsFinder).not.toHaveBeenCalled();
    });

    it("a list of only blank entries", async () => {
      const res = await request(app).get("/api/investments?shareholderOrgnr=,,");

      expect(res.status).toBe(400);
      expect(ownershipsFinder).not.toHaveBeenCalled();
    });

    it("more than 100 orgnrs", async () => {
      const orgnrs = Array.from({ length: 101 }, (_, i) => `${900000000 + i}`).join(",");

      const res = await request(app).get(`/api/investments?shareholderOrgnr=${orgnrs}`);

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/At most 100 shareholder orgnrs/);
      expect(ownershipsFinder).not.toHaveBeenCalled();
    });

    it("a limit that multiplies past the batch maximum", async () => {
      const res = await request(app).get("/api/investments?shareholderOrgnr=982463718,984851006&limit=9000");

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/exceeds the batch maximum of 10000/);
      expect(ownershipsFinder).not.toHaveBeenCalled();
    });

    it("a shareHolderId combined with several orgnrs", async () => {
      const res = await request(app).get("/api/investments?shareholderOrgnr=982463718,984851006&shareHolderId=abc");

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/cannot be combined/);
      expect(ownershipsFinder).not.toHaveBeenCalled();
    });
  });

  it("still allows a shareHolderId together with a single orgnr", async () => {
    // The shareholderId path merges stakes held under several shareholder records, so it needs
    // the shareholder-matching side of the gateway too.
    ownershipsFinder.mockResolvedValue([]);
    (findShareholderById as jest.Mock).mockResolvedValue({ id: "abc", name: "OLA NORDMANN", yearOfBirth: 1970 });
    (findShareholders as jest.Mock).mockResolvedValue([{ id: "abc" }]);
    (findMatchingOwnerships as jest.Mock).mockResolvedValue([]);

    const res = await request(app).get("/api/investments?shareholderOrgnr=982463718&shareHolderId=abc&limit=1");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

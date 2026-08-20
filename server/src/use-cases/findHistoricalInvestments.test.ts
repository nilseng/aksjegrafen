import { Ownership } from "../models/models";
import { findHistoricalInvestments, findHistoricalInvestmentsBatch } from "./findHistoricalInvestments";

jest.mock("../gateways/mongoDB/mongoDB.gateway", () => ({
  findOwnerships: jest.fn(),
  findCompanies: jest.fn(),
  findMatchingOwnerships: jest.fn(),
  findShareholderById: jest.fn(),
  findShareholders: jest.fn(),
}));

import { findCompanies, findOwnerships } from "../gateways/mongoDB/mongoDB.gateway";

const ownershipsFinder = findOwnerships as jest.Mock;
const companiesFinder = findCompanies as jest.Mock;

const ownership = (shareholderOrgnr: string, orgnr: string, total = 100): Ownership => ({
  orgnr,
  shareHolderId: `${shareholderOrgnr}-id`,
  shareholderOrgnr,
  holdings: { 2025: { total } },
});

// One investment per shareholder by default, in an invested-in company of its own.
const oneInvestmentEach = () =>
  ownershipsFinder.mockImplementation(({ shareholderOrgnr }: { shareholderOrgnr: string }) =>
    Promise.resolve([ownership(shareholderOrgnr, `investment-of-${shareholderOrgnr}`)])
  );

beforeEach(() => {
  companiesFinder.mockImplementation((orgnrs: string[]) =>
    Promise.resolve(orgnrs.map((orgnr) => ({ orgnr, name: `COMPANY ${orgnr}` })))
  );
});

describe("findHistoricalInvestmentsBatch", () => {
  it("looks up every orgnr, passing year/limit/skip through unchanged (they apply per orgnr)", async () => {
    oneInvestmentEach();

    const investments = await findHistoricalInvestmentsBatch({
      shareholderOrgnrs: ["982463718", "984851006", "923609016"],
      year: 2024,
      limit: 5,
      skip: 2,
    });

    expect(ownershipsFinder).toHaveBeenCalledTimes(3);
    expect(ownershipsFinder).toHaveBeenCalledWith({ shareholderOrgnr: "982463718", year: 2024, limit: 5, skip: 2 });
    expect(ownershipsFinder).toHaveBeenCalledWith({ shareholderOrgnr: "984851006", year: 2024, limit: 5, skip: 2 });
    expect(ownershipsFinder).toHaveBeenCalledWith({ shareholderOrgnr: "923609016", year: 2024, limit: 5, skip: 2 });
    expect(investments.map((o) => o.shareholderOrgnr)).toEqual(["982463718", "984851006", "923609016"]);
  });

  it("returns exactly what the same number of single calls returns", async () => {
    ownershipsFinder.mockImplementation(({ shareholderOrgnr }: { shareholderOrgnr: string }) =>
      Promise.resolve([
        ownership(shareholderOrgnr, `${shareholderOrgnr}-a`, 200),
        ownership(shareholderOrgnr, `${shareholderOrgnr}-b`, 100),
      ])
    );

    const single = [
      ...(await findHistoricalInvestments({ shareholderOrgnr: "982463718", limit: 2 })),
      ...(await findHistoricalInvestments({ shareholderOrgnr: "984851006", limit: 2 })),
    ];
    const batch = await findHistoricalInvestmentsBatch({ shareholderOrgnrs: ["982463718", "984851006"], limit: 2 });

    expect(batch).toEqual(single);
  });

  it("enriches the whole batch with a single, de-duplicated companies query", async () => {
    // Both shareholders own a stake in the same company.
    ownershipsFinder.mockImplementation(({ shareholderOrgnr }: { shareholderOrgnr: string }) =>
      Promise.resolve([ownership(shareholderOrgnr, "985173710")])
    );

    const investments = await findHistoricalInvestmentsBatch({ shareholderOrgnrs: ["982463718", "984851006"] });

    expect(companiesFinder).toHaveBeenCalledTimes(1);
    expect(companiesFinder).toHaveBeenCalledWith(["985173710"]);
    expect(investments.map((o) => o.investment?.name)).toEqual(["COMPANY 985173710", "COMPANY 985173710"]);
  });

  it("omits `investment` entirely when the invested-in company is unknown", async () => {
    oneInvestmentEach();
    companiesFinder.mockResolvedValue([]);

    const [investment] = await findHistoricalInvestmentsBatch({ shareholderOrgnrs: ["982463718"] });

    // Must stay undefined rather than null: JSON.stringify drops it, so the wire format of a
    // batch response is identical to what single calls have always returned.
    expect(investment.investment).toBeUndefined();
    expect(JSON.parse(JSON.stringify(investment))).not.toHaveProperty("investment");
  });

  it("caps how many lookups are in flight at once", async () => {
    let inFlight = 0;
    let peakInFlight = 0;
    ownershipsFinder.mockImplementation(() => {
      inFlight++;
      peakInFlight = Math.max(peakInFlight, inFlight);
      return new Promise((resolve) =>
        setImmediate(() => {
          inFlight--;
          resolve([]);
        })
      );
    });

    const shareholderOrgnrs = Array.from({ length: 25 }, (_, i) => `orgnr-${i}`);
    await findHistoricalInvestmentsBatch({ shareholderOrgnrs });

    expect(ownershipsFinder).toHaveBeenCalledTimes(25);
    expect(peakInFlight).toBeLessThanOrEqual(10);
  });

  it("handles an empty batch without querying anything", async () => {
    const investments = await findHistoricalInvestmentsBatch({ shareholderOrgnrs: [] });

    expect(investments).toEqual([]);
    expect(ownershipsFinder).not.toHaveBeenCalled();
  });
});

describe("findHistoricalInvestments", () => {
  it("still resolves a single shareholder's investments and attaches the company", async () => {
    oneInvestmentEach();

    const investments = await findHistoricalInvestments({ shareholderOrgnr: "982463718", limit: 10, skip: 0 });

    expect(ownershipsFinder).toHaveBeenCalledTimes(1);
    expect(ownershipsFinder).toHaveBeenCalledWith({
      shareholderOrgnr: "982463718",
      shareholderId: undefined,
      year: undefined,
      limit: 10,
      skip: 0,
    });
    expect(investments).toHaveLength(1);
    expect(investments[0].investment?.name).toBe("COMPANY investment-of-982463718");
  });
});

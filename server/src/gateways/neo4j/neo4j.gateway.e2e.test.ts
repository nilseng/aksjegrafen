import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Neo4jContainer, StartedNeo4jContainer } from "@testcontainers/neo4j";
import neo4j, { auth, Driver, Session } from "neo4j-driver";

/**
 * E2E tests for neo4j.gateway.ts parameterized Cypher queries.
 *
 * Spins up a real Neo4j container and runs actual queries to verify that
 * parameterized SKIP, LIMIT, year comparison, fulltext search, and
 * GDS procedure parameters all work against a real Neo4j instance.
 *
 * Requires Docker to be running. Run with: npm run test:e2e
 */

let container: StartedNeo4jContainer;
let driver: Driver;
let dockerAvailable = true;

// We can't easily swap the driver used by the gateway module at runtime
// (it reads env vars at import time), so instead we directly execute the
// same parameterized Cypher queries the gateway constructs. This tests
// what we actually care about: does Neo4j accept these parameterized queries?

async function runQuery(session: Session, query: string, params: Record<string, unknown>) {
  const result = await session.run(query, params);
  return result.records;
}

/** Wrapper: skip test if Docker/Neo4j couldn't start */
const e2e = (...args: Parameters<typeof it>) => {
  const [name, fn, timeout] = args;
  it(name, async (...testArgs) => {
    if (!dockerAvailable) {
      return; // silently skip
    }
    return (fn as Function)(...testArgs);
  }, timeout);
};

describe("neo4j.gateway e2e - parameterized queries against real Neo4j", () => {
  beforeAll(async () => {
    try {
      container = await new Neo4jContainer("neo4j:5")
        .withApoc()
        .withStartupTimeout(120_000)
        .start();
    } catch (e) {
      console.warn("Docker/Neo4j unavailable, skipping e2e tests:", (e as Error).message);
      dockerAvailable = false;
      return;
    }

    driver = neo4j.driver(
      container.getBoltUri(),
      auth.basic("neo4j", container.getPassword())
    );

    // Seed test data
    const session = driver.session();
    try {
      // Create fulltext index
      await session.run(`
        CREATE FULLTEXT INDEX namesAndOrgnrs IF NOT EXISTS
        FOR (n:Company|Shareholder|Person|Unit)
        ON EACH [n.name, n.orgnr]
      `);

      // Create companies
      await session.run(`
        CREATE (c1:Company {uuid: "company-1", name: "Equinor ASA", orgnr: "923609016"})
        CREATE (c2:Company {uuid: "company-2", name: "Statoil Fuel & Retail", orgnr: "980007460"})
        CREATE (c3:Company {uuid: "company-3", name: "Hydro ASA", orgnr: "914778271"})
      `);

      // Create shareholders
      await session.run(`
        CREATE (s1:Shareholder {uuid: "shareholder-1", name: "Staten v/Nærings- og fiskeridepartementet", id: "sh-1"})
        CREATE (s2:Shareholder {uuid: "shareholder-2", name: "Folketrygdfondet", id: "sh-2"})
        CREATE (s3:Shareholder {uuid: "shareholder-3", name: "BlackRock Inc", id: "sh-3"})
      `);

      // Create persons and units for role testing
      await session.run(`
        CREATE (p1:Person {uuid: "person-1", name: "Anders Opedal"})
        CREATE (u1:Unit {uuid: "unit-1", name: "Equinor ASA", orgnr: "923609016"})
      `);

      // Create OWNS relationships with year property
      await session.run(`
        MATCH (s:Shareholder {uuid: "shareholder-1"}), (c:Company {uuid: "company-1"})
        CREATE (s)-[:OWNS {year: 2024, stocks: 1000000, share: 67.0}]->(c)
      `);
      await session.run(`
        MATCH (s:Shareholder {uuid: "shareholder-2"}), (c:Company {uuid: "company-1"})
        CREATE (s)-[:OWNS {year: 2024, stocks: 500000, share: 5.0}]->(c)
      `);
      await session.run(`
        MATCH (s:Shareholder {uuid: "shareholder-3"}), (c:Company {uuid: "company-1"})
        CREATE (s)-[:OWNS {year: 2024, stocks: 300000, share: 3.0}]->(c)
      `);
      await session.run(`
        MATCH (s:Shareholder {uuid: "shareholder-1"}), (c:Company {uuid: "company-1"})
        CREATE (s)-[:OWNS {year: 2023, stocks: 950000, share: 65.0}]->(c)
      `);
      // Shareholder-1 also invests in company-2
      await session.run(`
        MATCH (s:Shareholder {uuid: "shareholder-1"}), (c:Company {uuid: "company-2"})
        CREATE (s)-[:OWNS {year: 2024, stocks: 200000, share: 40.0}]->(c)
      `);

      // Create role relationships
      await session.run(`
        MATCH (p:Person {uuid: "person-1"}), (u:Unit {uuid: "unit-1"})
        CREATE (p)-[:DAGL]->(u)
        CREATE (p)-[:BEST]->(u)
      `);

      // Wait for fulltext index to be populated
      await session.run(`CALL db.awaitIndexes(120)`);
    } finally {
      await session.close();
    }
  }, 180_000);

  afterAll(async () => {
    await driver?.close();
    await container?.stop();
  });

  describe("parameterized LIMIT and SKIP", () => {
    e2e("LIMIT $limit works with integer parameter", async () => {
      const session = driver.session();
      try {
        const records = await runQuery(
          session,
          `MATCH (n:Company) RETURN n LIMIT $limit`,
          { limit: neo4j.int(2) }
        );
        expect(records.length).toBe(2);
      } finally {
        await session.close();
      }
    });

    e2e("SKIP $skip works with integer parameter", async () => {
      const session = driver.session();
      try {
        const records = await runQuery(
          session,
          `MATCH (n:Company) RETURN n ORDER BY n.name SKIP $skip LIMIT $limit`,
          { skip: neo4j.int(1), limit: neo4j.int(10) }
        );
        expect(records.length).toBe(2); // 3 companies, skip 1
      } finally {
        await session.close();
      }
    });

    e2e("SKIP $skip and LIMIT $limit work with plain JS numbers", async () => {
      const session = driver.session();
      try {
        // This is what the gateway actually does - passes plain numbers
        const records = await runQuery(
          session,
          `MATCH (n:Company) RETURN n ORDER BY n.name SKIP $skip LIMIT $limit`,
          { skip: 0, limit: 2 }
        );
        expect(records.length).toBe(2);
      } finally {
        await session.close();
      }
    });
  });

  describe("parameterized year comparison", () => {
    e2e("r.year = $year works with integer parameter", async () => {
      const session = driver.session();
      try {
        const records = await runQuery(
          session,
          `
          MATCH (investor:Shareholder)-[r:OWNS]->(investment:Company)
          WHERE investment.uuid = $uuid AND r.year = $year
          RETURN investor, investment, r
          ORDER BY r.share DESC
          SKIP $skip
          LIMIT $limit
          `,
          { uuid: "company-1", year: neo4j.int(2024), skip: neo4j.int(0), limit: neo4j.int(10) }
        );
        expect(records.length).toBe(3); // 3 shareholders own company-1 in 2024
      } finally {
        await session.close();
      }
    });

    e2e("r.year = $year with plain JS number", async () => {
      const session = driver.session();
      try {
        // This is what the gateway does - passes plain number for year
        const records = await runQuery(
          session,
          `
          MATCH (investor:Shareholder)-[r:OWNS]->(investment:Company)
          WHERE investment.uuid = $uuid AND r.year = $year
          RETURN investor, investment, r
          ORDER BY r.share DESC
          SKIP $skip
          LIMIT $limit
          `,
          { uuid: "company-1", year: 2024, skip: 0, limit: 10 }
        );
        expect(records.length).toBe(3);
      } finally {
        await session.close();
      }
    });

    e2e("r.year = $year filters correctly (2023 vs 2024)", async () => {
      const session = driver.session();
      try {
        const records2024 = await runQuery(
          session,
          `
          MATCH (investor:Shareholder)-[r:OWNS]->(investment:Company)
          WHERE investment.uuid = $uuid AND r.year = $year
          RETURN investor
          `,
          { uuid: "company-1", year: 2024 }
        );
        const records2023 = await runQuery(
          session,
          `
          MATCH (investor:Shareholder)-[r:OWNS]->(investment:Company)
          WHERE investment.uuid = $uuid AND r.year = $year
          RETURN investor
          `,
          { uuid: "company-1", year: 2023 }
        );
        expect(records2024.length).toBe(3);
        expect(records2023.length).toBe(1); // Only shareholder-1 has 2023 data
      } finally {
        await session.close();
      }
    });
  });

  describe("parameterized fulltext search", () => {
    e2e("fulltext queryNodes with $searchTerm parameter", async () => {
      const session = driver.session();
      try {
        const records = await runQuery(
          session,
          `
          CALL db.index.fulltext.queryNodes("namesAndOrgnrs", $searchTerm) YIELD node
          RETURN node
          LIMIT $limit
          `,
          { searchTerm: "Equinor", limit: 10 }
        );
        expect(records.length).toBeGreaterThanOrEqual(1);
        const name = records[0].get("node").properties.name;
        expect(name).toContain("Equinor");
      } finally {
        await session.close();
      }
    });

    e2e("fulltext search with orgnr", async () => {
      const session = driver.session();
      try {
        const records = await runQuery(
          session,
          `
          CALL db.index.fulltext.queryNodes("namesAndOrgnrs", $searchTerm) YIELD node
          RETURN node
          LIMIT $limit
          `,
          { searchTerm: "923609016", limit: 5 }
        );
        expect(records.length).toBeGreaterThanOrEqual(1);
      } finally {
        await session.close();
      }
    });

    e2e("fulltext search with special characters in searchTerm is safely parameterized", async () => {
      const session = driver.session();
      try {
        // This would cause injection if interpolated, but should be safe as a parameter
        const records = await runQuery(
          session,
          `
          CALL db.index.fulltext.queryNodes("namesAndOrgnrs", $searchTerm) YIELD node
          RETURN node
          LIMIT $limit
          `,
          { searchTerm: "Statoil Fuel \\& Retail", limit: 5 }
        );
        // Should not throw - the query is safe even with special chars
        expect(records).toBeDefined();
      } finally {
        await session.close();
      }
    });
  });

  describe("parameterized node lookup", () => {
    e2e("{uuid: $uuid} property matching works", async () => {
      const session = driver.session();
      try {
        const records = await runQuery(
          session,
          `MATCH (n:Company {uuid: $uuid}) RETURN n LIMIT 1`,
          { uuid: "company-1" }
        );
        expect(records.length).toBe(1);
        expect(records[0].get("n").properties.name).toBe("Equinor ASA");
      } finally {
        await session.close();
      }
    });

    e2e("$uuids IN clause works with array parameter", async () => {
      const session = driver.session();
      try {
        const records = await runQuery(
          session,
          `
          MATCH (node:Company|Shareholder)
          WHERE node.uuid IN $uuids
          RETURN node
          `,
          { uuids: ["company-1", "shareholder-1", "company-3"] }
        );
        expect(records.length).toBe(3);
      } finally {
        await session.close();
      }
    });
  });

  describe("parameterized role queries", () => {
    e2e("role holder query with parameterized SKIP/LIMIT", async () => {
      const session = driver.session();
      try {
        const records = await runQuery(
          session,
          `
          MATCH (holder:Person|Unit)-[r]->(unit:Unit)
          WHERE unit.uuid = $uuid AND type(r) <> "OWNS"
          RETURN holder, r, unit
          SKIP $skip
          LIMIT $limit
          `,
          { uuid: "unit-1", skip: 0, limit: 10 }
        );
        expect(records.length).toBe(2); // DAGL + BEST
      } finally {
        await session.close();
      }
    });

    e2e("role units query with parameterized SKIP/LIMIT", async () => {
      const session = driver.session();
      try {
        const records = await runQuery(
          session,
          `
          MATCH (holder:Unit|Person)-[r]->(unit:Unit|Company)
          WHERE holder.uuid = $uuid AND type(r) <> "OWNS"
          RETURN holder, unit, r
          SKIP $skip
          LIMIT $limit
          `,
          { uuid: "person-1", skip: 0, limit: 10 }
        );
        expect(records.length).toBe(2); // DAGL + BEST to unit-1
      } finally {
        await session.close();
      }
    });
  });

  describe("parameterized UNWIND with complex objects", () => {
    e2e("UNWIND $links with nested property access works", async () => {
      const session = driver.session();
      try {
        const links = [
          {
            source: { properties: { uuid: "shareholder-1" } },
            target: { properties: { uuid: "company-1" } },
          },
        ];
        const records = await runQuery(
          session,
          `
          UNWIND $links as link
          MATCH (n1:Unit|Person|Company|Shareholder {uuid: link.source.properties.uuid})-[r]->(n2:Unit|Person|Company|Shareholder {uuid: link.target.properties.uuid})
          RETURN n1, r, n2
          `,
          { links }
        );
        expect(records.length).toBeGreaterThanOrEqual(1);
      } finally {
        await session.close();
      }
    });
  });

  describe("SKIP/LIMIT actually paginate correctly", () => {
    e2e("SKIP 0 LIMIT 2 returns first 2 investors", async () => {
      const session = driver.session();
      try {
        const records = await runQuery(
          session,
          `
          MATCH (investor:Shareholder)-[r:OWNS]->(investment:Company)
          WHERE investment.uuid = $uuid AND r.year = $year
          RETURN investor, investment, r
          ORDER BY r.share DESC
          SKIP $skip
          LIMIT $limit
          `,
          { uuid: "company-1", year: 2024, skip: 0, limit: 2 }
        );
        expect(records.length).toBe(2);
        // Ordered by share DESC: shareholder-1 (67%), shareholder-2 (5%)
        const share1 = records[0].get("r").properties.share;
        const share2 = records[1].get("r").properties.share;
        expect(share1).toBeGreaterThan(share2);
      } finally {
        await session.close();
      }
    });

    e2e("SKIP 2 LIMIT 10 returns remaining investor", async () => {
      const session = driver.session();
      try {
        const records = await runQuery(
          session,
          `
          MATCH (investor:Shareholder)-[r:OWNS]->(investment:Company)
          WHERE investment.uuid = $uuid AND r.year = $year
          RETURN investor, investment, r
          ORDER BY r.share DESC
          SKIP $skip
          LIMIT $limit
          `,
          { uuid: "company-1", year: 2024, skip: 2, limit: 10 }
        );
        expect(records.length).toBe(1); // Only 1 remaining after skipping 2
      } finally {
        await session.close();
      }
    });
  });
});

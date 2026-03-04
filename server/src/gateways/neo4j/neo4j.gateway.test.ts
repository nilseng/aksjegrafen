import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Track all queries executed via session.run()
let capturedQueries: { query: string; params: unknown }[] = [];

// Mock neo4j session
const mockSession = {
  run: vi.fn(async (query: string, params: unknown) => {
    capturedQueries.push({ query, params });
    return { records: [] };
  }),
  close: vi.fn(),
};

// Mock graphDB before importing the gateway
vi.mock("../../database/graphDB", () => ({
  graphDB: {
    session: () => mockSession,
  },
}));

// Import after mocking
import {
  findNode,
  findNodesByUuids,
  searchNode,
  findInvestors,
  findInvestments,
  findRoleHolders,
  findRoleUnits,
  findShortestPath,
  findAllPaths,
  findRelationships,
} from "./neo4j.gateway";

/**
 * Extracts all $paramName references from a Cypher query string.
 * Skips quoted strings to avoid matching '$' inside string literals.
 */
function extractParamNames(query: string): string[] {
  // Remove single-quoted strings (Cypher string literals) so we don't
  // match $-prefixed text inside them
  const withoutStrings = query.replace(/'[^']*'/g, "''");
  const matches = withoutStrings.match(/\$([a-zA-Z_]\w*)/g);
  if (!matches) return [];
  return [...new Set(matches.map((m) => m.slice(1)))];
}

describe("neo4j.gateway - parameterized queries", () => {
  beforeEach(() => {
    capturedQueries = [];
    mockSession.run.mockClear();
  });

  describe("parameter key consistency", () => {
    it("findNode: query $params match params object keys", async () => {
      await findNode({ uuid: "test-uuid" });
      expect(capturedQueries).toHaveLength(1);
      const { query, params } = capturedQueries[0];
      const paramNames = extractParamNames(query);
      expect(paramNames).toContain("uuid");
      expect(params).toHaveProperty("uuid", "test-uuid");
      // Every $param in query has a matching key in params
      for (const name of paramNames) {
        expect(params).toHaveProperty(name);
      }
    });

    it("findNodesByUuids: query $params match params object keys", async () => {
      await findNodesByUuids({ uuids: ["a", "b"] });
      expect(capturedQueries).toHaveLength(1);
      const { query, params } = capturedQueries[0];
      const paramNames = extractParamNames(query);
      expect(paramNames).toContain("uuids");
      expect(params).toHaveProperty("uuids", ["a", "b"]);
      for (const name of paramNames) {
        expect(params).toHaveProperty(name);
      }
    });

    it("searchNode: query $params match params object keys", async () => {
      await searchNode({ searchTerm: "equinor", limit: 10 });
      expect(capturedQueries).toHaveLength(1);
      const { query, params } = capturedQueries[0];
      const paramNames = extractParamNames(query);
      expect(paramNames).toContain("searchTerm");
      expect(paramNames).toContain("limit");
      expect(params).toHaveProperty("searchTerm", "equinor");
      expect(params).toHaveProperty("limit", 10);
      for (const name of paramNames) {
        expect(params).toHaveProperty(name);
      }
    });

    it("findInvestors: query $params match params object keys", async () => {
      await findInvestors({ uuid: "test-uuid", year: 2024, limit: 25, skip: 0 });
      expect(capturedQueries).toHaveLength(1);
      const { query, params } = capturedQueries[0];
      const paramNames = extractParamNames(query);
      expect(paramNames).toContain("uuid");
      expect(paramNames).toContain("year");
      expect(paramNames).toContain("limit");
      expect(paramNames).toContain("skip");
      expect(params).toHaveProperty("uuid", "test-uuid");
      expect(params).toHaveProperty("year", 2024);
      expect(params).toHaveProperty("limit", 25);
      expect(params).toHaveProperty("skip", 0);
      for (const name of paramNames) {
        expect(params).toHaveProperty(name);
      }
    });

    it("findInvestments: query $params match params object keys", async () => {
      await findInvestments({ uuid: "test-uuid", year: 2023, limit: 10, skip: 5 });
      expect(capturedQueries).toHaveLength(1);
      const { query, params } = capturedQueries[0];
      const paramNames = extractParamNames(query);
      expect(paramNames).toContain("uuid");
      expect(paramNames).toContain("year");
      expect(paramNames).toContain("limit");
      expect(paramNames).toContain("skip");
      expect(params).toHaveProperty("uuid", "test-uuid");
      expect(params).toHaveProperty("year", 2023);
      expect(params).toHaveProperty("limit", 10);
      expect(params).toHaveProperty("skip", 5);
      for (const name of paramNames) {
        expect(params).toHaveProperty(name);
      }
    });

    it("findRoleHolders: query $params match params object keys", async () => {
      await findRoleHolders({ uuid: "test-uuid", limit: 20 });
      expect(capturedQueries).toHaveLength(1);
      const { query, params } = capturedQueries[0];
      const paramNames = extractParamNames(query);
      expect(paramNames).toContain("uuid");
      expect(paramNames).toContain("limit");
      expect(paramNames).toContain("skip");
      expect(params).toHaveProperty("uuid", "test-uuid");
      expect(params).toHaveProperty("limit", 20);
      expect(params).toHaveProperty("skip", 0);
      for (const name of paramNames) {
        expect(params).toHaveProperty(name);
      }
    });

    it("findRoleUnits: query $params match params object keys", async () => {
      await findRoleUnits({ uuid: "test-uuid", limit: 15, skip: 3 });
      expect(capturedQueries).toHaveLength(1);
      const { query, params } = capturedQueries[0];
      const paramNames = extractParamNames(query);
      expect(paramNames).toContain("uuid");
      expect(paramNames).toContain("limit");
      expect(paramNames).toContain("skip");
      expect(params).toHaveProperty("uuid", "test-uuid");
      expect(params).toHaveProperty("limit", 15);
      expect(params).toHaveProperty("skip", 3);
      for (const name of paramNames) {
        expect(params).toHaveProperty(name);
      }
    });

    it("findShortestPath: query $params match params object keys", async () => {
      await findShortestPath({
        sourceUuid: "source-uuid",
        targetUuid: "target-uuid",
        isDirected: true,
      });
      expect(capturedQueries).toHaveLength(1);
      const { query, params } = capturedQueries[0];
      const paramNames = extractParamNames(query);
      expect(paramNames).toContain("sourceUuid");
      expect(paramNames).toContain("targetUuid");
      expect(params).toHaveProperty("sourceUuid", "source-uuid");
      expect(params).toHaveProperty("targetUuid", "target-uuid");
      for (const name of paramNames) {
        expect(params).toHaveProperty(name);
      }
    });

    it("findShortestPath with linkTypes: query $params match params object keys", async () => {
      await findShortestPath({
        sourceUuid: "source-uuid",
        targetUuid: "target-uuid",
        isDirected: false,
        linkTypes: ["OWNS" as any],
      });
      expect(capturedQueries).toHaveLength(1);
      const { query, params } = capturedQueries[0];
      const paramNames = extractParamNames(query);
      expect(paramNames).toContain("sourceUuid");
      expect(paramNames).toContain("targetUuid");
      expect(paramNames).toContain("linkTypes");
      for (const name of paramNames) {
        expect(params).toHaveProperty(name);
      }
    });

    it("findAllPaths: query $params match params object keys", async () => {
      await findAllPaths({
        sourceUuid: "source-uuid",
        targetUuid: "target-uuid",
        isDirected: true,
        limit: 5,
      });
      expect(capturedQueries).toHaveLength(1);
      const { query, params } = capturedQueries[0];
      const paramNames = extractParamNames(query);
      expect(paramNames).toContain("sourceUuid");
      expect(paramNames).toContain("targetUuid");
      expect(paramNames).toContain("limit");
      expect(params).toHaveProperty("sourceUuid", "source-uuid");
      expect(params).toHaveProperty("targetUuid", "target-uuid");
      expect(params).toHaveProperty("limit", 5);
      for (const name of paramNames) {
        expect(params).toHaveProperty(name);
      }
    });

    it("findRelationships: query $params match params object keys", async () => {
      const links = [
        {
          source: { properties: { uuid: "a" } },
          target: { properties: { uuid: "b" } },
        },
      ] as any;
      await findRelationships({ links, isDirected: true });
      expect(capturedQueries).toHaveLength(1);
      const { query, params } = capturedQueries[0];
      const paramNames = extractParamNames(query);
      expect(paramNames).toContain("links");
      expect(params).toHaveProperty("links");
      for (const name of paramNames) {
        expect(params).toHaveProperty(name);
      }
    });
  });

  describe("no string interpolation of user values", () => {
    it("searchNode does not interpolate searchTerm into query string", async () => {
      const malicious = 'test") RETURN n; MATCH (m) DETACH DELETE m;//';
      await searchNode({ searchTerm: malicious, limit: 10 });
      const { query } = capturedQueries[0];
      // The malicious string should NOT appear in the query
      expect(query).not.toContain(malicious);
      expect(query).toContain("$searchTerm");
    });

    it("findInvestors does not interpolate year into query string", async () => {
      await findInvestors({ uuid: "test", year: 2024, limit: 10 });
      const { query } = capturedQueries[0];
      // Year should be parameterized, not interpolated
      expect(query).not.toMatch(/r\.year = 2024/);
      expect(query).toContain("r.year = $year");
    });

    it("findInvestors does not interpolate skip/limit into query string", async () => {
      await findInvestors({ uuid: "test", year: 2024, limit: 50, skip: 25 });
      const { query } = capturedQueries[0];
      expect(query).not.toContain("SKIP 25");
      expect(query).not.toContain("LIMIT 50");
      expect(query).toContain("SKIP $skip");
      expect(query).toContain("LIMIT $limit");
    });

    it("findInvestments does not interpolate year into query string", async () => {
      await findInvestments({ uuid: "test", year: 2023, limit: 10 });
      const { query } = capturedQueries[0];
      expect(query).not.toMatch(/r\.year = 2023/);
      expect(query).toContain("r.year = $year");
    });

    it("findRoleHolders does not interpolate skip/limit into query string", async () => {
      await findRoleHolders({ uuid: "test", limit: 30, skip: 10 });
      const { query } = capturedQueries[0];
      expect(query).not.toContain("SKIP 10");
      expect(query).not.toContain("LIMIT 30");
      expect(query).toContain("SKIP $skip");
      expect(query).toContain("LIMIT $limit");
    });

    it("findAllPaths does not interpolate limit (k) into query string", async () => {
      await findAllPaths({
        sourceUuid: "a",
        targetUuid: "b",
        isDirected: true,
        limit: 7,
      });
      const { query } = capturedQueries[0];
      expect(query).not.toContain("k: 7");
      expect(query).toContain("k: $limit");
    });
  });

  describe("default skip values", () => {
    it("findInvestors defaults skip to 0 when not provided", async () => {
      await findInvestors({ uuid: "test", year: 2024, limit: 10 });
      const { params } = capturedQueries[0];
      expect(params).toHaveProperty("skip", 0);
    });

    it("findInvestments defaults skip to 0 when not provided", async () => {
      await findInvestments({ uuid: "test", year: 2024, limit: 10 });
      const { params } = capturedQueries[0];
      expect(params).toHaveProperty("skip", 0);
    });

    it("findRoleHolders defaults skip to 0 when not provided", async () => {
      await findRoleHolders({ uuid: "test", limit: 10 });
      const { params } = capturedQueries[0];
      expect(params).toHaveProperty("skip", 0);
    });

    it("findRoleUnits defaults skip to 0 when not provided", async () => {
      await findRoleUnits({ uuid: "test", limit: 10 });
      const { params } = capturedQueries[0];
      expect(params).toHaveProperty("skip", 0);
    });
  });

  describe("parameter types are correct for Neo4j", () => {
    it("year is passed as a number, not a string", async () => {
      await findInvestors({ uuid: "test", year: 2024, limit: 10 });
      const { params } = capturedQueries[0];
      expect(typeof (params as any).year).toBe("number");
    });

    it("limit is passed as a number", async () => {
      await searchNode({ searchTerm: "test", limit: 10 });
      const { params } = capturedQueries[0];
      expect(typeof (params as any).limit).toBe("number");
    });

    it("skip is passed as a number", async () => {
      await findInvestors({ uuid: "test", year: 2024, limit: 10, skip: 5 });
      const { params } = capturedQueries[0];
      expect(typeof (params as any).skip).toBe("number");
    });

    it("searchTerm is passed as a string", async () => {
      await searchNode({ searchTerm: "equinor", limit: 10 });
      const { params } = capturedQueries[0];
      expect(typeof (params as any).searchTerm).toBe("string");
    });

    it("uuids is passed as an array of strings", async () => {
      await findNodesByUuids({ uuids: ["a", "b", "c"] });
      const { params } = capturedQueries[0];
      expect(Array.isArray((params as any).uuids)).toBe(true);
      expect((params as any).uuids).toEqual(["a", "b", "c"]);
    });
  });

  describe("GDS procedure calls", () => {
    it("findShortestPath uses directed graph name when isDirected=true", async () => {
      await findShortestPath({
        sourceUuid: "a",
        targetUuid: "b",
        isDirected: true,
      });
      const { query } = capturedQueries[0];
      expect(query).toContain("'directedGraph'");
      expect(query).not.toContain("'undirectedGraph'");
    });

    it("findShortestPath uses undirected graph name when isDirected=false", async () => {
      await findShortestPath({
        sourceUuid: "a",
        targetUuid: "b",
        isDirected: false,
      });
      const { query } = capturedQueries[0];
      expect(query).toContain("'undirectedGraph'");
    });

    it("findShortestPath includes relationshipTypes only when linkTypes provided", async () => {
      // Without linkTypes
      await findShortestPath({
        sourceUuid: "a",
        targetUuid: "b",
        isDirected: true,
      });
      expect(capturedQueries[0].query).not.toContain("relationshipTypes");

      capturedQueries = [];

      // With linkTypes
      await findShortestPath({
        sourceUuid: "a",
        targetUuid: "b",
        isDirected: true,
        linkTypes: ["OWNS" as any],
      });
      expect(capturedQueries[0].query).toContain("relationshipTypes: $linkTypes");
    });

    it("findAllPaths passes k as $limit parameter", async () => {
      await findAllPaths({
        sourceUuid: "a",
        targetUuid: "b",
        isDirected: true,
        limit: 3,
      });
      const { query, params } = capturedQueries[0];
      expect(query).toContain("k: $limit");
      expect(params).toHaveProperty("limit", 3);
    });
  });

  describe("findRelationships directionality", () => {
    it("uses directed arrow when isDirected=true", async () => {
      await findRelationships({ links: [] as any, isDirected: true });
      const { query } = capturedQueries[0];
      expect(query).toContain("->");
    });

    it("omits directed arrow when isDirected=false", async () => {
      await findRelationships({ links: [] as any, isDirected: false });
      const { query } = capturedQueries[0];
      expect(query).not.toContain("->");
    });
  });
});

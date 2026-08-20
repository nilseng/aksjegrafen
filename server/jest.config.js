/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/*.test.ts"],
  // No DB or network access: the tests mock the Mongo gateway and the Neo4j driver module.
  clearMocks: true,
};

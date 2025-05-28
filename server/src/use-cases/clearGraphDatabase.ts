import { Driver } from "neo4j-driver";

/**
 * Clears all data from the Neo4j graph database
 * @param graphDB Neo4j driver instance
 * @returns Promise that resolves when the database is cleared
 */
export const clearGraphDatabase = async (graphDB: Driver): Promise<void> => {
  console.log("Clearing all data from the Neo4j database...")
  const session = graphDB.session();
  try {
    // This Cypher query will delete all nodes and relationships in the database
    await session.run("MATCH (n) DETACH DELETE n");
    console.log("Neo4j database cleared successfully");
  } catch (error) {
    console.error("Error clearing Neo4j database:", error);
    throw error;
  } finally {
    await session.close();
  }
};

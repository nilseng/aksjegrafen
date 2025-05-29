import { Driver } from "neo4j-driver";

/**
 * Sets the name property on all Person nodes by combining firstName and lastName
 * Runs as a batched operation to handle large numbers of nodes efficiently
 */
export const setPersonNames = async (graphDB: Driver): Promise<void> => {
  const session = graphDB.session();
  try {
    console.log("Setting name property on Person nodes...");
    const result = await session.run(`
      CALL apoc.periodic.iterate(
        "MATCH (p:Person) RETURN p",
        "SET p.name = p.firstName + ' ' + p.lastName",
        {batchSize: 50000, parallel: true}
      )
    `);
    
    // Log the operation statistics
    const stats = result.records[0]?.get('batchErrors') === 0 
      ? "Completed successfully with no errors" 
      : `Completed with ${result.records[0]?.get('batchErrors') || 'unknown'} errors`;
    
    console.log(`Name property set on Person nodes: ${stats}`);
  } catch (error) {
    console.error("Error setting name property:", error);
    throw error; // Re-throw to allow the caller to handle the error
  } finally {
    await session.close();
  }
};

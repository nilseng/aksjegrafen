import { Driver } from "neo4j-driver";

/**
 * Clears all data from the Neo4j graph database using batched deletion
 * to prevent memory issues with large graphs
 *
 * @param graphDB Neo4j driver instance
 * @returns Promise that resolves when the database is cleared
 */
export const clearGraphDatabase = async (graphDB: Driver): Promise<void> => {
  console.log("Clearing all data from the Neo4j database in batches...");
  
  // Start progress monitoring (returns a function to stop monitoring)
  const stopMonitoring = await monitorProgress(graphDB, 5000);
  
  try {
    // Phase 1: Delete all relationships
    await deleteAllRelationships(graphDB);
    
    // Phase 2: Delete all nodes
    await deleteAllNodes(graphDB);

    console.log("Neo4j database cleared successfully");
  } catch (error) {
    console.error("Error clearing Neo4j database:", error);
    throw error;
  } finally {
    // Stop the monitoring process
    stopMonitoring();
  }
};

/**
 * Delete all relationships in the Neo4j database in batches
 */
async function deleteAllRelationships(graphDB: Driver): Promise<void> {
  const session = graphDB.session();
  try {
    console.log("\nPhase 1: Deleting relationships in batches...");
    await session.run(`
      CALL apoc.periodic.iterate(
        'MATCH ()-[r]->() RETURN r',
        'DELETE r',
        {batchSize: 10000, parallel: true}
      )
    `);
    console.log("Phase 1 complete: All relationships deleted\n");
  } finally {
    await session.close();
  }
}

/**
 * Delete all nodes in the Neo4j database in batches
 */
async function deleteAllNodes(graphDB: Driver): Promise<void> {
  const session = graphDB.session();
  try {
    console.log("Phase 2: Deleting nodes in batches...");
    await session.run(`
      CALL apoc.periodic.iterate(
        'MATCH (n) RETURN n',
        'DELETE n',
        {batchSize: 10000, parallel: true}
      )
    `);
    console.log("Phase 2 complete: All nodes deleted\n");
  } finally {
    await session.close();
  }
}

/**
 * Runs a background monitoring process that reports progress at intervals
 */
async function monitorProgress(graphDB: Driver, intervalMs: number): Promise<() => void> {
  let shouldContinue = true;
  let lastUpdate: ProgressUpdate | undefined;
  let reportNumber = 0;
  
  // Start the monitoring process
  const monitoringPromise = (async () => {
    try {
      // First check - get initial values
      lastUpdate = await checkProgress(graphDB, undefined, undefined, reportNumber);
      
      while (shouldContinue) {
        await new Promise(resolve => setTimeout(resolve, intervalMs));
        if (!shouldContinue) break;
        
        reportNumber++;
        lastUpdate = await checkProgress(
          graphDB, 
          lastUpdate.counts.relationships > 0 || lastUpdate.counts.nodes > 0 ? lastUpdate.counts : undefined,
          lastUpdate.counts,
          reportNumber
        );
      }
    } catch (error) {
      console.error("Error in progress monitoring:", error);
    }
  })();
  
  // Return a function that stops the monitoring
  return () => {
    shouldContinue = false;
  };
}

/**
 * Single progress check that returns the current counts and progress
 * @param graphDB Neo4j driver instance
 * @param initialCounts initial count of relationships and nodes (if known)
 * @param previousCounts previous count snapshot for comparison (if known) 
 * @param reportNumber report iteration counter
 */
async function checkProgress(
  graphDB: Driver,
  initialCounts?: DbCounts,
  previousCounts?: DbCounts,
  reportNumber: number = 0
): Promise<ProgressUpdate> {
  // Get current counts
  const currentCounts = await getCounts(graphDB);
  
  // If this is the first check, use current counts as initial
  if (!initialCounts) {
    initialCounts = currentCounts;
    previousCounts = currentCounts;
    console.log(`Initial counts: ${initialCounts.relationships} relationships, ${initialCounts.nodes} nodes`);
  }
  
  // Calculate changes since last check
  const relDeleted = previousCounts ? previousCounts.relationships - currentCounts.relationships : 0;
  const nodesDeleted = previousCounts ? previousCounts.nodes - currentCounts.nodes : 0;
  
  // Calculate progress percentages
  const relProgress = initialCounts.relationships > 0 ? 
    ((initialCounts.relationships - currentCounts.relationships) / initialCounts.relationships * 100).toFixed(1) : '100';
  const nodeProgress = initialCounts.nodes > 0 ? 
    ((initialCounts.nodes - currentCounts.nodes) / initialCounts.nodes * 100).toFixed(1) : '100';
  
  // Prepare the progress update
  const update: ProgressUpdate = {
    counts: currentCounts,
    progress: {
      relationships: relProgress,
      nodes: nodeProgress
    },
    deleted: {
      relationships: relDeleted,
      nodes: nodesDeleted
    },
    reportNumber
  };
  
  // Report progress
  console.log(`[Progress Report #${reportNumber}] ` +
    `Relationships: ${currentCounts.relationships} remaining (${relProgress}% deleted, -${relDeleted} since last check), ` +
    `Nodes: ${currentCounts.nodes} remaining (${nodeProgress}% deleted, -${nodesDeleted} since last check)`);
  
  return update;
}

/**
 * Helper function to get the current counts of relationships and nodes
 */
async function getCounts(graphDB: Driver): Promise<{ relationships: number, nodes: number }> {
  const session = graphDB.session();
  try {
    const result = await session.run(`
      MATCH (n) 
      WITH count(n) AS nodeCount
      MATCH ()-[r]->() 
      RETURN nodeCount, count(r) AS relCount
    `);
    
    // Handle case where there are no nodes/relationships
    if (result.records.length === 0) {
      return { relationships: 0, nodes: 0 };
    }
    
    const record = result.records[0];
    return {
      relationships: record.get('relCount').toNumber(),
      nodes: record.get('nodeCount').toNumber()
    };
  } finally {
    await session.close();
  }
}

/**
 * Type for database counts
 */
type DbCounts = { relationships: number, nodes: number };

/**
 * A progress monitoring update
 */
type ProgressUpdate = {
  counts: DbCounts;
  progress: {
    relationships: string; // percentage as string
    nodes: string; // percentage as string
  };
  deleted: {
    relationships: number;
    nodes: number;
  };
  reportNumber: number;
};

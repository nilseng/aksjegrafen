import { Driver } from "neo4j-driver";
import { GraphLinkType } from "../models/models";

/* Neo4j Graph Data Science algorithms (path search) run on in-memory projections of
 * the graph, not the DB itself. A projection is a snapshot: nodes imported after it
 * was created are invisible to path search ("Source node does not exist in the
 * in-memory graph"), so imports must refresh the projections as their final step. */

const PROJECTIONS = [
  { name: "directedGraph", orientation: "NATURAL" },
  { name: "undirectedGraph", orientation: "UNDIRECTED" },
] as const;

const NODE_LABELS = ["Person", "Unit", "Company", "Shareholder"];

const relationshipProjection = (orientation: string): { [type: string]: object } => {
  const relationships: { [type: string]: object } = {
    [GraphLinkType.OWNS]: { orientation, properties: ["stocks", "share"] },
  };
  for (const type of Object.values(GraphLinkType)) {
    // UNKNOWN does not exist in the graph and would make the projection call throw.
    if (type === GraphLinkType.OWNS || type === GraphLinkType.UNKNOWN) continue;
    relationships[type] = { orientation };
  }
  return relationships;
};

/** Creates the GDS projections if they are missing; with refresh, drops and recreates them. */
export const createProjections = async (graphDB: Driver, { refresh = false } = {}): Promise<void> => {
  for (const { name, orientation } of PROJECTIONS) {
    const session = graphDB.session();
    try {
      const existsResult = await session.run(`CALL gds.graph.exists($name) YIELD exists RETURN exists`, { name });
      const exists: boolean = existsResult.records[0].get("exists");
      if (exists && !refresh) {
        console.log(`*** ${name} projection already exists. ***`);
        continue;
      }
      if (exists) {
        console.log(`Dropping stale ${name} projection...`);
        await session.run(`CALL gds.graph.drop($name)`, { name });
      }
      console.log(`Creating ${name} projection...`);
      await session.run(`CALL gds.graph.project($name, $nodeLabels, $relationships) YIELD graphName`, {
        name,
        nodeLabels: NODE_LABELS,
        relationships: relationshipProjection(orientation),
      });
      console.log(`Created ${name} projection.`);
    } finally {
      await session.close();
    }
  }
};

/** Drops and recreates the projections so path search sees freshly imported nodes. */
export const refreshProjections = (graphDB: Driver): Promise<void> => createProjections(graphDB, { refresh: true });

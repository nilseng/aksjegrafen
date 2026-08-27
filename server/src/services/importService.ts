import { Driver as Neo4j } from "neo4j-driver";
import { refreshProjections } from "../database/graphProjections";
import { IDatabase } from "../database/mongoDB";
import { Year } from "../models/models";
import { clearGraphDatabase } from "../use-cases/clearGraphDatabase";
import { clearGraphYear } from "../use-cases/clearGraphYear";
import { importBusinessCodes } from "../use-cases/importBusinessCodes";
import { importRoles } from "../use-cases/importRoles";
import { importRolesToGraph } from "../use-cases/importRolesToGraph";
import { importShareholderRegistry } from "../use-cases/importShareholderRegistry";
import { importShareholderRegistryToGraph } from "../use-cases/importShareholderRegistryToGraph";
import { applySuppressions } from "../use-cases/manageSuppressions";
import { transformData } from "./transformationService";

/**
 * Imports data for a specific year in a unified flow following the exact sequence:
 * 1. Import shareholder registry from CSV to MongoDB
 * 2. Transform and calculate data (count stocks, etc.)
 * 3. Import data from MongoDB to Neo4j graph database
 *
 * @param graphDB - Neo4j database driver
 * @param db - MongoDB database interface
 * @param year - Year for which to import data
 * @param options - Configuration options for the import process
 */
export interface ImportOptions {
  importToMongoDB?: boolean;
  runTransformation?: boolean;
  importToGraph?: boolean;
  /** Delete the target year's OWNS edges before importing it (additive, default). */
  clearYearFirst?: boolean;
  /** Wipe the ENTIRE graph first — all years AND roles. Roles must be re-imported after. */
  clearGraphDBFirst?: boolean;
  importBusinessCodes?: boolean;
  importRoles?: boolean;
  importRolesToGraph?: boolean;
}

export const importData = async (graphDB: Neo4j, db: IDatabase, year: Year, options?: ImportOptions) => {
  if (!year) throw Error("Year must be specified for data import");

  const importToMongoDB = options?.importToMongoDB !== undefined ? options.importToMongoDB : true;
  const runTransformation = options?.runTransformation !== undefined ? options.runTransformation : true;
  const importToGraph = options?.importToGraph !== undefined ? options.importToGraph : true;
  const clearYearFirst = options?.clearYearFirst !== undefined ? options.clearYearFirst : true;
  const clearGraphDBFirst = options?.clearGraphDBFirst !== undefined ? options.clearGraphDBFirst : false;

  console.log(`========== STARTING UNIFIED IMPORT FLOW FOR YEAR ${year} ==========`);

  if (importToMongoDB) {
    console.log(`\n========== IMPORTING DATA TO MONGODB FOR YEAR ${year} ==========`);
    await importShareholderRegistry(db, year);
  } else {
    console.log("Skipping MongoDB import as requested");
  }

  if (runTransformation) {
    console.log(`\n========== TRANSFORMING DATA FOR YEAR ${year} ==========`);
    await transformData(db, year);
  } else {
    console.log("Skipping data transformation as requested");
  }

  if (importToGraph) {
    console.log(`\n========== IMPORTING DATA TO GRAPH DATABASE FOR YEAR ${year} ==========`);

    if (clearGraphDBFirst) {
      console.log("\n========== CLEARING NEO4J DATABASE BEFORE IMPORT ==========");
      console.warn("WARNING: this wipes ALL years and roles from the graph. Roles must be re-imported afterwards.");
      await clearGraphDatabase(graphDB);
    } else if (clearYearFirst) {
      console.log(`\n========== CLEARING YEAR ${year} FROM THE GRAPH BEFORE IMPORT ==========`);
      await clearGraphYear(graphDB, year);
    }

    await importShareholderRegistryToGraph({ graphDB, mongoDB: db, year });
  } else {
    console.log("Skipping graph database import as requested");
  }

  if (options?.importBusinessCodes) {
    console.log("\n========== IMPORTING BUSINESS CODES ==========");
    await importBusinessCodes(db);
  }

  if (options?.importRoles) {
    console.log("\n========== IMPORTING ROLES TO MONGODB ==========");
    await importRoles(db);
  }

  if (options?.importRolesToGraph) {
    console.log("\n========== IMPORTING ROLES TO GRAPH ==========");
    await importRolesToGraph(graphDB);
  }

  if (importToGraph || options?.importRolesToGraph || clearGraphDBFirst) {
    // GDS projections are in-memory snapshots; without a refresh, path search
    // fails for nodes added by this import ("Source node does not exist...").
    console.log("\n========== REFRESHING GRAPH PROJECTIONS ==========");
    await refreshProjections(graphDB);
  }

  // Imports rebuild the flagged documents/nodes, so suppressions must be re-derived
  // from the suppression list afterwards to keep honoring privacy requests.
  console.log("\n========== RE-APPLYING SUPPRESSIONS ==========");
  const suppressionCount = await applySuppressions({ db, graphDB });
  console.log(`Re-applied ${suppressionCount} suppression entries.`);

  console.log(`\n========== UNIFIED IMPORT FLOW FOR YEAR ${year} COMPLETED ==========`);
};

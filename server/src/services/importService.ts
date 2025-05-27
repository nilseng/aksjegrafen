import { Driver as Neo4j } from "neo4j-driver";
import { IDatabase } from "../database/mongoDB";
import { Year } from "../models/models";
import { generateGraphNodeUUIDs } from "../use-cases/generateGraphNodeUUIDs";
import { importBusinessCodes } from "../use-cases/importBusinessCodes";
import { importRoles } from "../use-cases/importRoles";
import { importShareholderRegistry } from "../use-cases/importShareholderRegistry";
import { importShareholderRegistryToGraph } from "../use-cases/importShareholderRegistryToGraph";
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
export const importData = async (
  graphDB: Neo4j,
  db: IDatabase,
  year?: Year,
  options?: {
    importToMongoDB?: boolean;
    runTransformation?: boolean;
    importToGraph?: boolean;
    generateUUIDs?: boolean;
    importBusinessCodes?: boolean;
    importRoles?: boolean;
  }
) => {
  if (!year) throw Error("Year must be specified for data import");

  const importToMongoDB = options?.importToMongoDB !== undefined ? options.importToMongoDB : true;
  const runTransformation = options?.runTransformation !== undefined ? options.runTransformation : true;
  const importToGraph = options?.importToGraph !== undefined ? options.importToGraph : true;

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
    await importShareholderRegistryToGraph({ graphDB, mongoDB: db, year });
  } else {
    console.log("Skipping graph database import as requested");
  }

  if (options?.generateUUIDs) {
    console.log("\n========== GENERATING GRAPH NODE UUIDS ==========");
    await generateGraphNodeUUIDs(graphDB);
    console.log("To enable UUID generation, uncomment the code in importService.ts");
  }

  if (options?.importBusinessCodes) {
    console.log("\n========== IMPORTING BUSINESS CODES ==========");
    await importBusinessCodes(db);
    console.log("To enable business codes import, uncomment the code in importService.ts");
  }

  if (options?.importRoles) {
    console.log("\n========== IMPORTING ROLES ==========");
    importRoles(db);
    console.log("To enable roles import, uncomment the code in importService.ts");
  }

  console.log(`\n========== UNIFIED IMPORT FLOW FOR YEAR ${year} COMPLETED ==========`);
};

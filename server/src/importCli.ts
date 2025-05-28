import dotenv from "dotenv";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { Database } from "./database/databaseSetup";
import { Year } from "./models/models";
import { importData } from "./services/importService";

dotenv.config();

/**
 * CLI tool for importing shareholder registry data
 * Handles the three-step process:
 * 1. Import shareholder registry from CSV to MongoDB
 * 2. Transform and calculate data (count stocks, etc.)
 * 3. Import data from MongoDB to Neo4j graph database
 */
async function runImport() {
  const validYears = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];

  const argv = yargs(hideBin(process.argv))
    .usage("Usage: $0 <year> [options]")
    .positional("year", {
      describe: "Year for data import (2015-2024)",
      type: "number",
    })
    .command("$0 [year]", "Import shareholder registry data", (yargs) => {
      return yargs.positional("year", {
        describe: "Year for data import",
        type: "number",
        demandOption: true,
      });
    })
    .check((argv) => {
      if (!argv.year) {
        throw new Error("A year must be specified");
      }
      if (!validYears.includes(Number(argv.year))) {
        throw new Error(`Year must be one of: ${validYears.join(", ")}`);
      }
      return true;
    })
    .options({
      importToMongoDB: {
        type: "boolean",
        default: true,
        description: "Import shareholder registry to MongoDB",
      },
      runTransformation: {
        type: "boolean",
        default: true,
        description: "Transform data (count stocks, investor counts, etc.)",
      },
      importToGraph: {
        type: "boolean",
        default: true,
        description: "Import data from MongoDB to Neo4j graph database",
      },
      generateUUIDs: {
        type: "boolean",
        default: false,
        description: "Generate UUIDs for graph nodes",
      },
      importBusinessCodes: {
        type: "boolean",
        default: false,
        description: "Import business codes",
      },
      importRoles: {
        type: "boolean",
        default: false,
        description: "Import roles",
      },
    })
    .help()
    .parseSync();

  try {
    // Initialize database connections
    console.log("Initializing database connections...");
    const { db, graphDB } = await Database.initialize();

    console.log(`Starting import process for year ${argv.year}...`);

    // Run the import process with the specified options
    await importData(graphDB, db, argv.year as Year, {
      importToMongoDB: argv.importToMongoDB,
      runTransformation: argv.runTransformation,
      importToGraph: argv.importToGraph,
      generateUUIDs: argv.generateUUIDs,
      importBusinessCodes: argv.importBusinessCodes,
      importRoles: argv.importRoles,
    });

    console.log("Import process completed successfully.");

    // Close database connections
    await graphDB.close();
    console.log("Database connections closed.");

    process.exit(0);
  } catch (error) {
    console.error("Error during import process:", error);
    process.exit(1);
  }
}

// Run the import process
runImport();

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
  // The registry starts in 2015; data for year N is published in May of N+1, so the
  // current calendar year is the upper bound for any importable year.
  const firstRegistryYear = 2015;
  const maxYear = new Date().getFullYear();

  const argv = yargs(hideBin(process.argv))
    .usage("Usage: $0 <year> [options]")
    .positional("year", {
      describe: `Year for data import (${firstRegistryYear}-${maxYear})`,
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
      if (Number(argv.year) < firstRegistryYear || Number(argv.year) > maxYear) {
        throw new Error(`Year must be between ${firstRegistryYear} and ${maxYear}`);
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
      clearYearFirst: {
        type: "boolean",
        default: true,
        description:
          "Delete the target year's OWNS relationships before importing it (additive; other years and roles are untouched). Pass --clearYearFirst=false to resume an interrupted import without redoing the year.",
      },
      clearGraphDBFirst: {
        type: "boolean",
        default: false,
        description:
          "DESTRUCTIVE: wipe the ENTIRE graph (all years AND roles) before importing. Only for full rebuilds; roles must be re-imported afterwards.",
      },
      importBusinessCodes: {
        type: "boolean",
        default: false,
        description: "Import business codes",
      },
      importRoles: {
        type: "boolean",
        default: false,
        description: "Import roles to MongoDB (note: the app reads roles from the graph, not MongoDB)",
      },
      importRolesToGraph: {
        type: "boolean",
        default: false,
        description: "Import roles from the brreg roles JSON in data/ into the Neo4j graph",
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
      clearYearFirst: argv.clearYearFirst,
      clearGraphDBFirst: argv.clearGraphDBFirst,
      importBusinessCodes: argv.importBusinessCodes,
      importRoles: argv.importRoles,
      importRolesToGraph: argv.importRolesToGraph,
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

import dotenv from "dotenv";
import { Driver } from "neo4j-driver";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { Database } from "./database/databaseSetup";
import { IDatabase } from "./database/mongoDB";

// Migrations. Only current, self-contained migrations are registered here. Older one-off
// migrations in migrations/ are excluded from the build (tsconfig) and some have bit-rotted
// against the current models/config; update one before registering it if it is ever needed.
import { addOrganizationLabels } from "./migrations/20240912_addOrganizationLabels";
import { setPersonName } from "./migrations/20240913_setPersonName";
import { setPersonUuid } from "./migrations/20260525_setPersonUuid";
import { fixNodeLabels } from "./migrations/230602_fixNodeLabels";

dotenv.config();

type Deps = { db: IDatabase; graphDB: Driver };

/**
 * Registry of runnable migrations. Each entry adapts a migration to the shared
 * { db, graphDB } deps. To add a migration: import it and register it here.
 */
const migrations: { [name: string]: (deps: Deps) => Promise<unknown> } = {
  addOrganizationLabels: ({ graphDB }) => addOrganizationLabels(graphDB),
  setPersonName: ({ graphDB }) => setPersonName(graphDB),
  setPersonUuid: ({ graphDB }) => setPersonUuid(graphDB),
  fixNodeLabels: ({ graphDB }) => fixNodeLabels(graphDB),
};

/**
 * CLI for running a one-off migration by name against the configured databases.
 * Usage: node dist/migrateCli.js --name <migration>
 */
async function runMigration() {
  const names = Object.keys(migrations);

  const argv = yargs(hideBin(process.argv))
    .usage("Usage: $0 --name <migration>")
    .option("name", {
      type: "string",
      demandOption: true,
      describe: "Name of the migration to run",
      choices: names,
    })
    .help()
    .parseSync();

  const name = argv.name as string;

  try {
    console.log("Initializing database connections...");
    const { db, graphDB } = await Database.initialize();

    console.log(`Running migration: ${name}`);
    await migrations[name]({ db, graphDB });
    console.log(`Migration "${name}" completed successfully.`);

    await graphDB.close();
    console.log("Database connections closed.");

    process.exit(0);
  } catch (error) {
    console.error(`Error running migration "${name}":`, error);
    process.exit(1);
  }
}

runMigration();

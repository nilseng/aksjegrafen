import dotenv from "dotenv";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { Database } from "./database/databaseSetup";
import { refreshProjections } from "./database/graphProjections";
import { clearGraphRoles } from "./use-cases/clearGraphRoles";
import { downloadBrregEntities, downloadBrregRoles } from "./use-cases/downloadBrregFiles";
import { importRolesToGraph } from "./use-cases/importRolesToGraph";

dotenv.config();

/**
 * CLI for the recurring (e.g. monthly) brreg roles refresh:
 * 1. Download the roles dump from data.brreg.no
 * 2. Delete all role relationships from the graph (the dump is the complete current
 *    stock, so delete-then-reimport removes roles people no longer hold)
 * 3. Re-import roles onto the existing Company/Shareholder nodes
 *
 * Run with e.g. `node --max-old-space-size=8192 dist/refreshRolesCli.js`.
 * OWNS relationships and all shareholder data are untouched.
 */
async function refreshRoles() {
  const argv = yargs(hideBin(process.argv))
    .usage("Usage: $0 [options]")
    .options({
      download: {
        type: "boolean",
        default: true,
        description: "Download the roles dump from data.brreg.no before importing",
      },
      downloadEntities: {
        type: "boolean",
        default: false,
        description: "Also download the entities dump (not used by the roles import)",
      },
      clearRolesFirst: {
        type: "boolean",
        default: true,
        description: "Delete all role relationships before importing, so lapsed roles disappear",
      },
    })
    .help()
    .parseSync();

  try {
    if (argv.download) await downloadBrregRoles();
    if (argv.downloadEntities) await downloadBrregEntities();

    console.log("Initializing database connections...");
    const { graphDB } = await Database.initialize();

    if (argv.clearRolesFirst) await clearGraphRoles(graphDB);

    await importRolesToGraph(graphDB);

    // Path search runs on in-memory GDS projections; refresh them so the
    // updated roles are visible to it.
    await refreshProjections(graphDB);

    await graphDB.close();
    console.log("Roles refresh completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error during roles refresh:", error);
    process.exit(1);
  }
}

refreshRoles();

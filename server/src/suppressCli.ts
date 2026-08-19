import dotenv from "dotenv";
import { ObjectId } from "mongodb";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { Database } from "./database/databaseSetup";
import { Suppression, SuppressionScope } from "./models/models";
import { applySuppressions } from "./use-cases/manageSuppressions";

dotenv.config();

/**
 * CLI for managing the suppression list used to honor privacy requests (e.g. GDPR
 * Art. 21 objections). The identifying details live only in the database — never in
 * the repository.
 *
 * Usage:
 *  npm run suppress -- add --type person --name "<name as in the registers>" --yearOfBirth <yyyy> --reason "GDPR Art. 21 objection"
 *  npm run suppress -- add --type company --orgnr <orgnr> --scope none --noindex
 *  npm run suppress -- list
 *  npm run suppress -- remove --id <mongo id from list>
 *  npm run suppress -- apply
 *
 * add/remove re-apply the whole list immediately. `apply` re-derives all flags on its
 * own and is also run automatically at the end of every data import, since imports
 * rebuild the flagged documents/nodes.
 *
 * NB: person entries matched by name (optionally narrowed by yearOfBirth) suppress
 * every register entry with that exact name — check for namesakes before adding.
 */
async function main() {
  const argv = yargs(hideBin(process.argv))
    .usage("Usage: $0 <add|list|remove|apply> [options]")
    .command("add", "Add a suppression entry and apply it")
    .command("list", "List all suppression entries")
    .command("remove", "Remove a suppression entry by id and re-apply the rest")
    .command("apply", "Re-derive all suppression flags from the list")
    .options({
      type: { type: "string", choices: ["person", "company"] as const, description: "Kind of entity to suppress" },
      orgnr: { type: "string", description: "Organization number (company entries)" },
      name: { type: "string", description: "Person name exactly as it appears in the registers" },
      yearOfBirth: { type: "number", description: "Narrows a person name match to a year of birth" },
      shareholderId: { type: "string", description: "Shareholder register id of the person, if known" },
      scope: {
        type: "string",
        choices: ["search", "all", "none"] as const,
        default: "search" as SuppressionScope,
        description: "search: hidden from name search only. all: hidden everywhere. none: only useful with --noindex",
      },
      noindex: {
        type: "boolean",
        default: false,
        description: "Serve X-Robots-Tag noindex for pages referencing the orgnr",
      },
      reason: { type: "string", description: "Why the entry exists, e.g. 'GDPR Art. 21 objection'" },
      id: { type: "string", description: "Suppression entry id (for remove)" },
    })
    .demandCommand(1, "Specify a command: add, list, remove or apply")
    .help()
    .parseSync();

  const command = argv._[0];

  const { db, graphDB } = await Database.initialize();

  try {
    if (command === "add") {
      if (!argv.type) throw Error("--type is required");
      if (argv.type === "company" && !argv.orgnr) throw Error("Company entries require --orgnr");
      if (argv.type === "person" && !argv.name && !argv.shareholderId)
        throw Error("Person entries require --name and/or --shareholderId");
      if (argv.noindex && !argv.orgnr) throw Error("--noindex requires --orgnr to identify the page");
      if (argv.scope === "none" && !argv.noindex) throw Error("An entry with scope=none and no --noindex does nothing");

      const suppression: Suppression = {
        type: argv.type as Suppression["type"],
        scope: argv.scope as SuppressionScope,
        noindex: argv.noindex,
        orgnr: argv.orgnr,
        shareholderId: argv.shareholderId,
        name: argv.name,
        yearOfBirth: argv.yearOfBirth,
        reason: argv.reason,
        createdAt: new Date(),
      };
      const { insertedId } = await db.suppressions.insertOne(suppression);
      console.log(`Added suppression entry with id=${insertedId}. Applying...`);
      await applySuppressions({ db, graphDB });
      console.log("Suppressions applied.");
    } else if (command === "list") {
      const suppressions = await db.suppressions.find({}).toArray();
      if (suppressions.length === 0) console.log("The suppression list is empty.");
      suppressions.forEach((s) => console.log(JSON.stringify(s)));
    } else if (command === "remove") {
      if (!argv.id) throw Error("--id is required");
      const { deletedCount } = await db.suppressions.deleteOne({ _id: new ObjectId(argv.id) });
      if (!deletedCount) throw Error(`No suppression entry with id=${argv.id}`);
      console.log("Removed suppression entry. Re-applying the remaining list...");
      await applySuppressions({ db, graphDB });
      console.log("Suppressions applied.");
    } else if (command === "apply") {
      const count = await applySuppressions({ db, graphDB });
      console.log(`Applied ${count} suppression entries.`);
    } else {
      throw Error(`Unknown command: ${command}`);
    }

    await graphDB.close();
    process.exit(0);
  } catch (error) {
    console.error("Error managing suppressions:", error);
    await graphDB.close();
    process.exit(1);
  }
}

main();

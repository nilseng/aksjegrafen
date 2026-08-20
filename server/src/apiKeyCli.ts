import crypto from "crypto";
import dotenv from "dotenv";
import { connectToMongoDb } from "./database/mongoDB";
import { ApiKey, ApiTier } from "./models/models";

dotenv.config();

// Manage API keys for the open API's rate-limit tiers.
//   npm run api-key create -- --tier=free --name="Acme AS" --email=post@acme.no
//   npm run api-key create -- --tier=paid --name="Big Customer" --email=api@customer.no --note="Invoiced monthly"
//   npm run api-key list
//   npm run api-key revoke -- --key=agk_xxx
//
// Manual issuance is intentional for now (sell before building billing). A key with
// tier=paid is never rate limited; free/anonymous callers are.

const generateKey = () => `agk_${crypto.randomBytes(24).toString("hex")}`;

const parseFlags = (args: string[]): Record<string, string> => {
  const flags: Record<string, string> = {};
  for (const arg of args) {
    const match = arg.match(/^--([^=]+)=(.*)$/);
    if (match) flags[match[1]] = match[2];
  }
  return flags;
};

const main = async () => {
  const [command, ...rest] = process.argv.slice(2);
  const flags = parseFlags(rest);
  const db = await connectToMongoDb();

  if (command === "create") {
    const tier = (flags.tier as ApiTier) || ApiTier.Free;
    if (tier !== ApiTier.Free && tier !== ApiTier.Paid) {
      throw new Error(`Invalid tier "${tier}". Use --tier=free or --tier=paid.`);
    }
    const apiKey: ApiKey = {
      key: generateKey(),
      tier,
      name: flags.name,
      email: flags.email,
      note: flags.note,
      active: true,
      createdAt: new Date(),
    };
    await db.apiKeys.insertOne(apiKey);
    console.log("\nCreated API key:\n");
    console.log(`  key:   ${apiKey.key}`);
    console.log(`  tier:  ${apiKey.tier}`);
    if (apiKey.name) console.log(`  name:  ${apiKey.name}`);
    if (apiKey.email) console.log(`  email: ${apiKey.email}`);
    console.log("\nGive this key to the customer. They send it as the 'x-api-key' request header.\n");
  } else if (command === "list") {
    const keys = await db.apiKeys.find({}).sort({ createdAt: -1 }).toArray();
    console.table(
      keys.map((k) => ({
        key: k.key,
        tier: k.tier,
        name: k.name ?? "",
        email: k.email ?? "",
        active: k.active,
        createdAt: k.createdAt instanceof Date ? k.createdAt.toISOString() : String(k.createdAt),
      }))
    );
  } else if (command === "revoke") {
    if (!flags.key) throw new Error("Provide --key=<key> to revoke.");
    const result = await db.apiKeys.updateOne(
      { key: flags.key },
      { $set: { active: false, revokedAt: new Date() } }
    );
    console.log(result.matchedCount ? "Revoked." : "No key matched.");
  } else {
    console.log("Usage:");
    console.log('  npm run api-key create -- --tier=free --name="Acme AS" --email=post@acme.no');
    console.log("  npm run api-key list");
    console.log("  npm run api-key revoke -- --key=agk_xxx");
  }

  process.exit(0);
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

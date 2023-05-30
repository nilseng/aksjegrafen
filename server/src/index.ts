import bodyParser from "body-parser";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import sslRedirect from "heroku-ssl-redirect";
import morgan from "morgan";
import { Driver } from "neo4j-driver";
import path from "path";
import { hideBin } from "yargs/helpers";
import yargs from "yargs/yargs";
import { initializeCache } from "./cache/cache";
import { Database } from "./database/databaseSetup";
import { Year } from "./models/models";
import { api } from "./routes/api";
import brregRouter from "./routes/brreg";
import { businessCodeRoutes } from "./routes/businessCodes";
import { importData } from "./services/importService";
import { transformData } from "./services/transformationService";

dotenv.config();

const argv = yargs(hideBin(process.argv))
  .options({
    import: { type: "boolean", default: false, description: "Run an import when starting the server" },
    transform: { type: "boolean", default: false, description: "Run data transformation when starting the server." },
    year: { type: "number", description: "Specify from which year data should be imported - 2019, 2020, 2021 or 2022" },
    data: { type: "array", description: "Specify data to be included - ownerships, companies and/or shareholders" },
    clearCache: { type: "boolean", description: "Clear current db in Redis cache" },
  })
  .parseSync();

const app = express();

app.use(sslRedirect());

app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: "50mb",
  })
);
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.raw());

app.use(morgan("tiny"));

app.use((_, res) => {
  return res.status(200).send("Debugging...");
});

const initializeApp = async () => {
  const { db, graphDB } = await Database.initialize();

  const cache = await initializeCache();

  app.use("/api", api({ graphDB, mongoDB: db, cache }));
  app.use("/business-codes", businessCodeRoutes(db));
  app.use("/brreg", brregRouter);

  app.use(express.static(path.join(__dirname, "../../client/build")));
  app.use("/*", express.static(path.join(__dirname, "../../client/build", "index.html")));

  app.listen({ port: process.env.PORT || 4000 }, () =>
    console.log(`The server is now running on port ${process.env.PORT || 4000}`)
  );

  app.use((err: Error, _: Request, res: Response, __: () => void) => {
    console.error(err.stack);
    return res.status(500).json({ error: "An unexpected error occured." });
  });

  if (argv.import) importData(graphDB, db, argv.year as Year, argv.data);
  if (argv.transform && argv.year) transformData(db, argv.year as Year);
  if (argv.clearCache) cache.flushdb();

  gracefulShutdown({ graphDB });
};

initializeApp();

// TODO: Move MongoDB shutdown here also
const gracefulShutdown = ({ graphDB }: { graphDB: Driver }) => {
  process.on("SIGINT", async () => {
    await graphDB.close();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    await handleShutDown({ graphDB });
  });
};

const handleShutDown = async ({ graphDB }: { graphDB: Driver }) => {
  await graphDB.close();
  process.exit(0);
};

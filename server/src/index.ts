import bodyParser from "body-parser";
import dotenv from "dotenv";
import express from "express";
import sslRedirect from "heroku-ssl-redirect";
import morgan from "morgan";
import path from "path";
import { hideBin } from "yargs/helpers";
import yargs from "yargs/yargs";
import { initializeCache } from "./cache/cache";
import { Database } from "./database/databaseSetup";
import { Year } from "./models/models";
import { api } from "./routes/api";
import brregRouter from "./routes/brreg";
import { deleteData, importData } from "./services/importService";
import { transformData } from "./services/transformationService";

dotenv.config();

const argv = yargs(hideBin(process.argv))
  .options({
    import: { type: "boolean", default: false, description: "Run an import when starting the server" },
    deletion: { type: "boolean", default: false, description: "Run data deletion when starting the server" },
    transform: { type: "boolean", default: false, description: "Run data transformation when starting the server." },
    year: { type: "number", description: "Specify from which year data should be imported - 2019 or 2020 or 2021" },
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

const initializeApp = async () => {
  const db = await Database.initialize();

  const cache = await initializeCache();

  const router = api(db, cache);
  app.use("/api", router);

  app.use("/brreg", brregRouter);

  app.use(express.static(path.join(__dirname, "../../client/build")));
  app.use("/*", express.static(path.join(__dirname, "../../client/build", "index.html")));

  app.listen({ port: process.env.PORT || 4000 }, () =>
    console.log(`The server is now running on port ${process.env.PORT || 4000}`)
  );

  if (argv.import) importData(db, argv.year as Year, argv.data);
  if (argv.deletion) deleteData(db, argv.year, argv.data);
  if (argv.transform && argv.year) transformData(db, argv.year as Year);
  if (argv.clearCache) cache.flushdb();
};

initializeApp();

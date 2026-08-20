import cors from "cors";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import sslRedirect from "heroku-ssl-redirect";
import morgan from "morgan";
import { Driver } from "neo4j-driver";
import path from "path";

import { Database } from "./database/databaseSetup";
import { api } from "./routes/api";
import brregRouter from "./routes/brreg";
import { businessCodeRoutes } from "./routes/businessCodes";
import { ensureSeoIndexes } from "./database/ensureSeoIndexes";
import { selskapRoutes } from "./routes/selskap";
import { selskaperRoutes } from "./routes/selskaper";
import { sitemapRoutes } from "./routes/sitemap";
import { loadAvailableYears } from "./services/yearService";

dotenv.config();

const app = express();

// Behind Heroku's router: trust the first proxy hop so req.ip is the real client IP
// (required for correct per-client API rate limiting).
app.set("trust proxy", 1);

app.use(sslRedirect());

// Canonical host: 301 www.* → apex so Google consolidates signals on one hostname
// (both currently answer 200, which Search Console flags as duplicate URLs).
app.use((req, res, next) => {
  const host = req.headers.host;
  if (host?.startsWith("www.")) {
    return res.redirect(301, `https://${host.slice(4)}${req.originalUrl}`);
  }
  next();
});

app.use(
  cors({
    origin: process.env.CORS_ALLOWED_ORIGINS || "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "50mb",
  })
);
app.use(express.json());
app.use(express.raw());

app.use(morgan("tiny"));

const initializeApp = async () => {
  const { db, graphDB } = await Database.initialize();

  // Non-blocking: requests fall back to a sensible default year until this resolves.
  // The SEO indexes wait for the years since one is keyed by the latest data year.
  loadAvailableYears(graphDB)
    .catch((e) => console.error("Failed to load available years:", e))
    .finally(() => ensureSeoIndexes(db).catch((e) => console.error("Failed to ensure SEO indexes:", e)));

  app.use("/api", api({ db }));
  app.use("/business-codes", businessCodeRoutes(db));
  app.use("/brreg", brregRouter);
  app.use("/selskap", selskapRoutes({ db }));
  app.use("/selskaper", selskaperRoutes({ db }));
  app.use("/", sitemapRoutes({ db }));

  // Static offer page (compliance GTM) — must be mounted before the SPA catch-all.
  // Resolves to server/static both under ts-node (src/) and a compiled dist/.
  app.get("/eierskapssjekk", (_, res) => res.sendFile(path.join(__dirname, "../static/eierskapssjekk.html")));

  app.use(express.static(path.join(__dirname, "../../client/build")));
  app.use("/*", express.static(path.join(__dirname, "../../client/build", "index.html")));

  app.listen({ port: process.env.PORT || 4000 }, () =>
    console.log(`The server is now running on port ${process.env.PORT || 4000}`)
  );

  app.use((err: Error, _: Request, res: Response, __: () => void) => {
    console.error(err.stack);
    return res.status(500).json({ error: "An unexpected error occured." });
  });

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

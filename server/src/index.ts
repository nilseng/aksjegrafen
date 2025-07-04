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

dotenv.config();

const app = express();

app.use(sslRedirect());

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

  app.use("/api", api({ db }));
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

import dotenv from "dotenv";
import neo4j, { auth } from "neo4j-driver";
dotenv.config();

export const graphDB = neo4j.driver(
  process.env.NEO4J_URL!,
  auth.basic(process.env.NEO4J_USERNAME!, process.env.NEO4J_PWD!),
  { connectionTimeout: 600_000, maxConnectionLifetime: 600_000, connectionAcquisitionTimeout: 600_000 }
);

const createIndexes = async () => {
  const session = graphDB.session();
  console.info("Creating indexes");
  await session.run(`CREATE INDEX shareholderOrgnr IF NOT EXISTS FOR (s:Shareholder) ON (s.shareholderOrgnr)`);
  console.info("Indexes created");
  session.close();
};

// createIndexes();

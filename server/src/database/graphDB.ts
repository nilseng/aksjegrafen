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
  /* await session.run(`
    CREATE FULLTEXT INDEX namesAndOrgnrs IF NOT EXISTS 
    FOR (n:Company|Shareholder|Person|Unit) 
    ON EACH [n.name, n.orgnr]
  `); */
  console.info("Indexes created");
  session.close();
};

const createConstraints = async () => {
  const session = graphDB.session();
  console.info("Creating constraints");
  await session.run(`CREATE CONSTRAINT unique_company_orgnrs IF NOT EXISTS FOR (c:Company) REQUIRE c.orgnr IS UNIQUE`);
  await session.run(
    `CREATE CONSTRAINT unique_shareholder_ids IF NOT EXISTS FOR (s:Shareholder) REQUIRE s.id IS UNIQUE`
  );
  await session.run(`CREATE CONSTRAINT unique_unit_orgnrs IF NOT EXISTS FOR (u:Unit) REQUIRE u.orgnr IS UNIQUE`);
  await session.run(
    `CREATE CONSTRAINT unique_people IF NOT EXISTS FOR (p:Person) REQUIRE (p.birthDate, p.firstName, p.lastName) IS UNIQUE`
  );
  console.info("Created constraints");
  session.close();
};

createIndexes();
createConstraints();

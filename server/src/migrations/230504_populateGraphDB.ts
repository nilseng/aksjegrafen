import { Driver } from "neo4j-driver";
import { IDatabase } from "../database/databaseSetup";

export const populateGraphDB = async ({ mongoDB, graphDB }: { mongoDB: IDatabase; graphDB: Driver }) => {
  /* 
    1. Fetch companies and ownerships from mongo
    2. Store nodes and relationships in graph
    */

  const companies = await mongoDB.companies.find({}).limit(500).toArray();
  console.info(`Fetched ${companies.length} companies.`);
  const session = graphDB.session();

  const query = `
        UNWIND $companies as company
        MERGE (n:Company {orgnr: company.orgnr})
        ON CREATE SET n.orgnr = company.orgnr, n.total_stocks_2021 = company.total_stocks_2021
        ON MATCH SET n.orgnr = company.orgnr, n.total_stocks_2021 = company.total_stocks_2021
    `;

  const params = {
    companies: companies.map((c) => ({
      orgnr: c.orgnr,
      ...(c.shares?.[2021]?.total ? { total_stocks_2021: c.shares[2021].total } : {}),
    })),
  };

  const res = await session.executeWrite((t) => t.run(query, params));
  console.info("Executed query");
  console.info("counters", res.summary.counters.updates());
  console.info("counters", res.summary.updateStatistics.updates());

  await session.close();
};

import { Driver } from "neo4j-driver";
import { IDatabase } from "../database/mongoDB";
import { Company, Ownership, Shareholder } from "../models/models";

export const populateGraphDB = async ({ mongoDB, graphDB }: { mongoDB: IDatabase; graphDB: Driver }) => {
  const ownerships = await mongoDB.ownerships.find({ "holdings.2021.total": { $gt: 0 } }).toArray();

  const companies = await mongoDB.companies.find({}).toArray();
  console.info(`Fetched ${companies.length} companies.`);

  const shareholders = await mongoDB.shareholders.find({}).toArray();
  console.info(`Fetched ${shareholders.length} shareholders.`);

  const companyMap: { [orgnr: string]: Company } = {};
  companies.forEach((c) => {
    companyMap[c.orgnr] = c;
  });

  const shareholderMap: { [id: string]: Shareholder } = {};
  shareholders.forEach((s) => {
    if (s.orgnr) shareholderMap[s.orgnr] = s;
    else shareholderMap[s.id] = s;
  });

  ownerships.forEach((o) => {
    o.investment = companyMap[o.orgnr];
    o.investor = {
      company: o.shareholderOrgnr ? companyMap[o.shareholderOrgnr] : undefined,
      shareholder: o.shareholderOrgnr ? shareholderMap[o.shareholderOrgnr] : shareholderMap[o.shareHolderId],
    };
    (o as Ownership & { total_stocks_2021?: number }).total_stocks_2021 = o.investment.shares?.[2021]?.total;
    if (o.holdings[2021]?.total) (o as Ownership & { stocks_2021: number }).stocks_2021 = o.holdings[2021].total;
    if (o.holdings[2021]?.total) {
      (o as Ownership & { share_2021: number }).share_2021 =
        o.holdings[2021].total / o.investment.shares?.[2021]?.total!;
    }
  });

  const session = graphDB.session();

  const chunkSize = 50_000;
  for (let i = 0; i < ownerships.length; i += chunkSize) {
    console.info(`Adding ownerships ${i} to ${i + chunkSize} to graph.`);

    const ownershipChunk = ownerships.slice(i, i + chunkSize);

    const params = {
      ownerships: ownershipChunk,
    };

    const createCompaniesQuery = `
    UNWIND $ownerships as ownership

    MERGE (c:Company {orgnr: ownership.orgnr})
    ON CREATE SET c.total_stocks_2021 = ownership.total_stocks_2021, c.name = ownership.investment.name
    ON MATCH SET c.total_stocks_2021 = ownership.total_stocks_2021, c.name = ownership.investment.name
  `;

    await session.executeWrite((t) => t.run(createCompaniesQuery, params));
    console.info("Created company nodes.");

    const createShareholderCompaniesQuery = `
    UNWIND $ownerships as ownership

    WITH ownership
    WHERE ownership.shareholderOrgnr IS NOT NULL
    MERGE (cs:Company {orgnr: ownership.shareholderOrgnr})
    ON CREATE SET cs:Shareholder, cs.name = ownership.investor.shareholder.name, cs.id = ownership.shareHolderId
    ON MATCH SET cs:Shareholder, cs.name = ownership.investor.shareholder.name, cs.id = ownership.shareHolderId
  `;

    await session.executeWrite((t) => t.run(createShareholderCompaniesQuery, params));
    console.info("Created company shareholder nodes.");

    const createShareholdersQuery = `
    UNWIND $ownerships as ownership

    WITH ownership
    WHERE ownership.investor.shareholder.id IS NOT NULL
    MERGE (s:Shareholder {id: ownership.investor.shareholder.id})
    ON CREATE SET s.name = ownership.investor.shareholder.name
    ON MATCH SET s.name = ownership.investor.shareholder.name
  `;

    await session.executeWrite((t) => t.run(createShareholdersQuery, params));
    console.info("Created shareholder nodes.");

    const createCompanyToCompanyRelationshipsQuery = `
    UNWIND $ownerships as ownership

    WITH ownership
    WHERE ownership.shareholderOrgnr IS NOT NULL
    MATCH (p1:Company {orgnr: ownership.shareholderOrgnr}), (c1: Company {orgnr: ownership.orgnr})
    MERGE (p1)-[csc:OWNS {year: 2021}]->(c1)
    ON CREATE SET csc.year = 2021, csc.stocks = ownership.stocks_2021, csc.share = ownership.share_2021
    ON MATCH SET csc.year = 2021, csc.stocks = ownership.stocks_2021, csc.share = ownership.share_2021
  `;
    await session.executeWrite((t) => t.run(createCompanyToCompanyRelationshipsQuery, params));
    console.info("Created company to company relationships");

    const createShareholderToCompanyRelationshipQuery = `
    UNWIND $ownerships as ownership

    WITH ownership
    WHERE ownership.shareholderOrgnr IS NULL
    MATCH (p2:Shareholder {id: ownership.investor.shareholder.id}), (c2: Company {orgnr: ownership.orgnr})
    MERGE (p2)-[sc:OWNS {year: 2021}]->(c2)
    ON CREATE SET sc.year = 2021, sc.stocks = ownership.stocks_2021, sc.share = ownership.share_2021
    ON MATCH SET sc.year = 2021, sc.stocks = ownership.stocks_2021, sc.share = ownership.share_2021
    `;
    await session.executeWrite((t) => t.run(createShareholderToCompanyRelationshipQuery, params));
    console.info("Created shareholder to company relationships.");
  }

  await session.close();
};

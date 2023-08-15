import { Driver } from "neo4j-driver";
import { IDatabase } from "../database/mongoDB";
import { Company, Ownership, Shareholder, Year } from "../models/models";

type GraphOwnership = Ownership & {
  total_stocks_2019?: number;
  total_stocks_2020?: number;
  total_stocks_2021?: number;
  total_stocks_2022?: number;
  stocks_2019?: number;
  stocks_2020?: number;
  stocks_2021?: number;
  stocks_2022?: number;
  share_2019?: number;
  share_2020?: number;
  share_2021?: number;
  share_2022?: number;
  [key: string]: number | undefined;
};

export const importShareholderRegistryToGraph = async ({
  year,
  mongoDB,
  graphDB,
}: {
  year?: Year;
  mongoDB: IDatabase;
  graphDB: Driver;
}) => {
  if (!year) throw Error("Invalid year.");

  console.info(`Starting import to Graph DB for year ${year}`);

  const ownerships = await mongoDB.ownerships.find({ [`holdings.${year}.total`]: { $gt: 0 } }).toArray();
  console.info(`Fetched ${ownerships.length} ownerships.`);

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
    (o as GraphOwnership)[`total_stocks_${year}`] = o.investment.shares?.[year]?.total;
    if (o.holdings[year]?.total) (o as GraphOwnership)[`stocks_${year}`] = o.holdings[year]?.total;
    if (o.holdings[year]?.total) {
      (o as GraphOwnership)[`share_${year}`] = o.holdings[year]?.total! / o.investment.shares?.[year]?.total!;
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
    ON CREATE SET c.total_stocks_${year} = ownership.total_stocks_${year}, c.name = ownership.investment.name
    ON MATCH SET c.total_stocks_${year} = ownership.total_stocks_${year}, c.name = ownership.investment.name
  `;

    await session.executeWrite((t) => t.run(createCompaniesQuery, params));
    console.info("Created company nodes.");

    const createShareholderCompaniesQuery = `
    UNWIND $ownerships as ownership

    WITH ownership
    WHERE ownership.shareholderOrgnr IS NOT NULL
    MATCH (cs:Company {orgnr: ownership.shareholderOrgnr})
    SET cs:Shareholder, cs.name = ownership.investor.shareholder.name, cs.id = ownership.shareHolderId
  `;

    await session.executeWrite((t) => t.run(createShareholderCompaniesQuery, params));
    console.info("Updated company shareholder nodes.");

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
    MERGE (p1)-[csc:OWNS {year: ${year}}]->(c1)
    ON CREATE SET csc.year = ${year}, csc.stocks = ownership.stocks_${year}, csc.share = ownership.share_${year}
    ON MATCH SET csc.year = ${year}, csc.stocks = ownership.stocks_${year}, csc.share = ownership.share_${year}
  `;
    await session.executeWrite((t) => t.run(createCompanyToCompanyRelationshipsQuery, params));
    console.info("Created company to company relationships");

    const createShareholderToCompanyRelationshipQuery = `
    UNWIND $ownerships as ownership

    WITH ownership
    WHERE ownership.shareholderOrgnr IS NULL
    MATCH (p2:Shareholder {id: ownership.investor.shareholder.id}), (c2: Company {orgnr: ownership.orgnr})
    MERGE (p2)-[sc:OWNS {year: ${year}}]->(c2)
    ON CREATE SET sc.year = ${year}, sc.stocks = ownership.stocks_${year}, sc.share = ownership.share_${year}
    ON MATCH SET sc.year = ${year}, sc.stocks = ownership.stocks_${year}, sc.share = ownership.share_${year}
    `;
    await session.executeWrite((t) => t.run(createShareholderToCompanyRelationshipQuery, params));
    console.info("Created shareholder to company relationships.");
  }

  await session.close();
};

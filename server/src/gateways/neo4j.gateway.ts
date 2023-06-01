import { graphDB } from "../database/graphDB";

const runQuery = async ({ query, params }: { query: string; params: unknown }) => {
  const session = graphDB.session();
  const res = await session.run(query, params);
  session.close();
  return res.records;
};

export const findInvestors = ({ uuid, limit }: { uuid: string; limit: number }) =>
  runQuery({
    query: `
        MATCH (investor:Shareholder)-[:OWNS]->(source:Company)
        WHERE source.uuid = $uuid
        RETURN investor, source
        LIMIT ${limit}
    `,
    params: { uuid },
  });

export const findInvestments = ({ uuid, limit }: { uuid: string; limit: number }) =>
  runQuery({
    query: `
        MATCH (source:Shareholder)-[:OWNS]->(investment:Company)
        WHERE source.uuid = $uuid
        RETURN investment
        LIMIT ${limit}
    `,
    params: { uuid },
  });

export const findRoleHolders = ({ uuid, limit }: { uuid: string; limit: number }) =>
  runQuery({
    query: `
        MATCH (holder:Person|Unit)-[r]->(source:Unit)
        WHERE source.uuid = $uuid AND type(r) <> "OWNS"
        RETURN holder
        LIMIT ${limit}
    `,
    params: { uuid },
  });

export const findRoleUnits = ({ uuid, limit }: { uuid: string; limit: number }) =>
  runQuery({
    query: `
        MATCH (source:Unit|Person)-[r]->(unit:Unit|Company)
        WHERE source.uuid = $uuid AND type(r) <> "OWNS"
        RETURN unit
        LIMIT ${limit}
    `,
    params: { uuid },
  });

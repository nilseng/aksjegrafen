import { Driver } from "neo4j-driver";

export const addOrganizationLabels = async (graphDB: Driver) => {
  console.log("*** Adding Organization label to all nodes with an orgnr ***");
  await addOrganizationLabelsToCompanies(graphDB);
  await addOrganizationLabelsToShareholders(graphDB);
  await addOrganizationLabelsToUnits(graphDB);
};

const addOrganizationLabelsToCompanies = async (graphDB: Driver) => {
  console.log("*** Adding Organization label to all companies ***");
  const session = graphDB.session();
  const res = await session.run(`
      MATCH (n:Company)
      WHERE n.orgnr IS NOT NULL
      SET n:Organization;
    `);
  console.log(res.records);
  console.log(res.summary);
  session.close();
};

const addOrganizationLabelsToShareholders = async (graphDB: Driver) => {
  console.log("*** Adding Organization label to all shareholders with an orgnr ***");
  const session = graphDB.session();
  const res = await session.run(`
      MATCH (n:Shareholder)
      WHERE n.orgnr IS NOT NULL
      SET n:Organization;
    `);
  console.log(res.records);
  console.log(res.summary);
  session.close();
};

const addOrganizationLabelsToUnits = async (graphDB: Driver) => {
  console.log("*** Adding Organization label to all units with an orgnr ***");
  const session = graphDB.session();
  const res = await session.run(`
      MATCH (n:Unit)
      WHERE n.orgnr IS NOT NULL
      SET n:Organization;
    `);
  console.log(res.records);
  console.log(res.summary);
  session.close();
};

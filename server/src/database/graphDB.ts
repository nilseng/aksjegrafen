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
  await session.run(`
    CREATE FULLTEXT INDEX namesAndOrgnrs IF NOT EXISTS 
    FOR (n:Company|Shareholder|Person|Unit) 
    ON EACH [n.name, n.orgnr]
  `);
  console.info("Indexes created");
  session.close();
};

const createConstraints = async () => {
  const session = graphDB.session();
  console.info("Creating constraints");
  await session.run(`CREATE CONSTRAINT company_uuids IF NOT EXISTS FOR (n:Company) REQUIRE n.uuid is UNIQUE`);
  await session.run(`CREATE CONSTRAINT shareholder_uuids IF NOT EXISTS FOR (n:Shareholder) REQUIRE n.uuid is UNIQUE`);
  await session.run(`CREATE CONSTRAINT unit_uuids IF NOT EXISTS FOR (n:Unit) REQUIRE n.uuid is UNIQUE`);
  await session.run(`CREATE CONSTRAINT person_uuids IF NOT EXISTS FOR (n:Person) REQUIRE n.uuid is UNIQUE`);
  await session.run(`CREATE CONSTRAINT unique_company_orgnrs IF NOT EXISTS FOR (c:Company) REQUIRE c.orgnr IS UNIQUE`);
  await session.run(`CREATE CONSTRAINT unique_unit_orgnrs IF NOT EXISTS FOR (u:Unit) REQUIRE u.orgnr IS UNIQUE`);
  await session.run(
    `CREATE CONSTRAINT unique_shareholder_orgnrs IF NOT EXISTS FOR (s:Shareholder) REQUIRE s.orgnr IS UNIQUE`
  );
  await session.run(
    `CREATE CONSTRAINT unique_shareholder_ids IF NOT EXISTS FOR (s:Shareholder) REQUIRE s.id IS UNIQUE`
  );
  await session.run(
    `CREATE CONSTRAINT unique_people IF NOT EXISTS FOR (p:Person) REQUIRE (p.birthDate, p.firstName, p.lastName) IS UNIQUE`
  );
  await session.run(
    `CREATE CONSTRAINT unique_organization_orgnrs IF NOT EXISTS FOR (o:Organization) REQUIRE o.orgnr IS UNIQUE`
  );
  console.info("Created constraints");
  session.close();
};

/* Neo4j Graph Data Science algorithms are run on projections of the graph and not the DB itself. */
const createProjections = async () => {
  const session = graphDB.session();
  console.info("Creating projections");
  const directedGraphExists = (
    await session.run(`
    CALL gds.graph.exists('directedGraph') YIELD exists
    RETURN exists;
  `)
  ).records[0].get("exists");
  if (directedGraphExists) console.log("*** Directed graph projection already exists. ***");
  else {
    await session.run(`
    CALL gds.graph.project(
      'directedGraph',    
      ['Person', 'Unit', 'Company', 'Shareholder'],   
      {
        OWNS: {orientation: 'NATURAL', properties: ['stocks', 'share']}, 
        BEST: {orientation: 'NATURAL'}, 
        BOBE: {orientation: 'NATURAL'}, 
        DAGL: {orientation: 'NATURAL'}, 
        DTPR: {orientation: 'NATURAL'}, 
        DTSO: {orientation: 'NATURAL'}, 
        EIKM: {orientation: 'NATURAL'}, 
        FFØR: {orientation: 'NATURAL'}, 
        HFOR: {orientation: 'NATURAL'}, 
        HLSE: {orientation: 'NATURAL'}, 
        KDEB: {orientation: 'NATURAL'}, 
        KIRK: {orientation: 'NATURAL'}, 
        KOMP: {orientation: 'NATURAL'}, 
        KONT: {orientation: 'NATURAL'}, 
        LEDE: {orientation: 'NATURAL'},
        MEDL: {orientation: 'NATURAL'}, 
        NEST: {orientation: 'NATURAL'}, 
        OBS: {orientation:  'NATURAL'}, 
        OPMV: {orientation: 'NATURAL'}, 
        ORGL: {orientation: 'NATURAL'}, 
        REGN: {orientation: 'NATURAL'}, 
        REPR: {orientation: 'NATURAL'}, 
        REVI: {orientation: 'NATURAL'}, 
        VARA: {orientation: 'NATURAL'}
      }
    )
    YIELD graphName
  `);
  }
  const undirectedGraphExists = (
    await session.run(`
    CALL gds.graph.exists('undirectedGraph') YIELD exists
    RETURN exists;
  `)
  ).records[0].get("exists");
  if (undirectedGraphExists) console.log("*** Undirected graph projection already exists. ***");
  else {
    await session.run(`
    CALL gds.graph.project(
      'undirectedGraph',    
      ['Person', 'Unit', 'Company', 'Shareholder'],   
      {
        OWNS: {orientation: 'UNDIRECTED', properties: ['stocks', 'share']}, 
        BEST: {orientation: 'UNDIRECTED'}, 
        BOBE: {orientation: 'UNDIRECTED'}, 
        DAGL: {orientation: 'UNDIRECTED'}, 
        DTPR: {orientation: 'UNDIRECTED'}, 
        DTSO: {orientation: 'UNDIRECTED'}, 
        EIKM: {orientation: 'UNDIRECTED'}, 
        FFØR: {orientation: 'UNDIRECTED'}, 
        HFOR: {orientation: 'UNDIRECTED'}, 
        HLSE: {orientation: 'UNDIRECTED'}, 
        KDEB: {orientation: 'UNDIRECTED'}, 
        KIRK: {orientation: 'UNDIRECTED'}, 
        KOMP: {orientation: 'UNDIRECTED'}, 
        KONT: {orientation: 'UNDIRECTED'}, 
        LEDE: {orientation: 'UNDIRECTED'},
        MEDL: {orientation: 'UNDIRECTED'}, 
        NEST: {orientation: 'UNDIRECTED'}, 
        OBS: {orientation: 'UNDIRECTED'}, 
        OPMV: {orientation: 'UNDIRECTED'}, 
        ORGL: {orientation: 'UNDIRECTED'}, 
        REGN: {orientation: 'UNDIRECTED'}, 
        REPR: {orientation: 'UNDIRECTED'}, 
        REVI: {orientation: 'UNDIRECTED'}, 
        VARA: {orientation: 'UNDIRECTED'}
      }
    )
    YIELD graphName
  `);
  }
  console.info("Created projections");
  session.close();
};

createIndexes().catch((e) => {
  console.error("Failed to create indexes", e);
});

createConstraints().catch((e) => {
  console.error("Failed to create constraints", e);
});

createProjections().catch((e) => {
  console.error("Failed to create projections", e);
});

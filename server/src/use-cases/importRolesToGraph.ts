import JSONStream from "JSONStream";
import fs from "fs";
import { Driver } from "neo4j-driver";
import path from "path";
import { UnitRoles } from "../models/brregModels";
import { Role } from "../models/models";
import { setPersonNames } from "./setPersonNames";

export const importRolesToGraph = async (graphDB: Driver) => {
  console.log(`*** Importing roles to graph ***`);
  const roles = await readRoles();

  const session = graphDB.session();

  const chunkSize = 50_000;
  for (let i = 0; i < roles.length; i += chunkSize) {
    console.info(`Adding roles ${i} to ${i + chunkSize} to graph.`);

    const params = {
      roles: roles.slice(i, i + chunkSize),
    };

    const updateRoleHoldersQuery = `
    UNWIND $roles as role

    WITH role
    WHERE role.holder.unit.orgnr IS NOT NULL
    MATCH (c:Company|Shareholder {orgnr: role.holder.unit.orgnr})
    SET c:Unit
    `;
    await session.executeWrite((t) => t.run(updateRoleHoldersQuery, params));
    console.info("Updated company role holder nodes");

    const updateRoleUnitsQuery = `
    UNWIND $roles as role

    WITH role
    MATCH (c:Company|Shareholder {orgnr: role.orgnr})
    SET c:Unit
    `;
    await session.executeWrite((t) => t.run(updateRoleUnitsQuery, params));
    console.info("Updated role unit company nodes");

    const createUnitsQuery = `
    UNWIND $roles as role

    WITH role
    WHERE role.holder.unit.orgnr IS NOT NULL

    MATCH (n:Unit)
    WITH *, n
    WHERE n.orgnr = role.orgnr

    MERGE (u:Unit {orgnr: role.holder.unit.orgnr})
    ON CREATE SET u.uuid = randomUUID(), u.type = role.holder.unit.organisasjonsform, u.name = role.holder.unit.navn
    ON MATCH SET u.type = role.holder.unit.organisasjonsform, u.name = role.holder.unit.navn
    `;
    await session.executeWrite((t) => t.run(createUnitsQuery, params));
    console.info("Merged unit nodes.");

    const createPersonsQuery = `
    UNWIND $roles as role

    WITH role
    WHERE role.holder.person.birthDate IS NOT NULL OR role.holder.person.fornavn IS NOT NULL OR role.holder.person.etternavn

    MATCH (n:Unit)
    WITH *, n
    WHERE n.orgnr = role.orgnr

    MERGE (p:Person {birthDate: coalesce(role.holder.person.birthDate, ''), firstName: coalesce(role.holder.person.fornavn, ''), lastName: coalesce(role.holder.person.etternavn, '')})
`;
    await session.executeWrite((t) => t.run(createPersonsQuery, params));
    console.info("Created person nodes.");

    const createUnitToCompanyRelationshipsQuery = `
    UNWIND $roles as role

    WITH role
    WHERE role.holder.unit IS NOT NULL
    MATCH (u:Unit {orgnr: role.holder.unit.orgnr})
    MATCH (c:Company {orgnr: role.orgnr})
    CALL apoc.merge.relationship(u, role.type, {}, {}, c, {}) YIELD rel
    WITH rel, role
    RETURN null
`;
    await session.executeWrite((t) => t.run(createUnitToCompanyRelationshipsQuery, params));
    console.info("Created unit to company relationships");

    const createPersonToCompanyRelationshipsQuery = `
    UNWIND $roles as role

    WITH role
    WHERE role.holder.person.birthDate IS NOT NULL OR role.holder.person.fornavn IS NOT NULL OR role.holder.person.etternavn
    MATCH (p:Person {birthDate: coalesce(role.holder.person.birthDate, ''), firstName: coalesce(role.holder.person.fornavn, ''), lastName: coalesce(role.holder.person.etternavn, '')})
    MATCH (c:Company {orgnr: role.orgnr})
    CALL apoc.merge.relationship(p, role.type, {}, {}, c, {}) YIELD rel
    WITH rel, role
    RETURN null
`;
    await session.executeWrite((t) => t.run(createPersonToCompanyRelationshipsQuery, params));
    console.info("Created person to company relationships");
  }

  session.close();

  console.log("Setting name property on Person nodes...");
  await setPersonNames(graphDB);

  console.log(`*** Import of roles to graph complete ***`);
};

const readRoles = (): Promise<Role[]> => {
  return new Promise((resolve, reject) => {
    const parser = JSONStream.parse("*");
    const stream = fs.createReadStream(
      path.join(__dirname, "../../..", "data", "roller_2024-09-13T04-00-11.954590244.json")
    );
    const roles: Role[] = [];
    stream.pipe(parser).on("data", (chunk: UnitRoles) => {
      chunk.rollegrupper.forEach((group) => {
        group.roller.forEach((r) => {
          const role: Role = {
            type: r.type.kode,
            orgnr: chunk.organisasjonsnummer,
            holder: {
              person: {
                birthDate: r.person?.fodselsdato,
                fornavn: r.person?.navn.fornavn,
                etternavn: r.person?.navn.etternavn,
              },
              unit: r.enhet
                ? {
                    orgnr: r.enhet?.organisasjonsnummer,
                    organisasjonsform: r.enhet.organisasjonsform.kode,
                    navn: r.enhet.navn[0],
                  }
                : undefined,
            },
          };
          console.log(role);
          roles.push(role);
        });
      });
    });
    stream.on("error", reject);
    stream.on("end", () => {
      resolve(roles);
    });
  });
};

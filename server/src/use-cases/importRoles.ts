import JSONStream from "JSONStream";
import { IDatabase } from "../database/mongoDB";
import { brregRolesFile } from "../config";
import { UnitRoles } from "../models/brregModels";
import { Role } from "../models/models";
import { createDataFileReadStream } from "../utils/createDataFileReadStream";

export const importRoles = async (db: IDatabase) => {
  const parser = JSONStream.parse("*");
  const stream = await createDataFileReadStream(brregRolesFile());
  const roles: Role[] = [];
  stream.pipe(parser).on("data", (chunk: UnitRoles) => {
    chunk.rollegrupper.forEach((group) => {
      group.roller.forEach((r) => {
        const role: Role = {
          type: r.type.kode,
          orgnr: chunk.organisasjonsnummer,
          holder: {
            person: {
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
        roles.push(role);
      });
    });
  });
  stream.on("end", async () => {
    const res = await db.roles.insertMany(roles);
    console.log(`Inserted ${res.insertedCount} roles`);
  });
};

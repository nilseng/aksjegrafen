import fs from "fs";
import JSONStream from "JSONStream";
import path from "path";
import { IDatabase } from "../database/databaseSetup";
import { Role } from "../models/models";

export interface UnitRoles {
  organisasjonsnummer: string;
  rollegrupper: RoleGroups[];
  _links: {
    self: {
      href: string;
    };
    enhet: {
      href: string;
    };
  };
}

export interface RoleGroups {
  type: RoleType;
  sistEndret: string;
  roller: Roles[];
}

export interface RoleType {
  kode: string;
  beskrivelse: string;
  _links: {
    self: {
      href: string;
    };
  };
}

export interface Roles {
  type: RoleType;
  person?: {
    fodselsdato: string;
    navn: {
      fornavn: string;
      etternavn: string;
    };
    erDoed: boolean;
  };
  fratraadt: boolean;
  rekkefolge: number;
  enhet?: Unit;
}

export interface Unit {
  organisasjonsnummer: string;
  organisasjonsform: OrganisationType;
  navn: string[];
  erSlettet: boolean;
  _links: {
    self: {
      href: string;
    };
  };
}

export interface OrganisationType {
  kode: string;
  beskrivelse: string;
  _links: {
    self: {
      href: string;
    };
  };
}

export const importRoles = (db: IDatabase) => {
  const parser = JSONStream.parse("*");
  const stream = fs.createReadStream(
    path.join(__dirname, "../../..", "data", "roller_2023-04-21T06-45-04.308061.json")
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

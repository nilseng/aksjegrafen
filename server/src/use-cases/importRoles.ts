import fs from "fs";
import JSONStream from "JSONStream";
import path from "path";
import { IDatabase } from "../database/databaseSetup";

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
  stream.pipe(parser).on("data", (chunk: UnitRoles) => {
    stream.destroy();
  });
  stream.on("end", () => {
    console.log("Stream ended");
  });
};

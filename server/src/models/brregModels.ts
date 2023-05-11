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

export type Year = 2024 | 2023 | 2022 | 2021 | 2020 | 2019 | 2018 | 2017 | 2016 | 2015;

export interface ICompany {
  _id: string;
  orgnr?: string;
  name: string;
  zipCode?: string;
  location?: string;
  countryCode?: string;
  shares?: { [key in Year]?: { total: number; [stockClass: string]: number } };
  investorCount?: { [key in Year]?: number };
  investmentCount?: { [key in Year]?: number };
}

export const isCompany = (o: any): o is ICompany => {
  return (
    !isOwnership(o) &&
    !isShareholder(o) &&
    o._id &&
    typeof o._id === "string" &&
    (!o.orgnr || typeof o.orgnr === "string") &&
    o.name &&
    typeof o.name === "string" &&
    (!o.zipCode || typeof o.zipCode === "string") &&
    (!o.location || typeof o.location === "string") &&
    (!o.countryCode || typeof o.countryCode === "string")
  );
};

export type IShareholder = ICompany & IPerson & { _id: string; id: string; kind: ShareholderType };

export const isShareholder = (o: any): o is IShareholder => {
  return (
    o &&
    o._id &&
    typeof o._id === "string" &&
    o.id &&
    typeof o.id === "string" &&
    (!o.orgnr || typeof o.orgnr === "string") &&
    o.name &&
    typeof o.name === "string" &&
    (!o.zipCode || typeof o.zipCode === "string") &&
    (!o.location || typeof o.location === "string") &&
    (!o.countryCode || typeof o.countryCode === "string") &&
    (!o.stocks || typeof o.stocks === "number") &&
    (o.kind === 0 || o.kind === 1 || o.kind === 2) &&
    isPerson(o)
  );
};

enum ShareholderType {
  COMPANY,
  PERSON,
  UNKNOWN,
}

export interface IPerson {
  name: string;
  yearOfBirth?: number;
  zipCode?: string;
  location?: string;
  countryCode?: string;
}

const isPerson = (o: any): o is IPerson => {
  return (
    o.name &&
    typeof o.name === "string" &&
    (!o.yearOfBirth || typeof o.yearOfBirth === "string" || typeof o.yearOfBirth === "number") &&
    (!o.zipCode || typeof o.zipCode === "string") &&
    (!o.location || typeof o.location === "string") &&
    (!o.countryCode || typeof o.countryCode === "string")
  );
};

export interface IOwnership {
  _id: string;
  orgnr: string;
  shareHolderId: string;
  shareholderOrgnr?: string;
  investor?: { company?: ICompany; shareholder: IShareholder };
  investment?: ICompany | null;
  holdings: {
    [year in Year]?: {
      total: number;
      [stockClass: string]: number;
    };
  };
}

export const isOwnership = (o: any): o is IOwnership => {
  return (
    o &&
    o._id &&
    typeof o._id === "string" &&
    o.orgnr &&
    typeof o.orgnr === "string" &&
    o.shareHolderId &&
    typeof o.shareHolderId === "string" &&
    o.holdings &&
    (!o.shareholderOrgnr || typeof o.shareholderOrgnr === "string") &&
    (!o.company || isCompany(o.company)) &&
    (!o.shareholder || isShareholder(o.shareholder))
  );
};

export enum GraphNodeLabel {
  Shareholder = "Shareholder",
  Company = "Company",
  Person = "Person",
  Unit = "Unit",
}

export interface GraphNode {
  labels: GraphNodeLabel[];
  properties: {
    uuid: string;
    name: string;
    orgnr?: string;
    shareholderId?: string;
    stocks?: {
      [year in Year]?: {
        total: number;
      };
    };
    location?: string;
    yearOfBirth?: string;
  };
  currentRoles?: CurrentRole[];
  skip?: GraphNodeSkip;
  sourceUuid?: string;
}

export enum CurrentRole {
  Investor = "Investor",
  Investment = "Investment",
  Actor = "Actor",
  Unit = "Unit",
}

export interface GraphNodeSkip {
  investors: number;
  investments: number;
  actors: number;
  units: number;
}

export interface GraphLink {
  source: GraphNode;
  target: GraphNode;
  properties: {
    year?: Year;
    share?: number;
    stocks?: number;
  };
  type: GraphLinkType;
}

export enum GraphLinkType {
  // Commented out link types do not exist in the graph and will throw an error if used in a GDS query
  OWNS = "OWNS",
  //ADOS = "ADOS",
  BEST = "BEST",
  BOBE = "BOBE",
  DAGL = "DAGL",
  DTPR = "DTPR",
  DTSO = "DTSO",
  EIKM = "EIKM",
  FFØR = "FFØR",
  HFOR = "HFOR",
  HLSE = "HLSE",
  //INNH = "INNH",
  KDEB = "KDEB",
  //KENK = "KENK",
  KIRK = "KIRK",
  KOMP = "KOMP",
  KONT = "KONT",
  //KTRF = "KTRF",
  LEDE = "LEDE",
  MEDL = "MEDL",
  NEST = "NEST",
  OBS = "OBS",
  OPMV = "OPMV",
  ORGL = "ORGL",
  REGN = "REGN",
  REPR = "REPR",
  REVI = "REVI",
  VARA = "VARA",
}

export enum FetchState {
  Idle = "Idle",
  Loading = "Loading",
  Success = "Success",
  Error = "Error",
}

export enum GraphType {
  Default = "Default",
  ShortestPath = "ShortestPath",
  AllPaths = "AllPaths",
}

export interface UserEvent {
  uuid?: string;
  orgnr?: string;
  type: UserEventType;
  createdAt?: Date;
}

export enum UserEventType {
  GraphLoad = "GraphLoad",
  InvestorTableLoad = "InvestorTableLoad",
  InvestmentTableLoad = "InvestmentTableLoad",
  RelationSourceLoad = "RelationSourceLoad",
  RelationTargetLoad = "RelationTargetLoad",
}

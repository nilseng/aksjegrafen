import { ObjectId } from "mongodb";

// Which years exist is data-driven (registry years 2015→present, see services/yearService.ts),
// so Year is a plain number rather than a hardcoded union that must be bumped every May.
export type Year = number;

export interface OwnershipRaw {
  orgnr: string;
  companyName: string;
  shareClass: string;
  shareholderName: string;
  yobOrOrgnr: string | undefined;
  zipLocation: string | undefined;
  countryCode: string;
  shareholderStocks: string | number;
  companyStocks: string | number;
}

export interface Ownership {
  _id?: ObjectId;
  orgnr: string;
  shareHolderId: string;
  shareholderOrgnr?: string | null;
  investor?: { company?: Company; shareholder?: Shareholder };
  investment?: Company | null;
  holdings: {
    [year in Year]?: {
      total: number;
      [stockClass: string]: number;
    };
  };
}

export type Shareholder = Partial<Company> & Partial<Person> & { id: string; kind: ShareholderType; name?: string };

export enum ShareholderType {
  COMPANY,
  PERSON,
  UNKNOWN,
}

export interface Company {
  _id?: ObjectId;
  orgnr: string;
  name: string;
  zipCode?: string;
  location?: string;
  countryCode?: string;
  shares: { [key in Year]?: { total: number; [stockClass: string]: number } };
  investorCount?: { [key in Year]?: number };
  investmentCount?: { [key in Year]?: number };
  suppressed?: boolean;
  suppressedSearch?: boolean;
  noindex?: boolean;
}

export interface Person {
  name: string;
  yearOfBirth?: number;
  zipCode?: string;
  location?: string;
  countryCode?: string;
  suppressed?: boolean;
  suppressedSearch?: boolean;
}

export interface BusinessCode {
  code: string;
  parentCode: string;
  level: number;
  name: string;
  shortName: string;
  notes: string;
}

export interface Role {
  type: string;
  orgnr: string;
  holder: {
    person?: {
      birthDate?: string;
      fornavn?: string;
      etternavn?: string;
    };
    unit?: {
      orgnr: string;
      organisasjonsform: string;
      navn: string;
    } & Partial<Company>;
  };
  company?: Company;
  shareholder?: Shareholder;
  suppressed?: boolean;
  suppressedSearch?: boolean;
}

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
  skip?: {
    investors: number;
    investments: number;
    actors: number;
    units: number;
  };
  currentRoles?: CurrentRole[];
}

export enum CurrentRole {
  Investor = "Investor",
  Investment = "Investment",
  Actor = "Actor",
  Unit = "Unit",
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
  // NB!: Need to be careful using UNKNOWN for the same reason
  UNKNOWN = "UNKNOWN",
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

// Aggregated ownership of an investor in a target company: effective share is the sum over
// all ownership chains of the product of the shares along each chain. directShare is the
// length-1 chain contribution, so effectiveShare - directShare = indirect ownership.
export interface IndirectOwnership {
  investor: GraphNode;
  effectiveShare: number;
  directShare: number;
  pathCount: number;
  minDepth: number;
}

// One ownership chain from an investor (first node) to the target company (last node).
// shares[i] is the share the node at position i holds in the node at position i + 1;
// product is the chain's contribution to the investor's effective share of the target.
export interface OwnershipChain {
  nodes: { uuid: string; name: string; orgnr?: string }[];
  shares: number[];
  product: number;
}

export interface OwnershipReport {
  company: { uuid: string; name: string; orgnr?: string };
  year: Year;
  minShare: number;
  generatedAt: string;
  investors: IndirectOwnership[];
  investorChains: { investor: GraphNode; effectiveShare: number; chains: OwnershipChain[] }[];
}

export enum OwnershipChangeType {
  New = "New",
  Exited = "Exited",
  Increased = "Increased",
  Decreased = "Decreased",
  Unchanged = "Unchanged",
}

// How one investor's direct stake in a company changed between two years. share/stocks hold
// the values for the compare year (previous) and the primary year (current); either side is
// undefined when the investor held no stake that year. Computed from MongoDB holdings, which
// cover all years (the graph only holds the currently imported year).
export interface OwnershipChange {
  investor: { shareholderId: string; name?: string; orgnr?: string; yearOfBirth?: number; location?: string };
  type: OwnershipChangeType;
  share: { previous?: number; current?: number };
  stocks: { previous?: number; current?: number };
}

export interface OwnershipChanges {
  company: { name: string; orgnr: string };
  year: Year;
  compareYear: Year;
  summary: { [type in OwnershipChangeType]: number };
  changes: OwnershipChange[];
}

export interface UserEvent {
  uuid?: string;
  orgnr?: string;
  type: UserEventType;
  createdAt: Date;
}

export enum UserEventType {
  GraphLoad = "GraphLoad",
  InvestorTableLoad = "InvestorTableLoad",
  InvestmentTableLoad = "InvestmentTableLoad",
  RelationSourceLoad = "RelationSourceLoad",
  RelationTargetLoad = "RelationTargetLoad",
  IndirectOwnershipLoad = "IndirectOwnershipLoad",
  OwnershipReportDownload = "OwnershipReportDownload",
  OwnershipChangesLoad = "OwnershipChangesLoad",
  FinancialsLoad = "FinancialsLoad",
  UnitInformationLoad = "UnitInformationLoad",
}

export enum ApiTier {
  Anonymous = "anonymous",
  Free = "free",
  Paid = "paid",
}

// API keys gate rate-limit tiers only — the data itself stays open to everyone.
// Paid keys are never rate limited; anonymous/free callers are.
export interface ApiKey {
  key: string;
  tier: ApiTier;
  name?: string;
  email?: string;
  note?: string;
  active: boolean;
  createdAt: Date;
  revokedAt?: Date;
}

/**
 * An entry in the suppression list, used to honor privacy requests (e.g. GDPR Art. 21
 * objections) without deleting the underlying register data. Entries are stored in the
 * database only and managed with the suppress CLI — identifying details must never be
 * committed to the repository.
 *
 * scope:
 *  - "search": hidden from name/orgnr search (in-app search and the search endpoints)
 *  - "all": additionally hidden from relation listings, graphs and direct lookups
 *  - "none": not hidden in-app; useful combined with noindex to only delist a page
 * noindex: pages whose path references the entry's orgnr are served with an
 * X-Robots-Tag noindex header so search engines drop them.
 */
export interface Suppression {
  _id?: ObjectId;
  type: "person" | "company";
  scope: SuppressionScope;
  noindex?: boolean;
  orgnr?: string;
  shareholderId?: string;
  name?: string;
  yearOfBirth?: number;
  reason?: string;
  createdAt: Date;
}

export type SuppressionScope = "search" | "all" | "none";

export const isOwnership = (o: any): o is Ownership => {
  return o.orgnr && typeof o.orgnr === "string" && o.shareHolderId && typeof o.shareHolderId === "string" && o.holdings;
};

export const isShareholder = (o: any): o is Shareholder => {
  return o.id && typeof o.id === "string" && (o.kind || o.kind === 0);
};

export const isCompany = (o: any): o is Company => {
  return o.orgnr && typeof o.orgnr === "string" && o.name && typeof o.name === "string";
};

export const isUserEvent = (o: any): o is UserEvent => {
  return o && o.type && Object.values(UserEventType).includes(o.type);
};

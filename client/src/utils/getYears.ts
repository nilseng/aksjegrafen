import { IOwnership, Year } from "../models/models";

export const getYears = (ownerships: IOwnership[]) => {
  const endYear = Math.max(...ownerships.map((o) => Math.max(...Object.keys(o.holdings).map((year) => +year))));
  const startYear = Math.min(...ownerships.map((o) => Math.min(...Object.keys(o.holdings).map((year) => +year))));
  return Array.from({ length: endYear - startYear + 1 }, (_, i) => endYear - i) as Year[];
};

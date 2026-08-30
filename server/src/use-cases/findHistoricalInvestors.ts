import { isNumber, mergeWith } from "lodash";
import { findCompanies, findOwnerships, findShareholdersByIds } from "../gateways/mongoDB/mongoDB.gateway";
import { Ownership } from "../models/models";

interface InvestorQuery {
  orgnr: string;
  year?: number;
  limit?: number;
  skip?: number;
}

/**
 * Investors in a company, plus how many rows were withheld because the holder is on the
 * suppression list. Callers that render a page use `withheld` to say that something was
 * omitted rather than silently claiming the company has no shareholders — see
 * use-cases/manageSuppressions.ts.
 */
export const findHistoricalInvestorsWithMeta = async (
  query: InvestorQuery
): Promise<{ investors: Ownership[]; withheld: number }> => {
  const ownerships = await findOwnerships(query);
  await resolveShareholders(ownerships);
  const visibleOwnerships = ownerships.filter(
    (o) => !o.investor?.shareholder?.suppressed && !o.investor?.company?.suppressed
  );
  return {
    investors: await mergeOwnerships({ ownerships: visibleOwnerships }),
    withheld: ownerships.length - visibleOwnerships.length,
  };
};

export const findHistoricalInvestors = async (query: InvestorQuery): Promise<Ownership[]> =>
  (await findHistoricalInvestorsWithMeta(query)).investors;

const resolveShareholders = async (ownerships: Ownership[]) => {
  const [shareholders, companies] = await Promise.all([
    findShareholdersByIds(ownerships.map((o) => o.shareHolderId)),
    findCompanies(ownerships.map((o) => o.orgnr)),
  ]);
  ownerships.forEach((o) => {
    o.investor = {
      shareholder: shareholders.find((s) => s.id === o.shareHolderId),
      company: companies.find((c) => c.orgnr === o.shareholderOrgnr),
    };
  });
};

const mergeOwnerships = async ({ ownerships }: { ownerships: Ownership[] }) => {
  const mergedOwnerships: Ownership[] = [];
  ownerships.forEach((o) => {
    if (!o.investor?.shareholder) mergedOwnerships.push(o);
    else {
      const match = mergedOwnerships.find(
        (m) =>
          m.investor?.shareholder &&
          m.investor.shareholder.name === o.investor?.shareholder?.name &&
          m.investor.shareholder.yearOfBirth === o.investor?.shareholder?.yearOfBirth
      );
      if (!match) mergedOwnerships.push(o);
      else {
        match.holdings = mergeWith(match.holdings, o.holdings, (val1, val2) => {
          if (isNumber(val1) && isNumber(val2)) {
            return val1 + val2;
          }
        });
      }
    }
  });
  return mergedOwnerships;
};

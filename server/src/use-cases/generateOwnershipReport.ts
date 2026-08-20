import { findIndirectInvestors, findOwnershipChains } from "../gateways/neo4j/neo4j.gateway";
import { OwnershipReport, Year } from "../models/models";

// The report ranks the top investors by effective share and documents the actual chains for
// the significant ones. Chain enumeration is per investor and gets expensive on widely held
// companies, so it is capped to owners above CHAIN_SHARE_THRESHOLD.
const INVESTOR_LIMIT = 25;
const CHAIN_SHARE_THRESHOLD = 0.05;
const CHAIN_OWNER_LIMIT = 15;
const CHAINS_PER_INVESTOR = 10;

export const generateOwnershipReport = async ({
  uuid,
  orgnr,
  year,
  minShare,
}: {
  uuid?: string;
  orgnr?: string;
  year: Year;
  minShare: number;
}): Promise<OwnershipReport | null> => {
  const { node, investors } = await findIndirectInvestors({
    uuid,
    orgnr,
    year,
    minShare,
    limit: INVESTOR_LIMIT,
    skip: 0,
  });
  if (!node) return null;

  const chainInvestors = investors
    .filter((ownership) => ownership.effectiveShare >= CHAIN_SHARE_THRESHOLD)
    .slice(0, CHAIN_OWNER_LIMIT);
  const investorChains = [];
  for (const ownership of chainInvestors) {
    const chains = await findOwnershipChains({
      investorUuid: ownership.investor.properties.uuid,
      targetUuid: node.properties.uuid,
      year,
      // Unlike the effective-share traversal, chain enumeration walks simple paths and
      // explodes with depth on broad structures, so bound it per investor: their shortest
      // chain plus a little slack covers the chains that matter.
      maxDepth: ownership.minDepth + 2,
      limit: CHAINS_PER_INVESTOR,
    });
    investorChains.push({ investor: ownership.investor, effectiveShare: ownership.effectiveShare, chains });
  }

  return {
    company: { uuid: node.properties.uuid, name: node.properties.name, orgnr: node.properties.orgnr },
    year,
    minShare,
    generatedAt: new Date().toISOString(),
    investors,
    investorChains,
  };
};

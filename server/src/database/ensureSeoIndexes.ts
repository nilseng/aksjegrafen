import { IDatabase } from "./mongoDB";
import { getLatestYear } from "../services/yearService";

/**
 * Indexes backing the server-rendered SEO pages. Idempotent, so it runs at every
 * boot (after the graph years are loaded, since the investorCount index is keyed
 * by the latest registry year — a new year's index is created on the first boot
 * after an import; stale ones are harmless and can be dropped manually).
 */
export const ensureSeoIndexes = async (db: IDatabase): Promise<void> => {
  const year = getLatestYear();
  await Promise.all([
    // Alphabet hubs: prefix filter + sort on name.
    db.companies.createIndex({ name: 1 }),
    // Priority sitemap + "største selskaper" hub: sort by shareholder count.
    db.companies.createIndex({ [`investorCount.${year}`]: -1, _id: 1 }),
    // Roles section on company pages.
    db.roles.createIndex({ orgnr: 1 }),
  ]);
  console.log(`SEO indexes ensured (investorCount year: ${year})`);
};

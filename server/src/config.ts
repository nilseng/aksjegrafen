import path from "path";

export const maxMemoryConsumption = 400_000_000;
export const requestTimeout = 25_000;

// Data dumps live in data/ at the repo root (gitignored, multi-GB). Paths are read
// lazily so dotenv has run by the time an entry point uses them; env overrides let a
// job point at a specific dump (e.g. BRREG_ROLES_FILE=roller_2026-05-23.json).
// Public origin used for canonical URLs, OG tags and the sitemap.
export const baseUrl = () => process.env.PUBLIC_BASE_URL || "https://aksjegrafen.com";

export const dataDir = () => process.env.DATA_DIR || path.join(__dirname, "../..", "data");
export const brregRolesFile = () => path.join(dataDir(), process.env.BRREG_ROLES_FILE || "roller.json.gz");
export const brregEntitiesFile = () => path.join(dataDir(), process.env.BRREG_ENTITIES_FILE || "enheter.json.gz");

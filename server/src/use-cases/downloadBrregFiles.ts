import fs from "fs";
import https from "https";
import { brregEntitiesFile, brregRolesFile } from "../config";

const ROLES_URL = "https://data.brreg.no/enhetsregisteret/api/roller/totalbestand";
const ENTITIES_URL = "https://data.brreg.no/enhetsregisteret/api/enheter/lastned";

/** Downloads the brreg roles dump (~130MB gzipped) to the configured data path. */
export const downloadBrregRoles = () => download(ROLES_URL, brregRolesFile());

/** Downloads the brreg entities dump to the configured data path. */
export const downloadBrregEntities = () => download(ENTITIES_URL, brregEntitiesFile());

const download = (url: string, filePath: string): Promise<void> =>
  new Promise((resolve, reject) => {
    console.log(`Downloading ${url} to ${filePath}...`);
    // Stream to a temp file and swap on success so a failed download never
    // clobbers the previous dump.
    const tmpPath = `${filePath}.download`;
    const request = https.get(url, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        download(res.headers.location, filePath).then(resolve, reject);
        return;
      }
      if (res.statusCode !== 200) {
        res.resume();
        reject(new Error(`Download of ${url} failed with status ${res.statusCode}`));
        return;
      }
      const file = fs.createWriteStream(tmpPath);
      res.pipe(file);
      file.on("finish", () => {
        file.close();
        fs.renameSync(tmpPath, filePath);
        const sizeMb = (fs.statSync(filePath).size / 1_000_000).toFixed(0);
        console.log(`Downloaded ${filePath} (${sizeMb} MB).`);
        resolve();
      });
      file.on("error", reject);
      res.on("error", reject);
    });
    request.on("error", reject);
  });

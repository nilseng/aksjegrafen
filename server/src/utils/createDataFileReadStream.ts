import fs from "fs";
import { Readable } from "stream";
import zlib from "zlib";

/**
 * Opens a data dump for streaming, transparently gunzipping it. Brreg serves the
 * dumps gzipped and the downloader stores them as-is; detection is by magic bytes
 * rather than extension so pre-existing plain .json files keep working.
 */
export const createDataFileReadStream = async (filePath: string): Promise<Readable> => {
  const fd = await fs.promises.open(filePath, "r");
  const { buffer } = await fd.read(Buffer.alloc(2), 0, 2, 0);
  await fd.close();
  const isGzipped = buffer[0] === 0x1f && buffer[1] === 0x8b;
  const stream = fs.createReadStream(filePath);
  return isGzipped ? stream.pipe(zlib.createGunzip()) : stream;
};

import { maxMemoryConsumption } from "../config";

export const isMaxMemoryExceeded = () => {
  return process.memoryUsage().rss > maxMemoryConsumption;
};

import { isEmpty } from "lodash";

export const buildQuery = (o?: { [key: string]: string | number | boolean | undefined }) => {
  if (!o || isEmpty(o)) return "";
  return `?${Object.keys(o)
    .map((key) => (o[key] || o[key] === false ? `${key}=${o[key]}` : ""))
    .filter((str) => !!str)
    .join("&")}`;
};

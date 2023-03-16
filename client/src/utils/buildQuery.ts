import { isEmpty } from "lodash";

export const buildQuery = (o?: { [key: string]: string | number | undefined }) => {
  if (!o || isEmpty(o)) return "";
  return `?${Object.keys(o)
    .map((key) => (o[key] ? `${key}=${o[key]}` : ""))
    .join("&")}`;
};

import { isEmpty } from "lodash";

export const buildQuery = (o?: { [key: string]: string | number | boolean | string[] | undefined }) => {
  if (!o || isEmpty(o)) return "";
  return `?${Object.keys(o)
    .map((key) => getParam({ key, value: o[key] }))
    .filter((str) => !!str)
    .join("&")}`;
};

const getParam = ({ key, value }: { key: string; value?: string | number | boolean | string[] }): string => {
  if (!value && value !== false) return "";
  if (Array.isArray(value)) return value.map((i) => `${key}=${i}`).join("&");
  return `${key}=${value}`;
};

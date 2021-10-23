import { isEmpty } from "lodash";

export const buildQuery = (o: {
  [key: string]: string | number | undefined;
}) => {
  let query = "";
  if (isEmpty(o)) return query;
  for (const key of Object.keys(o)) {
    if (!o[key]) continue;
    if (!query) query += "?";
    else query += "&";
    query += key + "=" + o[key];
  }
  return query;
};

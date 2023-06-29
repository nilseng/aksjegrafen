import { ICompany, IShareholder } from "../models/models";

export const getIdentifier = (entity: ICompany | IShareholder) => {
  return entity?.orgnr ?? (entity as IShareholder)?.id;
};

export const getBaseUrl = () =>
  window.location.hostname === "localhost"
    ? `http://${window.location.hostname}:${window.location.port}`
    : `https://${window.location.hostname}`;

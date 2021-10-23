import { ICompany, IShareholder } from "../models/models";

export const getIdentifier = (entity: ICompany | IShareholder) => {
  return entity?.orgnr ?? (entity as IShareholder)?.id;
};

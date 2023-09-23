import { GraphLinkType } from "../models/models";

export const getRoleLinkTypes = () => Object.values(GraphLinkType).filter((type) => type !== GraphLinkType.OWNS);

import { Driver as GraphDB, Node, Path, PathSegment } from "neo4j-driver";
import { Ownership, Relation, Role, ShareholderType } from "../models/models";

interface PathResult {
  records: [];
}

export const findShortestPath = async ({
  graphDB,
  fromOrgnr,
  fromShareholderId,
  toOrgnr,
}: {
  graphDB: GraphDB;
  fromOrgnr?: string;
  fromShareholderId?: string;
  toOrgnr: string;
}): Promise<Relation[] | null | undefined> => {
  if (!(fromOrgnr || fromShareholderId)) throw Error("Source orgnr or shareholder id must be defined.");

  const session = graphDB.session();

  const findShortestPathQuery = `
  MATCH ${
    fromOrgnr ? `(start:Company {orgnr: $fromOrgnr})` : `(start:Shareholder {id: $fromShareholderId})`
  }, (end:Company {orgnr: $toOrgnr})
  OPTIONAL MATCH path = shortestPath((start)-[r*]->(end))
  WHERE all(rel in r WHERE rel.year = 2022 OR rel.year IS NULL)
  RETURN path
  `;
  const res = await session.run(findShortestPathQuery, { fromOrgnr, fromShareholderId, toOrgnr });
  session.close();

  return res.records.length === 0 ? [] : mapPathToRelations(res.records[0].get("path"));
};

const mapPathToRelations = (path: Path): Relation[] => {
  return path?.segments?.map((segment) =>
    segment.relationship.type === "OWNS"
      ? { ownership: mapSegmentToOwnership(segment) }
      : { role: mapSegmentToRole(segment) }
  );
};

const mapSegmentToOwnership = (segment: PathSegment): Ownership => ({
  shareholderOrgnr: segment.start.properties.orgnr,
  shareHolderId: segment.start.properties.id,
  orgnr: segment.end.properties.orgnr,
  holdings: { 2022: { total: segment.relationship.properties.stocks } },
  investor: {
    shareholder: mapNodeToShareholder(segment.start),
    company: mapNodeToCompany(segment.start),
  },
  investment: mapNodeToCompany(segment.end),
});

const mapSegmentToRole = (segment: PathSegment): Role => ({
  type: segment.relationship.type,
  orgnr: segment.end.properties.orgnr,
  holder: {
    person: {
      fornavn: segment.start.properties.firstName,
      etternavn: segment.start.properties.lastName,
    },
    unit: {
      orgnr: segment.start.properties.orgnr,
      organisasjonsform: segment.start.properties.type,
      navn: segment.start.properties.name,
    },
  },
  shareholder: mapNodeToShareholder(segment.end),
  company: mapNodeToCompany(segment.end),
});

const mapNodeToShareholder = (node: Node) =>
  node.labels.find((l) => l === "Shareholder")
    ? { name: node.properties.name, id: node.properties.id, kind: ShareholderType.UNKNOWN }
    : undefined;

const mapNodeToCompany = (node: Node) =>
  node.labels.find((l) => l === "Company") ? { name: node.properties.name, orgnr: node.properties.orgnr } : undefined;

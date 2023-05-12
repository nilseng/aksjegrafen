import { Driver as GraphDB, Node, Path, PathSegment } from "neo4j-driver";
import { Ownership, Relation, Role, ShareholderType } from "../models/models";

interface PathResult {
  records: [];
}

export const findShortestPath = async ({
  graphDB,
  fromOrgnr,
  toOrgnr,
}: {
  graphDB: GraphDB;
  fromOrgnr: string;
  toOrgnr: string;
}): Promise<Relation[] | null | undefined> => {
  const session = graphDB.session();

  const findShortestPathQuery = `
  MATCH (start:Company {orgnr: "${fromOrgnr}"}), (end:Company {orgnr: "${toOrgnr}"})
  OPTIONAL MATCH path = shortestPath((start)-[*]->(end))
  RETURN path
  `;
  const res = await session.run(findShortestPathQuery);
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
  holdings: { 2021: { total: segment.relationship.properties.stocks } },
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

import dotenv from "dotenv";
import neo4j, { auth } from "neo4j-driver";
dotenv.config();

export const graphDB = neo4j.driver(
  process.env.NEO4J_URL!,
  auth.basic(process.env.NEO4J_USERNAME!, process.env.NEO4J_PWD!)
);

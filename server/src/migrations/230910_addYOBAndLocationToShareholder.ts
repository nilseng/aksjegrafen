import { Driver } from "neo4j-driver";
import { IDatabase } from "../database/mongoDB";

export const addYOBAndLocationToShareholder = async ({ mongoDB, graphDB }: { mongoDB: IDatabase; graphDB: Driver }) => {
  const shareholderCount = await mongoDB.shareholders.countDocuments();

  const session = graphDB.session();

  const chunkSize = 50_000;

  for (let i = 0; i < shareholderCount; i += chunkSize) {
    console.info(`Updating shareholders ${i} to ${i + chunkSize}.`);

    const shareholders = await mongoDB.shareholders.find().skip(i).limit(chunkSize).toArray();
    console.info(`Loaded ${shareholders.length} shareholders.`);

    const params = { shareholders };

    const createShareholdersQuery = `
        UNWIND $shareholders as shareholder

        WITH shareholder
        WHERE shareholder.id IS NOT NULL
        MATCH (s:Shareholder {id: shareholder.id})
        SET s.year_of_birth = shareholder.yearOfBirth, s.location = shareholder.location
        `;

    await session.executeWrite((t) => t.run(createShareholdersQuery, params));
    console.info("Created shareholder nodes.");
  }

  console.info(`Updated ${shareholderCount} shareholders.`);

  await session.close();
};

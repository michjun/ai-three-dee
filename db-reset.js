import { MongoClient } from "mongodb";
import "dotenv/config";

async function main() {
  console.log("resetting db...");
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(process.env.MONGODB_DB);

    const existingCollections = (await db.listCollections().toArray()).map(
      (collection) => collection.name
    );
    for (const collection of existingCollections) {
      console.log(`Dropping collection ${collection}...`);
      // drop existing collections
      await db.collection(collection).drop();
    }

    const collections = ["creations", "chatthreads"];
    for (const collection of collections) {
      console.log(`Creating collection ${collection}...`);
      // recreate the collection
      // if you have any specific options for the collection, add them here
      await db.createCollection(collection);
    }
    console.log("Successfully reset MongoDB collections");

    console.log("Backfill example data...");
    const response = await fetch(
      "https://3dgenie.xyz/api/creations?useAsExample=true",
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const sampleData = (await response.json()).data;
    await db
      .collection("creations")
      .insertMany(sampleData.map(({ _id, ...attrs }) => attrs));
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

main().catch(console.error);

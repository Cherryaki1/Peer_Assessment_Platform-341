const { MongoClient } = require("mongodb");
require("dotenv").config({path: "./config.env"})

async function main() {
  const db = process.env.ATLAS_URI;
  const client = new MongoClient(db);

  try {
    await client.connect();
  } catch(e) {
    console.error(e);
  } finally {
    await client.close();
  }

}
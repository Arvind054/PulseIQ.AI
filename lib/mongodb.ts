import {MongoClient} from "mongodb";

const DB_URL = process.env.DB_URL!;

const client = new MongoClient(DB_URL);
await client.connect();

const db = await client.db();
export default db;
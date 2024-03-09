import dotenv from "dotenv";
dotenv.config();
import { MongoClient, Db } from 'mongodb';
/**
 * Singleton instance
 */
let database: Db;

async function getDbInstance(): Promise<Db> {
    if (database) {
        return database;
    }
    const client: MongoClient = new MongoClient(`${process.env.MONGO_HOST}`);
    await client.connect();
    database = client.db(`${process.env.MONGO_DATABASE}`);
    return database;
}

export default getDbInstance;

/* export default async (): Promise<Db> => {
    if (database) {
        return database;
    }
    const client: MongoClient = new MongoClient(`${process.env.MONGO_HOST}`);
    await client.connect();
    database = client.db(`${process.env.MONGO_DATABASE}`);
    return database;
} */
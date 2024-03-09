import { Collection } from "mongodb";
import getDbInstance from "../db";
import Resident from "../models/resident";

const COLLECTION = "residents";

async function getResidentsCollection(): Promise<Collection> {
    const db = await getDbInstance();
    const residents = db.collection(COLLECTION);
    return residents;
}

async function getResident(wallet: string): Promise<Resident | null> {
    const collection = await getResidentsCollection();
    const query = { wallet: new RegExp(wallet, "i") };
    const doc = await collection.findOne(query);
    if (!doc) {
        return null;
    }
    return new Resident(doc.wallet, doc.name, doc.phone, doc.email, doc.profile);
}

async function addResident(resident: Resident): Promise<Resident> {
    const collection = await getResidentsCollection();
    const result = await collection.insertOne(resident);
    resident._id = result.insertedId;
    return resident;
}

async function updateResident(wallet: string, data: Resident): Promise<number> {
    const collection = await getResidentsCollection();
    const filter = { wallet: new RegExp(wallet, "i") };
    const updateDoc = { $set: data };
    const options = { upsert: false };
    const result = await collection.updateOne(filter, updateDoc, options);
    return result.modifiedCount;
}

async function deleteResident(wallet: string): Promise<number> {
    const collection = await getResidentsCollection();
    const filter = { wallet: new RegExp(wallet, "i") };
    const result = await collection.deleteOne(filter);
    return result.deletedCount;
}

export default { getResident, addResident, updateResident, deleteResident };
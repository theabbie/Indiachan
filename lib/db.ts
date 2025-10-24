import clientPromise from './mongodb';
import { ObjectId, Binary } from 'mongodb';

let db: any;

async function getDb() {
  if (!db) {
    const client = await clientPromise;
    db = client.db(process.env.MONGODB_DB || 'indiachan');
  }
  return db;
}

export { getDb, ObjectId, Binary };

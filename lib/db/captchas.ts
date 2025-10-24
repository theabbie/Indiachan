import { getDb, ObjectId } from '../db';

async function getCollection() {
  const database = await getDb();
  return database.collection('captcha');
}

export const Captchas = {
  async findOne(id: string) {
    const db = await getCollection();
    return db.findOne({ '_id': new ObjectId(id) });
  },

  async insertOne(answer: string) {
    const db = await getCollection();
    return db.insertOne({
      'answer': answer,
      'expireAt': new Date()
    });
  },

  async findOneAndDelete(id: string, answer: string) {
    const db = await getCollection();
    return db.findOneAndDelete({
      '_id': new ObjectId(id),
      'answer': answer
    });
  },

  async deleteExpired() {
    const db = await getCollection();
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return db.deleteMany({
      'expireAt': {
        '$lt': fiveMinutesAgo
      }
    });
  }
};

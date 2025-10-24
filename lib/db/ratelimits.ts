import { getDb } from '../db';

async function getCollection() {
  const database = await getDb();
  return database.collection('ratelimit');
}

export const Ratelimits = {
  async resetQuota(identifier: string, action: string) {
    const db = await getCollection();
    return db.deleteOne({ '_id': `${identifier}-${action}` });
  },

  async incrementQuota(identifier: string, action: string, amount: number, ttl: number) {
    const db = await getCollection();
    const now = new Date();
    const expireAt = new Date(now.getTime() + ttl * 1000);
    const id = `${identifier}-${action}`;
    
    const existing = await db.findOne({ '_id': id });
    
    if (!existing || existing.expireAt < now) {
      try {
        await db.deleteOne({ '_id': id });
        await db.insertOne({
          '_id': id,
          'sequence_value': amount,
          'expireAt': expireAt
        });
        return amount;
      } catch (error: any) {
        if (error.code === 11000) {
          const doc = await db.findOne({ '_id': id });
          return doc?.sequence_value || amount;
        }
        throw error;
      }
    }
    
    const result = await db.findOneAndUpdate(
      { '_id': id },
      { '$inc': { 'sequence_value': amount } },
      { 'returnDocument': 'after' }
    );
    
    return result?.sequence_value || amount;
  },

  async deleteExpired() {
    const db = await getCollection();
    return db.deleteMany({
      'expireAt': {
        '$lt': new Date()
      }
    });
  }
};

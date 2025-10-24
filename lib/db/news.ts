import { getDb, ObjectId } from '../db';

async function getCollection() {
  const database = await getDb();
  return database.collection('news');
}

export const News = {
  async find(limit: number = 0) {
    const db = await getCollection();
    let query = db.find({}).sort({ '_id': -1 });
    if (limit > 0) {
      query = query.limit(limit);
    }
    return query.toArray();
  },

  async findOne(id: string) {
    const db = await getCollection();
    return db.findOne({ '_id': new ObjectId(id) });
  },

  async updateOne(id: string, title: string, raw: string, markdown: string) {
    const db = await getCollection();
    return db.updateOne({
      '_id': new ObjectId(id)
    }, {
      '$set': {
        'title': title,
        'message.raw': raw,
        'message.markdown': markdown,
        'edited': new Date()
      }
    });
  },

  async insertOne(news: any) {
    const db = await getCollection();
    return db.insertOne(news);
  },

  async deleteMany(ids: string[]) {
    const db = await getCollection();
    return db.deleteMany({
      '_id': {
        '$in': ids.map(id => new ObjectId(id))
      }
    });
  },

  async deleteAll() {
    const db = await getCollection();
    return db.deleteMany({});
  }
};

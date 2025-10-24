import { getDb, ObjectId } from '../db';

async function getCollection() {
  const database = await getDb();
  return database.collection('custompages');
}

export const CustomPages = {
  async find(board: string, limit: number = 0) {
    const db = await getCollection();
    let query = db.find({ 'board': board }).sort({ '_id': -1 });
    if (limit > 0) {
      query = query.limit(limit);
    }
    return query.toArray();
  },

  async findOne(board: string, page: string) {
    const db = await getCollection();
    return db.findOne({
      'board': board,
      'page': page
    });
  },

  async findOneId(id: string, board: string) {
    const db = await getCollection();
    return db.findOne({
      '_id': new ObjectId(id),
      'board': board
    });
  },

  async boardCount(board: string) {
    const db = await getCollection();
    return db.countDocuments({
      'board': board
    });
  },

  async insertOne(custompage: any) {
    const db = await getCollection();
    return db.insertOne(custompage);
  },

  async findOneAndUpdate(id: string, board: string, page: string, title: string, raw: string, markdown: string, edited: Date) {
    const db = await getCollection();
    return db.findOneAndUpdate({
      '_id': new ObjectId(id),
      'board': board
    }, {
      '$set': {
        'page': page,
        'title': title,
        'message.raw': raw,
        'message.markdown': markdown,
        'edited': edited
      }
    }, {
      returnDocument: 'before'
    });
  },

  async deleteMany(pages: string[], board: string) {
    const db = await getCollection();
    return db.deleteMany({
      'page': {
        '$in': pages
      },
      'board': board
    });
  },

  async deleteBoard(board: string) {
    const db = await getCollection();
    return db.deleteMany({
      'board': board
    });
  },

  async deleteAll() {
    const db = await getCollection();
    return db.deleteMany({});
  }
};

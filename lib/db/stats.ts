import { getDb } from '../db';

async function getCollection() {
  const database = await getDb();
  return database.collection('poststats');
}

export const Stats = {
  async updateOne(board: string, ip: string, thread: boolean) {
    const db = await getCollection();
    return db.updateOne({
      'board': board,
      'hour': new Date().getHours()
    }, {
      '$inc': {
        'pph': 1,
        'tph': thread ? 1 : 0
      },
      '$addToSet': {
        'ips': ip
      }
    }, {
      'upsert': true
    });
  },

  async getHourPosts(board: string) {
    const db = await getCollection();
    return db.findOne({
      'board': board,
      'hour': new Date().getHours()
    }, {
      'projection': {
        '_id': 0,
        'pph': 1,
        'tph': 1
      }
    });
  },

  async resetStats() {
    const db = await getCollection();
    return db.updateMany({
      'hour': new Date().getHours()
    }, {
      '$set': {
        'ips': [],
        'pph': 0,
        'tph': 0,
      }
    });
  },

  async deleteBoard(board: string) {
    const db = await getCollection();
    return db.deleteMany({
      'board': board
    });
  }
};

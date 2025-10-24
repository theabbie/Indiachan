import { getDb, ObjectId } from '../db';

async function getCollection() {
  const database = await getDb();
  return database.collection('bans');
}

export const Bans = {
  async find(ip: any, board: string) {
    const db = await getCollection();
    let ipQuery;
    if (typeof ip === 'object') {
      ipQuery = {
        '$in': [
          ip.cloak,
          ip.cloak.split('.').slice(0, 2).join('.'),
          ip.cloak.split('.').slice(0, 1).join('.'),
        ],
      };
    } else {
      ipQuery = ip;
    }
    return db.find({
      'ip.cloak': ipQuery,
      'board': {
        '$in': [board, null]
      }
    }).toArray();
  },

  async insertOne(ban: any) {
    const db = await getCollection();
    return db.insertOne(ban);
  },

  async insertMany(bans: any[]) {
    const db = await getCollection();
    return db.insertMany(bans);
  },

  async removeMany(board: string, ids: string[]) {
    const db = await getCollection();
    return db.deleteMany({
      'board': board,
      '_id': {
        '$in': ids.map(id => new ObjectId(id))
      },
    });
  },

  async deleteBoard(board: string) {
    const db = await getCollection();
    return db.deleteMany({
      'board': board
    });
  },

  async denyAppeals(ids: string[]) {
    const db = await getCollection();
    return db.updateMany({
      '_id': {
        '$in': ids.map(id => new ObjectId(id))
      }
    }, {
      '$set': {
        'appeal': null,
        'seen': true
      }
    });
  },

  async editDuration(ids: string[], duration: number) {
    const db = await getCollection();
    const expireAt = duration > 0 ? new Date(Date.now() + duration) : null;
    return db.updateMany({
      '_id': {
        '$in': ids.map(id => new ObjectId(id))
      }
    }, {
      '$set': {
        'expireAt': expireAt
      }
    });
  },

  async editReason(ids: string[], reason: string) {
    const db = await getCollection();
    return db.updateMany({
      '_id': {
        '$in': ids.map(id => new ObjectId(id))
      }
    }, {
      '$set': {
        'reason': reason
      }
    });
  }
};

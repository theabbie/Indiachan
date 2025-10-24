import { getDb, Binary } from '../db';

async function getCollection() {
  const database = await getDb();
  return database.collection('boards');
}

export const Boards = {
  async findOne(name: string) {
    const db = await getCollection();
    const board = await db.findOne({ '_id': name });
    if (board && board.staff) {
      for (let staff in board.staff) {
        board.staff[staff].permissions = board.staff[staff].permissions.toString('base64');
      }
    }
    return board;
  },

  async find(filter: any = {}, skip: number = 0, limit: number = 0) {
    const db = await getCollection();
    return db.find(filter).skip(skip).limit(limit).toArray();
  },

  async insertOne(data: any) {
    const db = await getCollection();
    return db.insertOne(data);
  },

  async updateOne(board: string, update: any) {
    const db = await getCollection();
    return db.updateOne({ '_id': board }, update);
  },

  async deleteOne(board: string) {
    const db = await getCollection();
    return db.deleteOne({ '_id': board });
  },

  async addStaff(board: string, username: string, permissions: any, setOwner: boolean = false) {
    const db = await getCollection();
    const update: any = {
      '$set': {
        [`staff.${username}`]: {
          'permissions': Binary.createFromBase64(permissions),
          'addedDate': new Date(),
        },
      },
    };
    if (setOwner === true) {
      update['$set']['owner'] = username;
    }
    return db.updateOne({ '_id': board }, update);
  },

  async removeStaff(board: string, usernames: string[]) {
    const db = await getCollection();
    const unsetObject = usernames.reduce((acc: any, username) => {
      acc[`staff.${username}`] = '';
      return acc;
    }, {});
    return db.updateOne({ '_id': board }, { '$unset': unsetObject });
  },

  async getAbandoned(duration: number) {
    const db = await getCollection();
    const cutoffDate = new Date(Date.now() - duration * 24 * 60 * 60 * 1000);
    return db.find({
      'lastPostTimestamp': {
        '$lt': cutoffDate
      }
    }).toArray();
  },

  async unlistMany(boards: string[]) {
    const db = await getCollection();
    return db.updateMany({
      '_id': {
        '$in': boards
      }
    }, {
      '$set': {
        'settings.unlistedLocal': true
      }
    });
  },

  async updateSettings(board: string, settings: any) {
    const db = await getCollection();
    const setObject: any = {};
    for (const key in settings) {
      setObject[`settings.${key}`] = settings[key];
    }
    return db.updateOne({ '_id': board }, { '$set': setObject });
  }
};
